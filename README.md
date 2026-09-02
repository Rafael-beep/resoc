# 🌐 Resoc - Réseau Social Privé Autohébergé

Application web monopage (SPA) et API microservices conteneurisée avec **Docker & Docker Compose**, conçue pour un réseau social privé autohébergé pour **15 membres** sur VPS Linux (LWS).

---

## 🚀 Stack Technique

- **Backend** : Python 3.11, Flask, SQLAlchemy ORM, JWT Extended, Gunicorn.
- **Frontend** : React 18, Vite, Vanilla CSS Premium (Design Sombre & Glassmorphism).
- **Base de Données** : MariaDB 11 (Conteneur Docker avec volume persistant).
- **Proxy & Static Serving** : Nginx (Conteneur Docker).
- **Orchestration** : Docker Compose avec volumes persistants pour les données BDD et les uploads médias.

---

## ✨ Fonctionnalités Principales

1. **Administration Unique & Gestion des Comptes** :
   - Inscription publique désactivée.
   - Endpoint & Dashboard d'administration exclusif pour l'Administrateur (`/api/admin/users`).
   - Création de compte, activation/désactivation, réinitialisation de mot de passe, suppression.
   - Compteur & quota configuré pour 15 utilisateurs.

2. **Flux de Publications avec Médias (Max 10)** :
   - Support mixte des **Photos** (JPG, PNG, GIF, WEBP) et **Vidéos** (MP4, WEBM).
   - Validation stricte de la limite de **10 médias maximum par publication**.
   - Carrousel interactif avec visionneuse plein écran.
   - Réactions sociales (Likes) et système de commentaires.

3. **Événements Temporaires** :
   - Création d'événements communautaires avec titre, date, lieu, description et image de couverture.
   - Marquage automatique du statut (À venir, En cours, Terminé).
   - Système de réponse RSVP (*J'y vais*, *Peut-être*, *Absence*) avec liste des participants.

---

## 🛠️ Déploiement Rapide avec Docker Compose

### 1. Prérequis
- Linux (Ubuntu/Debian) ou Docker Desktop (Windows/Mac).
- `docker` et `docker compose` installés.

### 2. Lancement des Services
```bash
# 1. Copier le fichier de variables d'environnement
cp .env.example .env

# 2. Lancer les conteneurs microservices
docker compose up -d --build
```

L'application sera accessible immédiatement sur :
- **Frontend / Application Web** : [http://localhost](http://localhost) (ou l'IP de votre VPS LWS).
- **Identifiants administrateur par défaut** :
  - **Identifiant** : `admin`
  - **Mot de passe** : `AdminPassword123!`

---

## 📁 Architecture des Volumes Persistants

- `mariadb_data` : Stocke les données de la base MariaDB de façon permanente (`/var/lib/mysql`).
- `media_uploads` : Stocke les images et vidéos téléversées par les utilisateurs (`/app/uploads`), partagé directement avec Nginx.

---

## 🚢 Guide de Déploiement sur VPS Linux LWS

1. Connectez-vous en SSH à votre VPS LWS :
   ```bash
   ssh root@ip_de_votre_vps_lws
   ```
2. Installez Docker et Docker Compose si ce n'est pas encore fait :
   ```bash
   apt-get update && apt-get install -y docker.io docker-compose-v2
   ```
3. Clonez votre dépôt ou déposez les fichiers sur le serveur (ex: `/var/www/resoc`).
4. Éditez le fichier `.env` avec des mots de passe sécurisés :
   ```bash
   nano .env
   ```
5. Lancez l'application en arrière-plan :
   ```bash
   docker compose up -d --build
   ```

---

## 🧪 Structure du Projet

```
.
├── docker-compose.yml        # Définition des services (db, backend, frontend)
├── .env.example              # Variables d'environnement modélisées
├── backend/                  # API RESTful Flask & SQLAlchemy
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── run.py
│   └── app/
│       ├── models/           # Modèles BDD (User, Post, PostMedia, Event, Comment, Reaction)
│       ├── routes/           # Endpoints API (auth, admin, posts, events, users)
│       └── utils/            # Upload & validation des 10 médias max
└── frontend/                 # Application Web Monopage React (Vite)
    ├── Dockerfile
    ├── nginx.conf            # Proxy Nginx et service statique React + /uploads
    └── src/
        ├── components/       # MediaCarousel, MediaUploader, PostCard, EventCard, etc.
        ├── pages/            # FeedPage, EventsPage, AdminPage, LoginPage, ProfilePage
        └── services/         # Client API RESTful
```
