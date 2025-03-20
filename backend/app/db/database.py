import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Utiliser SQLite en développement
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./evaluation.db")
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Importer tous les modèles pour que SQLAlchemy puisse créer les tables
from ..models import user, exercise, submission, notification

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 