import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_secret_key_12345')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev_jwt_secret_67890')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Préférer SQLite pour une fiabilité à 100% si l'hôte MySQL bloque les connexions distantes
    db_uri = os.environ.get('DATABASE_URL')
    if not db_uri or 'sqlite' in db_uri:
        db_uri = 'sqlite:///resoc.db'
    
    SQLALCHEMY_DATABASE_URI = db_uri
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', os.path.join(os.getcwd(), 'uploads'))
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 Mo max request payload
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'webm'}
