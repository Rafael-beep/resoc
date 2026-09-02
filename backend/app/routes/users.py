from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.post import Post

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('', methods=['GET'])
@jwt_required()
def get_directory():
    active_users = User.query.filter_by(is_active=True).order_by(User.first_name.asc(), User.username.asc()).all()
    return jsonify({'users': [u.to_dict() for u in active_users]}), 200

@users_bp.route('/<string:username>', methods=['GET'])
@jwt_required()
def get_user_profile(username):
    current_user_id = int(get_jwt_identity())
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'Membre introuvable.'}), 404

    user_posts = Post.query.filter_by(user_id=user.id).order_by(Post.created_at.desc()).all()

    return jsonify({
        'user': user.to_dict(),
        'posts': [p.to_dict(current_user_id=current_user_id) for p in user_posts]
    }), 200
