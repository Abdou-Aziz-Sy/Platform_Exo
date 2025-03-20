from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..db.database import get_db
from ..models.user import User
from ..schemas.notification import Notification
from ..core.notifications import notification_service
from ..api.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=List[Notification])
async def get_notifications(
    unread_only: bool = False,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await notification_service.get_user_notifications(
        db,
        current_user.id,
        unread_only,
        skip,
        limit
    )

@router.get("/unread", response_model=List[Notification])
async def get_unread_notifications(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await notification_service.get_user_notifications(
        db,
        current_user.id,
        True,
        skip,
        limit
    )

@router.put("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = await notification_service.mark_as_read(
        db,
        notification_id,
        current_user.id
    )
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Notification non trouvée"
        )
    return {"message": "Notification marquée comme lue"} 