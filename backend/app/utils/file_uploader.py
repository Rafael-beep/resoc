import os
import uuid
import json
import io
import traceback
from werkzeug.utils import secure_filename
from flask import current_app
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import cloudinary
import cloudinary.uploader

ALLOWED_PHOTO_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'webm', 'mov', 'avi'}
ALLOWED_EXTENSIONS = ALLOWED_PHOTO_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_media_type(filename):
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    if ext in ALLOWED_PHOTO_EXTENSIONS:
        return 'photo'
    elif ext in ALLOWED_VIDEO_EXTENSIONS:
        return 'video'
    return 'unknown'

def save_to_google_drive(file_obj, filename, folder_id):
    try:
        credentials_json = os.environ.get('GOOGLE_CREDENTIALS_JSON')
        if not credentials_json:
            print("[GOOGLE DRIVE] Variable GOOGLE_CREDENTIALS_JSON manquante.")
            return None

        # Nettoyage des guillemets accidentels autour du bloc JSON
        clean_json = credentials_json.strip()
        if clean_json.startswith("'") and clean_json.endswith("'"):
            clean_json = clean_json[1:-1].strip()

        creds_dict = json.loads(clean_json)

        # Nettoyage des retours à la ligne échappés \\n dans la clé privée
        if 'private_key' in creds_dict and isinstance(creds_dict['private_key'], str):
            creds_dict['private_key'] = creds_dict['private_key'].replace('\\n', '\n')

        credentials = service_account.Credentials.from_service_account_info(
            creds_dict,
            scopes=['https://www.googleapis.com/auth/drive']
        )

        drive_service = build('drive', 'v3', credentials=credentials)

        clean_filename = f"{uuid.uuid4().hex}_{filename}"
        file_metadata = {
            'name': clean_filename,
        }

        if folder_id:
            clean_folder_id = folder_id.strip().strip('"').strip("'")
            file_metadata['parents'] = [clean_folder_id]

        file_content = io.BytesIO(file_obj.read())
        file_obj.seek(0)

        media = MediaIoBaseUpload(file_content, mimetype=file_obj.mimetype, resumable=True)

        print(f"[GOOGLE DRIVE] Envoi du fichier vers le dossier : {folder_id}")

        drive_file = drive_service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, webViewLink, webContentLink',
            supportsAllDrives=True
        ).execute()

        file_id = drive_file.get('id')
        print(f"[GOOGLE DRIVE SUCCESS] Fichier créé avec succès dans Google Drive ! ID: {file_id}")

        # Partage du fichier
        try:
            drive_service.permissions().create(
                fileId=file_id,
                body={'type': 'anyone', 'role': 'reader'},
                supportsAllDrives=True
            ).execute()
        except Exception as perm_err:
            print(f"[GOOGLE DRIVE PERM WARNING] {perm_err}")

        direct_url = f"https://lh3.googleusercontent.com/d/{file_id}"
        return direct_url

    except Exception as e:
        print(f"[GOOGLE DRIVE ERROR] Échec upload Google Drive : {e}")
        traceback.print_exc()
        return None

def save_uploaded_file(file_obj, subfolder='posts'):
    if not file_obj or file_obj.filename == '':
        return None, None

    filename = secure_filename(file_obj.filename)
    if not allowed_file(filename):
        raise ValueError(f"Type de fichier non autorisé : {filename}")

    media_type = get_media_type(filename)

    # 1. Tentative Google Drive
    google_folder_id = os.environ.get('GOOGLE_DRIVE_FOLDER_ID')
    google_creds = os.environ.get('GOOGLE_CREDENTIALS_JSON')
    if google_creds:
        drive_url = save_to_google_drive(file_obj, filename, google_folder_id)
        if drive_url:
            return drive_url, media_type

    # 2. Tentative Cloudinary
    cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME')
    api_key = os.environ.get('CLOUDINARY_API_KEY')
    api_secret = os.environ.get('CLOUDINARY_API_SECRET')
    cloudinary_url = os.environ.get('CLOUDINARY_URL')

    if cloudinary_url or (cloud_name and api_key and api_secret):
        try:
            if cloudinary_url:
                cloudinary.config(cloudinary_url=cloudinary_url)
            else:
                cloudinary.config(
                    cloud_name=cloud_name,
                    api_key=api_key,
                    api_secret=api_secret
                )
            
            resource_type = "video" if media_type == "video" else "image"
            upload_result = cloudinary.uploader.upload(
                file_obj,
                folder=f"resoc/{subfolder}",
                resource_type=resource_type
            )
            secure_url = upload_result.get('secure_url')
            if secure_url:
                return secure_url, media_type
        except Exception as e:
            print(f"[CLOUDINARY] Erreur upload cloud, fallback local : {e}")

    # 3. Fallback local
    ext = filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    
    target_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder)
    os.makedirs(target_dir, exist_ok=True)
    
    full_path = os.path.join(target_dir, unique_filename)
    file_obj.save(full_path)

    relative_url = f"/uploads/{subfolder}/{unique_filename}"
    return relative_url, media_type
