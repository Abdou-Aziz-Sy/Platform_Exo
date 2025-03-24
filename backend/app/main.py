import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .api import auth, exercises, submissions, statistics, users, notifications
from .db.database import Base, engine

# Définir le chemin de base pour les uploads
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")

# Créer les dossiers nécessaires avec des chemins absolus
os.makedirs(os.path.join(UPLOAD_DIR, "exercises"), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "submissions"), exist_ok=True)

app = FastAPI(
    title="Plateforme d'Évaluation API",
    description="API pour la plateforme d'évaluation automatisée des exercices de bases de données",
    version="1.0.0"
)

# Configuration CORS
origins = [
    "http://localhost:3000",
    "https://projet-frontend-beta.vercel.app",
    "https://projet-frontend-git-main-syabdoul.vercel.app",
    "https://projet-frontend-syabdoul.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Monter le dossier uploads pour servir les fichiers statiques
app.mount("/api/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Créer les tables de la base de données
Base.metadata.create_all(bind=engine)

# Inclusion des routes
app.include_router(auth.router, prefix="/api")
app.include_router(exercises.router, prefix="/api/exercises")
app.include_router(submissions.router, prefix="/api")
app.include_router(statistics.router, prefix="/api")
app.include_router(users.router, prefix="/api/users")
app.include_router(notifications.router, prefix="/api")

# Route de test pour vérifier que l'API fonctionne
@app.get("/")
async def root():
    return {"message": "Bienvenue sur l'API d'évaluation"} 