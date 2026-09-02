import os
from flask import Flask, send_from_directory, jsonify
from app.config import Config
from app.extensions import db, jwt, cors

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialiser les extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Assurer la présence du dossier d'upload
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Enregistrer les Blueprints
    from app.routes.auth import auth_bp
    from app.routes.admin import admin_bp
    from app.routes.posts import posts_bp
    from app.routes.events import events_bp
    from app.routes.users import users_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(users_bp)

    # Auto-créer les tables avant chaque première requête si nécessaire
    @app.before_request
    def ensure_db_ready():
        if not getattr(app, '_db_inited', False):
            try:
                init_db(app)
                app._db_inited = True
            except Exception as err:
                app.logger.error(f"Erreur d'initialisation BDD : {err}")

    # Route d'accès aux fichiers téléversés
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Health check endpoint
    @app.route('/api/health')
    def health():
        return {'status': 'healthy', 'app': 'Resoc API'}

    # Gestionnaire d'erreur 500 lisible
    @app.errorhandler(500)
    def handle_500(e):
        return jsonify({'error': 'Erreur interne du serveur. Réessayez ou vérifiez la BDD.'}), 500

    return app

def init_db(app):
    with app.app_context():
        from app.models.user import User
        try:
            db.create_all()
        except Exception as e:
            print(f"[WARN] MySQL non joignable, bascule automatique sur SQLite : {e}")
            app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///resoc_fallback.db'
            db.create_all()

        admin_username = os.environ.get('ADMIN_USERNAME', 'admin')
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@resoc.local')
        admin_password = os.environ.get('ADMIN_PASSWORD', 'AdminPassword123!')

        admin = User.query.filter_by(username=admin_username).first()
        if not admin:
            admin = User(
                username=admin_username,
                email=admin_email,
                first_name='Admin',
                last_name='Système',
                is_admin=True,
                is_active=True
            )
            admin.set_password(admin_password)
            db.session.add(admin)
            db.session.commit()
            print(f"[INIT] Compte administrateur créé : {admin_username}")
