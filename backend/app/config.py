import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_secret_key_12345')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev_jwt_secret_67890')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Base de données MariaDB / MySQL ou SQLite fallback pour dev local
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'mysql+pymysql://resoc_user:resoc_password@db:3306/resoc_db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', os.path.join(os.getcwd(), 'uploads'))
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 Mo max request payload
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'webm'}
