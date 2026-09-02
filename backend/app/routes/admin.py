from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.user import User
from app.utils.decorators import admin_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/users', methods=['GET'])
@admin_required()
def get_all_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200

@admin_bp.route('/users', methods=['POST'])
@admin_required()
def create_user():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    is_admin = bool(data.get('is_admin', False))

    if not username or not email or not password:
        return jsonify({'error': 'Nom d\'utilisateur, email et mot de passe requis.'}), 400

    if len(username) < 3:
        return jsonify({'error': 'Le nom d\'utilisateur doit contenir au moins 3 caractères.'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Le mot de passe doit contenir au moins 6 caractères.'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Ce nom d\'utilisateur est déjà pris.'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Cet email est déjà enregistré.'}), 400

    # Limite indicative à 15 utilisateurs sur le réseau privé
    current_count = User.query.count()
    if current_count >= 20:
        return jsonify({'warning': 'Remarque : Le quota recommandé de 15 utilisateurs est dépassé.'}), 200

    new_user = User(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        is_admin=is_admin,
        is_active=True
    )
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'message': 'Compte utilisateur créé avec succès par l\'administrateur.',
        'user': new_user.to_dict()
    }), 201

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required()
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Utilisateur introuvable.'}), 404

    data = request.get_json() or {}
    if 'first_name' in data:
        user.first_name = data['first_name'].strip()
    if 'last_name' in data:
        user.last_name = data['last_name'].strip()
    if 'email' in data:
        new_email = data['email'].strip()
        if new_email != user.email:
            if User.query.filter_by(email=new_email).first():
                return jsonify({'error': 'Cet email est déjà utilisé.'}), 400
            user.email = new_email
    if 'is_admin' in data:
        user.is_admin = bool(data['is_admin'])

    db.session.commit()
    return jsonify({'message': 'Utilisateur mis à jour avec succès.', 'user': user.to_dict()}), 200

@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['PUT'])
@admin_required()
def toggle_user_status(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Utilisateur introuvable.'}), 404

    user.is_active = not user.is_active
    db.session.commit()
    return jsonify({
        'message': f"Le compte de {user.username} a été {'activé' if user.is_active else 'désactivé'}.",
        'user': user.to_dict()
    }), 200

@admin_bp.route('/users/<int:user_id>/reset-password', methods=['PUT'])
@admin_required()
def reset_user_password(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Utilisateur introuvable.'}), 404

    data = request.get_json() or {}
    new_password = data.get('new_password', '').strip()

    if not new_password or len(new_password) < 6:
        return jsonify({'error': 'Le mot de passe doit faire au moins 6 caractères.'}), 400

    user.set_password(new_password)
    db.session.commit()
    return jsonify({'message': f'Le mot de passe de {user.username} a été réinitialisé.'}), 200

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required()
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Utilisateur introuvable.'}), 404

    if user.is_admin and User.query.filter_by(is_admin=True).count() <= 1:
        return jsonify({'error': 'Impossible de supprimer le dernier administrateur du système.'}), 400

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Utilisateur supprimé avec succès.'}), 200
