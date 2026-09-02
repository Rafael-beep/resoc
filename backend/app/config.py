import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_secret_key_12345')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev_jwt_secret_67890')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    db_uri = os.environ.get('DATABASE_URL')
    if db_uri and db_uri.startswith('postgres://'):
        db_uri = db_uri.replace('postgres://', 'postgresql://', 1)
        
    if not db_uri:
        db_uri = 'sqlite:///resoc.db'
    
    SQLALCHEMY_DATABASE_URI = db_uri
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', os.path.join(os.getcwd(), 'uploads'))
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'webm'}
