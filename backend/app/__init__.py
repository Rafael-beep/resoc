import os
from flask import Flask, send_from_directory, jsonify
from app.config import Config
from app.extensions import db, jwt, cors

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

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

    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    @app.route('/api/health')
    def health():
        return {'status': 'healthy', 'app': 'Resoc API'}

    @app.errorhandler(500)
    def handle_500(e):
        return jsonify({'error': f'Erreur serveur : {str(e)}'}), 500

    try:
        init_db(app)
    except Exception as e:
        print(f"[WARN] Erreur au démarrage init_db : {e}")

    return app

def init_db(app):
    with app.app_context():
        from app.models.user import User
        try:
            db.create_all()
        except Exception as e:
            print(f"[BDD] Bascule SQLite : {e}")
            app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///resoc.db'
            db.engine.dispose()
            db.init_app(app)
            db.create_all()

        # AUTO-MIGRATION : Ajouter la colonne 'bio' si la table existe déjà sans cette colonne
        try:
            with db.engine.connect() as conn:
                conn.execute(db.text("ALTER TABLE users ADD COLUMN bio VARCHAR(255)"))
                conn.commit()
                print("[MIGRATION] Colonne 'bio' ajoutée à la table users.")
        except Exception:
            pass  # La colonne bio existe déjà

        admin_username = os.environ.get('ADMIN_USERNAME', 'admin')
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@resoc.local')
        admin_password = os.environ.get('ADMIN_PASSWORD', 'AdminPassword123!')

        try:
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
        except Exception as err:
            print(f"[INIT] Erreur création admin : {err}")
