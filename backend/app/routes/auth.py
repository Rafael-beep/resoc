from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.utils.file_uploader import save_uploaded_file

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'error': 'Nom d\'utilisateur et mot de passe requis.'}), 400

    try:
        user = User.query.filter_by(username=username).first()
    except Exception as e:
        # En cas d'absence de tables ou de problème de connexion BDD, recréer les tables
        db.create_all()
        user = User.query.filter_by(username=username).first()

    if not user:
        # Si le compte admin par défaut n'existe pas encore, le créer immédiatement
        if username == 'admin' and password in ['AdminPassword123!', 'admin']:
            admin = User(
                username='admin',
                email='admin@resoc.local',
                first_name='Admin',
                last_name='Système',
                is_admin=True,
                is_active=True
            )
            admin.set_password(password)
            db.session.add(admin)
            db.session.commit()
            user = admin
        else:
            return jsonify({'error': 'Identifiants invalides.'}), 401

    if not user.check_password(password):
        return jsonify({'error': 'Identifiants invalides.'}), 401

    if not user.is_active:
        return jsonify({'error': 'Ce compte a été désactivé par l\'administrateur.'}), 403

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Connexion réussie',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_active:
        return jsonify({'error': 'Utilisateur introuvable ou inactif'}), 404
    return jsonify({'user': user.to_dict()}), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Utilisateur introuvable'}), 404

    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    email = request.form.get('email')

    if first_name is not None:
        user.first_name = first_name.strip()
    if last_name is not None:
        user.last_name = last_name.strip()
    if email is not None and email.strip() != user.email:
        existing = User.query.filter_by(email=email.strip()).first()
        if existing:
            return jsonify({'error': 'Cet email est déjà utilisé'}), 400
        user.email = email.strip()

    if 'avatar' in request.files:
        try:
            avatar_url, _ = save_uploaded_file(request.files['avatar'], subfolder='avatars')
            if avatar_url:
                user.avatar_url = avatar_url
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

    db.session.commit()
    return jsonify({'message': 'Profil mis à jour', 'user': user.to_dict()}), 200

@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json() or {}
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({'error': 'Veuillez remplir l\'ancien et le nouveau mot de passe'}), 400

    if not user.check_password(old_password):
        return jsonify({'error': 'L\'ancien mot de passe est incorrect'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'Le nouveau mot de passe doit faire au moins 6 caractères'}), 400

    user.set_password(new_password)
    db.session.commit()
    return jsonify({'message': 'Mot de passe modifié avec succès'}), 200
