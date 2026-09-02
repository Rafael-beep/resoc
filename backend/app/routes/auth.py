import os
import json
from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from app.extensions import db
from app.utils.file_uploader import save_uploaded_file, save_to_google_drive

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/test-drive', methods=['GET'])
def test_drive():
    google_folder_id = os.environ.get('GOOGLE_DRIVE_FOLDER_ID')
    google_creds = os.environ.get('GOOGLE_CREDENTIALS_JSON')

    if not google_creds:
        return jsonify({'status': 'error', 'message': 'GOOGLE_CREDENTIALS_JSON non configuré sur Render'}), 400

    try:
        creds_dict = json.loads(google_creds)
        if 'private_key' in creds_dict and isinstance(creds_dict['private_key'], str):
            creds_dict['private_key'] = creds_dict['private_key'].replace('\\n', '\n')

        from google.oauth2 import service_account
        from googleapiclient.discovery import build
        import io
        from googleapiclient.http import MediaIoBaseUpload

        credentials = service_account.Credentials.from_service_account_info(
            creds_dict,
            scopes=['https://www.googleapis.com/auth/drive']
        )
        drive_service = build('drive', 'v3', credentials=credentials)

        # Test upload d'un petit fichier texte
        file_metadata = {
            'name': 'test_resoc.txt',
            'parents': [google_folder_id.strip()] if google_folder_id else []
        }
        media = MediaIoBaseUpload(io.BytesIO(b'Test connexion Resoc Drive'), mimetype='text/plain')

        drive_file = drive_service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, webViewLink',
            supportsAllDrives=True
        ).execute()

        file_id = drive_file.get('id')

        drive_service.permissions().create(
            fileId=file_id,
            body={'type': 'anyone', 'role': 'reader'},
            supportsAllDrives=True
        ).execute()

        return jsonify({
            'status': 'success',
            'message': 'Connexion Google Drive REUSSIE !',
            'file_id': file_id,
            'folder_id': google_folder_id
        })
    except Exception as e:
        import traceback
        return jsonify({
            'status': 'error',
            'error_details': str(e),
            'traceback': traceback.format_exc()
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Nom d\'utilisateur et mot de passe requis'}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Identifiants invalides'}), 401

    if not user.is_active:
        return jsonify({'error': 'Compte désactivé. Veuillez contacter un administrateur.'}), 403

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'token': access_token,
        'user': user.to_dict()
    })

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if not user or not user.is_active:
        return jsonify({'error': 'Utilisateur introuvable ou inactif'}), 404

    return jsonify({'user': user.to_dict()})

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if not user:
        return jsonify({'error': 'Utilisateur introuvable'}), 404

    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    email = request.form.get('email')
    bio = request.form.get('bio')

    if first_name is not None:
        user.first_name = first_name.strip()
    if last_name is not None:
        user.last_name = last_name.strip()
    if bio is not None:
        user.bio = bio.strip()
    if email is not None and email.strip() != user.email:
        existing = User.query.filter_by(email=email.strip()).first()
        if existing:
            return jsonify({'error': 'Cette adresse e-mail est déjà utilisée'}), 400
        user.email = email.strip()

    if 'avatar' in request.files:
        avatar_file = request.files['avatar']
        if avatar_file.filename != '':
            try:
                avatar_url, _ = save_uploaded_file(avatar_file, subfolder='avatars')
                if avatar_url:
                    user.avatar_url = avatar_url
            except ValueError as err:
                return jsonify({'error': str(err)}), 400

    db.session.commit()
    return jsonify({
        'message': 'Profil mis à jour avec succès',
        'user': user.to_dict()
    })

@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    data = request.get_json() or {}
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({'error': 'Ancien et nouveau mot de passe requis'}), 400

    if not user.check_password(old_password):
        return jsonify({'error': 'Ancien mot de passe incorrect'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'Le nouveau mot de passe doit contenir au moins 6 caractères'}), 400

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'message': 'Mot de passe modifié avec succès'})
