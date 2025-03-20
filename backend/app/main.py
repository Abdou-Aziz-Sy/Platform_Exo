import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .api import auth, exercises, submissions, statistics, users, notifications
from .db.database import Base, engine

# Créer les dossiers nécessaires
os.makedirs("uploads/exercises", exist_ok=True)
os.makedirs("uploads/submissions", exist_ok=True)

app = FastAPI(
    title="Plateforme d'Évaluation API",
    description="API pour la plateforme d'évaluation automatisée des exercices de bases de données",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Monter le dossier uploads pour servir les fichiers statiques
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")

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