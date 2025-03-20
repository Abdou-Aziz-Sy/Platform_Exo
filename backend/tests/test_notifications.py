import pytest
from fastapi.testclient import TestClient
from app.models.notification import NotificationType
from app.core.notifications import notification_service
from app.core.security import create_access_token

def get_test_headers(user):
    token = create_access_token({"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_create_notification(client, test_student, db):
    # Créer une notification via le service
    await notification_service.notify_new_exercise(
        db,
        exercise_id=1,
        exercise_title="Test Exercise"
    )

    # Vérifier que la notification est accessible via l'API
    headers = get_test_headers(test_student)
    response = client.get(
        "/api/notifications/",
        headers=headers
    )
    assert response.status_code == 200
    notifications = response.json()
    assert len(notifications) > 0
    assert notifications[0]["type"] == NotificationType.NEW_EXERCISE
    assert "Test Exercise" in notifications[0]["message"]

@pytest.mark.asyncio
async def test_get_notifications(client, test_student, test_notification):
    token = create_access_token({"sub": str(test_student.id)})
    response = client.get(
        "/api/notifications/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    notifications = response.json()
    assert len(notifications) > 0

@pytest.mark.asyncio
async def test_get_unread_notifications(client, test_student, test_notification):
    token = create_access_token({"sub": str(test_student.id)})
    response = client.get(
        "/api/notifications/unread",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    notifications = response.json()
    assert len(notifications) > 0
    assert all(not notif["read"] for notif in notifications)

@pytest.mark.asyncio
async def test_mark_notification_as_read(client, test_student, test_notification):
    token = create_access_token({"sub": str(test_student.id)})
    response = client.put(
        f"/api/notifications/{test_notification.id}/read",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200

    # Vérifier que la notification est marquée comme lue
    response = client.get(
        "/api/notifications/unread",
        headers={"Authorization": f"Bearer {token}"}
    )
    notifications = response.json()
    assert not any(n["id"] == test_notification.id for n in notifications)

@pytest.mark.asyncio
async def test_mark_nonexistent_notification(client, test_student):
    token = create_access_token({"sub": str(test_student.id)})
    response = client.put(
        "/api/notifications/999/read",  # ID inexistant
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404 