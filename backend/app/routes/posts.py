from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.post import Post
from app.models.media import PostMedia
from app.models.comment import Comment
from app.models.reaction import Reaction
from app.utils.file_uploader import save_uploaded_file

posts_bp = Blueprint('posts', __name__, url_prefix='/api/posts')

MAX_MEDIA_PER_POST = 10

@posts_bp.route('', methods=['GET'])
@jwt_required()
def get_posts():
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    pagination = Post.query.order_by(Post.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    posts = [p.to_dict(current_user_id=user_id) for p in pagination.items]

    return jsonify({
        'posts': posts,
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages
    }), 200

@posts_bp.route('', methods=['POST'])
@jwt_required()
def create_post():
    user_id = int(get_jwt_identity())
    content = request.form.get('content', '').strip()
    files = request.files.getlist('media')

    # Vérification de la limite de 10 éléments médias max par publication
    if len(files) > MAX_MEDIA_PER_POST:
        return jsonify({
            'error': f'Limite dépassée : vous ne pouvez pas ajouter plus de {MAX_MEDIA_PER_POST} médias par publication.'
        }), 400

    if not content and not files:
        return jsonify({'error': 'La publication ne peut pas être vide (texte ou médias requis).'}), 400

    new_post = Post(user_id=user_id, content=content)
    db.session.add(new_post)
    db.session.flush()  # Récupérer new_post.id

    saved_media_list = []
    for idx, file_obj in enumerate(files):
        if file_obj and file_obj.filename != '':
            try:
                rel_url, media_type = save_uploaded_file(file_obj, subfolder='posts')
                if rel_url:
                    post_media = PostMedia(
                        post_id=new_post.id,
                        file_path=rel_url,
                        media_type=media_type,
                        order_index=idx
                    )
                    db.session.add(post_media)
                    saved_media_list.append(post_media)
            except ValueError as err:
                db.session.rollback()
                return jsonify({'error': str(err)}), 400

    db.session.commit()
    return jsonify({
        'message': 'Publication créée avec succès',
        'post': new_post.to_dict(current_user_id=user_id)
    }), 201

@posts_bp.route('/<int:post_id>', methods=['GET'])
@jwt_required()
def get_post_detail(post_id):
    user_id = int(get_jwt_identity())
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Publication introuvable'}), 404
    return jsonify({'post': post.to_dict(current_user_id=user_id)}), 200

@posts_bp.route('/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    user_id = int(get_jwt_identity())
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Publication introuvable'}), 404

    current_user = User.query.get(user_id)
    if post.user_id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Vous n\'avez pas la permission de supprimer cette publication.'}), 403

    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Publication supprimée avec succès'}), 200

@posts_bp.route('/<int:post_id>/reactions', methods=['POST'])
@jwt_required()
def toggle_reaction(post_id):
    user_id = int(get_jwt_identity())
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Publication introuvable'}), 404

    data = request.get_json() or {}
    reaction_type = data.get('reaction_type', 'like')

    existing = Reaction.query.filter_by(post_id=post_id, user_id=user_id).first()

    if existing:
        if existing.reaction_type == reaction_type:
            # Retirer la réaction
            db.session.delete(existing)
            db.session.commit()
            return jsonify({'message': 'Réaction retirée', 'user_reaction': None}), 200
        else:
            # Mettre à jour la réaction
            existing.reaction_type = reaction_type
            db.session.commit()
            return jsonify({'message': 'Réaction mise à jour', 'user_reaction': reaction_type}), 200
    else:
        # Ajouter nouvelle réaction
        new_reaction = Reaction(post_id=post_id, user_id=user_id, reaction_type=reaction_type)
        db.session.add(new_reaction)
        db.session.commit()
        return jsonify({'message': 'Réaction ajoutée', 'user_reaction': reaction_type}), 201

@posts_bp.route('/<int:post_id>/comments', methods=['GET'])
@jwt_required()
def get_comments(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Publication introuvable'}), 404

    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.asc()).all()
    return jsonify({'comments': [c.to_dict() for c in comments]}), 200

@posts_bp.route('/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(post_id):
    user_id = int(get_jwt_identity())
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Publication introuvable'}), 404

    data = request.get_json() or {}
    content = data.get('content', '').strip()
    if not content:
        return jsonify({'error': 'Le commentaire ne peut pas être vide.'}), 400

    comment = Comment(post_id=post_id, user_id=user_id, content=content)
    db.session.add(comment)
    db.session.commit()

    return jsonify({'message': 'Commentaire ajouté', 'comment': comment.to_dict()}), 201

@posts_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user_id = int(get_jwt_identity())
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'error': 'Commentaire introuvable'}), 404

    current_user = User.query.get(user_id)
    if comment.user_id != user_id and comment.post.user_id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Permission refusée pour supprimer ce commentaire'}), 403

    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Commentaire supprimé'}), 200
