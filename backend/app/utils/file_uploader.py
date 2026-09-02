import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app
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

def save_uploaded_file(file_obj, subfolder='posts'):
    if not file_obj or file_obj.filename == '':
        return None, None

    filename = secure_filename(file_obj.filename)
    if not allowed_file(filename):
        raise ValueError(f"Type de fichier non autorisé : {filename}")

    media_type = get_media_type(filename)

    # Si Cloudinary est configuré (Stockage Cloud permanent gratuit)
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

    # Fallback local
    ext = filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    
    target_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder)
    os.makedirs(target_dir, exist_ok=True)
    
    full_path = os.path.join(target_dir, unique_filename)
    file_obj.save(full_path)

    relative_url = f"/uploads/{subfolder}/{unique_filename}"
    return relative_url, media_type
