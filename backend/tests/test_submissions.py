import pytest
from fastapi.testclient import TestClient
from app.core.security import create_access_token
import io
from app.models.user import User, UserRole
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def get_test_headers(user):
    access_token = create_access_token({"sub": user.email})
    return {"Authorization": f"Bearer {access_token}"}

def test_create_submission_as_student(client, test_student, test_exercise):
    token = create_access_token({"sub": str(test_student.id)})
    
    # Créer un fichier PDF valide
    pdf_buffer = io.BytesIO()
    c = canvas.Canvas(pdf_buffer, pagesize=letter)
    c.drawString(100, 750, "Test content")
    c.save()
    pdf_buffer.seek(0)

    files = {
        "file": ("submission.pdf", pdf_buffer, "application/pdf")
    }
    form = {
        "exercise_id": test_exercise.id
    }
    response = client.post(
        "/api/submissions/",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
        data=form
    )
    assert response.status_code == 200
    assert response.json()["exercise_id"] == test_exercise.id
    assert response.json()["student_id"] == test_student.id

def test_create_submission_as_professor(client, test_professor, test_exercise):
    token = create_access_token({"sub": str(test_professor.id)})
    
    # Créer un fichier PDF valide
    pdf_buffer = io.BytesIO()
    c = canvas.Canvas(pdf_buffer, pagesize=letter)
    c.drawString(100, 750, "Test content")
    c.save()
    pdf_buffer.seek(0)

    files = {
        "file": ("submission.pdf", pdf_buffer, "application/pdf")
    }
    form = {
        "exercise_id": test_exercise.id
    }
    response = client.post(
        "/api/submissions/",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
        data=form
    )
    assert response.status_code == 403

def test_get_submission_as_owner(client, test_student, test_submission):
    token = create_access_token({"sub": str(test_student.id)})
    response = client.get(
        f"/api/submissions/{test_submission.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["id"] == test_submission.id

def test_get_submission_as_other_student(client, test_student, test_submission, db):
    # Créer un autre étudiant
    other_student = User(
        email="other.student@test.com",
        hashed_password="hashed",
        full_name="Other Student",
        role=UserRole.STUDENT
    )
    db.add(other_student)
    db.commit()
    db.refresh(other_student)

    token = create_access_token({"sub": str(other_student.id)})
    response = client.get(
        f"/api/submissions/{test_submission.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403

def test_search_submissions(client, test_professor, test_submission):
    token = create_access_token({"sub": str(test_professor.id)})
    response = client.get(
        "/api/submissions/search",
        headers={"Authorization": f"Bearer {token}"},
        params={"score_min": 10, "score_max": 20}
    )
    assert response.status_code == 200
    submissions = response.json()
    assert all(sub["score"] is None or (10 <= sub["score"] <= 20) for sub in submissions)

def test_get_submissions_as_professor(client, test_professor, test_submission):
    token = create_access_token({"sub": str(test_professor.id)})
    response = client.get(
        "/api/submissions/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_get_submissions_as_student(client, test_student, test_submission):
    token = create_access_token({"sub": str(test_student.id)})
    response = client.get(
        "/api/submissions/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    submissions = response.json()
    assert all(sub["student_id"] == test_student.id for sub in submissions) 