import os
from app import create_app, init_db

app = create_app()

# Initialiser automatiquement la BDD et créer l'admin par défaut au démarrage
try:
    init_db(app)
except Exception as e:
    print(f"[WARN] Erreur lors de l'initialisation de la BDD : {e}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
