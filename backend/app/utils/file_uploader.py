import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

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

    ext = filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}_{int(os.path.getmtime(current_app.config['UPLOAD_FOLDER']) if os.path.exists(current_app.config['UPLOAD_FOLDER']) else 0)}.{ext}"
    
    target_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder)
    os.makedirs(target_dir, exist_ok=True)
    
    full_path = os.path.join(target_dir, unique_filename)
    file_obj.save(full_path)

    relative_url = f"/uploads/{subfolder}/{unique_filename}"
    media_type = get_media_type(filename)

    return relative_url, media_type
