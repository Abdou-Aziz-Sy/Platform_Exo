import pytest
from fastapi.testclient import TestClient
from app.core.security import create_access_token
import io

def get_test_headers(user):
    access_token = create_access_token({"sub": str(user.id)})
    return {"Authorization": f"Bearer {access_token}"}

def test_create_exercise_as_professor(client, test_professor):
    token = create_access_token({"sub": str(test_professor.id)})
    files = {
        "file": ("test.pdf", io.BytesIO(b"test content"), "application/pdf")
    }
    form = {
        "title": "Test Exercise",
        "description": "This is a test exercise",
        "correction_model": "SELECT * FROM test;"
    }
    response = client.post(
        "/api/exercises/",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
        data=form
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Exercise"
    assert data["description"] == "This is a test exercise"
    assert data["correction_model"] == "SELECT * FROM test;"

def test_create_exercise_as_student(client, test_student):
    token = create_access_token({"sub": str(test_student.id)})
    files = {
        "file": ("test.pdf", io.BytesIO(b"test content"), "application/pdf")
    }
    form = {
        "title": "Test Exercise",
        "description": "This is a test exercise",
        "correction_model": "SELECT * FROM test;"
    }
    response = client.post(
        "/api/exercises/",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
        data=form
    )
    assert response.status_code == 403

def test_get_exercise(client, test_professor, test_exercise):
    token = create_access_token({"sub": str(test_professor.id)})
    response = client.get(
        f"/api/exercises/{test_exercise.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["title"] == test_exercise.title

def test_get_nonexistent_exercise(client, test_professor):
    token = create_access_token({"sub": str(test_professor.id)})
    response = client.get(
        "/api/exercises/999",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404

def test_search_exercises(client, test_professor, test_exercise):
    token = create_access_token({"sub": str(test_professor.id)})
    response = client.get(
        "/api/exercises/",
        headers={"Authorization": f"Bearer {token}"},
        params={"search": "Test"}
    )
    assert response.status_code == 200
    assert any(ex["title"] == test_exercise.title for ex in response.json())

def test_delete_exercise_as_professor(client, test_professor, test_exercise):
    headers = get_test_headers(test_professor)
    response = client.delete(
        f"/api/exercises/{test_exercise.id}",
        headers=headers
    )
    assert response.status_code == 200

    # Vérifier que l'exercice a bien été supprimé
    response = client.get(
        f"/api/exercises/{test_exercise.id}",
        headers=headers
    )
    assert response.status_code == 404 