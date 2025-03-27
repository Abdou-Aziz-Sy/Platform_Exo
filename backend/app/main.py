import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .api import auth, exercises, submissions, statistics, users, notifications
from .db.database import Base, engine

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    "https://projet-frontend-syabdoul.vercel.app",
    "https://frontend-orcin-three-42.vercel.app",
    "https://frontend-git-main-abdou-aziz-sys-projects-58fc1331.vercel.app",
    "https://frontend-2dja7zqg0-abdou-aziz-sys-projects-58fc1331.vercel.app",
    "https://frontend-git-main-abdou-aziz-sys-projects-58fc1331.vercel.app",
    "*"  # Temporairement pour le debugging
]

logger.info("Domaines autorisés pour CORS: %s", origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Middleware pour logger les requêtes
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Requête reçue: {request.method} {request.url}")
    logger.info(f"Headers: {request.headers}")
    response = await call_next(request)
    logger.info(f"Réponse: Status {response.status_code}")
    return response

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