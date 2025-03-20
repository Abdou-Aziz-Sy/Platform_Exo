import os
import sys
from unittest.mock import MagicMock
from datetime import datetime

# Définir l'environnement de test
os.environ["TESTING"] = "1"

# Ajouter le répertoire parent au PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Mock MinIO client et ses dépendances avant d'importer l'application
minio_mock = MagicMock()
minio_mock.bucket_exists.return_value = True
minio_mock.make_bucket.return_value = None

# Mock le module minio et ses sous-modules
minio_module = MagicMock()
minio_module.Minio.return_value = minio_mock
minio_module.error = MagicMock()
minio_module.error.S3Error = Exception
sys.modules['minio'] = minio_module
sys.modules['minio.error'] = minio_module.error

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.models.user import User, UserRole
from app.models.exercise import Exercise
from app.models.submission import Submission
from app.models.notification import Notification, NotificationType
from app.core.security import get_password_hash
from app.main import app

# Configuration de la base de données de test
SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    # Création des tables
    Base.metadata.create_all(bind=engine)
    
    # Création d'une nouvelle session de test
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Nettoyage de la base de données après chaque test
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)

@pytest.fixture
def test_professor(db):
    professor = User(
        email="professor@test.com",
        hashed_password=get_password_hash("password123"),
        full_name="Test Professor",
        role=UserRole.PROFESSOR
    )
    db.add(professor)
    db.commit()
    db.refresh(professor)
    return professor

@pytest.fixture
def test_student(db):
    student = User(
        email="student@test.com",
        hashed_password=get_password_hash("password123"),
        full_name="Test Student",
        role=UserRole.STUDENT
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

@pytest.fixture
def test_exercise(db, test_professor):
    exercise = Exercise(
        title="Test Exercise",
        description="This is a test exercise",
        professor_id=test_professor.id
    )
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise

@pytest.fixture
def test_submission(db, test_student, test_exercise):
    submission = Submission(
        student_id=test_student.id,
        exercise_id=test_exercise.id,
        file_path="test_submission.pdf",
        score=None
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission

@pytest.fixture
def test_notification(db, test_student):
    notification = Notification(
        user_id=test_student.id,
        title="Test Notification",
        message="Test notification",
        type=NotificationType.SUBMISSION_EVALUATED,
        read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification 