from fastapi.testclient import TestClient
from app.core.security import create_access_token
from app.models.user import UserRole

def test_login_success(client, test_student):
    response = client.post(
        "/api/auth/token",
        data={
            "username": test_student.email,
            "password": "password123"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_wrong_password(client, test_student):
    response = client.post(
        "/api/auth/token",
        data={
            "username": test_student.email,
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_login_invalid_email(client):
    response = client.post(
        "/api/auth/token",
        data={
            "username": "nonexistent@test.com",
            "password": "password123"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_register_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@test.com",
            "password": "password123",
            "role": UserRole.STUDENT,
            "full_name": "New User"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert data["role"] == UserRole.STUDENT
    assert data["full_name"] == "New User"

def test_register_duplicate_email(client, test_student):
    response = client.post(
        "/api/auth/register",
        json={
            "email": test_student.email,
            "password": "password123",
            "role": UserRole.STUDENT,
            "full_name": "Duplicate User"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_protected_route_without_token(client):
    response = client.get("/api/exercises/")
    assert response.status_code == 401
    assert "detail" in response.json()

def test_protected_route_with_token(client, test_professor):
    token = create_access_token({"sub": str(test_professor.id)})
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/exercises/", headers=headers)
    assert response.status_code == 200 