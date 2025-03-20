from app.db.database import Base, engine
from app.models.user import User, UserRole
from app.models.exercise import Exercise, ExerciseType
from app.core.security import get_password_hash
from sqlalchemy.orm import Session
import json

# Supprimer toutes les tables existantes
Base.metadata.drop_all(bind=engine)

# Créer toutes les tables
Base.metadata.create_all(bind=engine)

# Créer un utilisateur professeur par défaut et un exercice
def create_default_data():
    db = Session(engine)
    
    # Créer un professeur
    professor = User(
        email="prof@esp.sn",
        full_name="Dr Diop",
        hashed_password=get_password_hash("password123"),
        role=UserRole.PROFESSOR,
        is_active=True
    )
    
    # Créer un étudiant
    student = User(
        email="student@esp.sn",
        full_name="Étudiant Test",
        hashed_password=get_password_hash("password123"),
        role=UserRole.STUDENT,
        is_active=True
    )
    
    db.add(professor)
    db.add(student)
    db.commit()
    
    # Créer un exercice par défaut
    exercise = Exercise(
        title="Introduction aux MCD",
        description="Créez un Modèle Conceptuel de Données pour un système de gestion de bibliothèque",
        exercise_type=ExerciseType.MCD,
        file_path="exercises/default/exercise.pdf",
        professor_id=professor.id,
        corrections=[
            {
                "file_path": "corrections/default/correction1.pdf",
                "description": "Approche avec entités Livre, Adhérent, Emprunt"
            },
            {
                "file_path": "corrections/default/correction2.pdf",
                "description": "Approche avec entités supplémentaires pour Auteur et Catégorie"
            }
        ],
        evaluation_criteria={
            "comprehension": {
                "poids": 0.3,
                "description": "Compréhension du problème et identification des entités"
            },
            "technique": {
                "poids": 0.4,
                "description": "Respect des normes MCD et qualité des relations"
            },
            "optimisation": {
                "poids": 0.3,
                "description": "Optimisation du modèle et choix des cardinalités"
            }
        }
    )
    
    db.add(exercise)
    db.commit()
    
    print("Base de données réinitialisée avec succès!")
    print("Utilisateurs par défaut créés:")
    print("Professeur: prof@esp.sn / password123")
    print("Étudiant: student@esp.sn / password123")
    print("\nExercice par défaut créé: Introduction aux MCD")
    
    db.close()

if __name__ == "__main__":
    create_default_data() 