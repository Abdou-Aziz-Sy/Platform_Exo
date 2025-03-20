from typing import List
from sqlalchemy.orm import Session
from ..models.notification import Notification, NotificationType
from ..models.user import User, UserRole
from ..schemas.notification import NotificationCreate

class NotificationService:
    @staticmethod
    async def create_notification(
        db: Session,
        notification: NotificationCreate
    ) -> Notification:
        db_notification = Notification(**notification.dict())
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)
        return db_notification

    @staticmethod
    async def notify_new_exercise(
        db: Session,
        exercise_id: int,
        exercise_title: str
    ):
        # Notifier tous les étudiants
        students = db.query(User).filter(User.role == UserRole.STUDENT).all()
        for student in students:
            notification = NotificationCreate(
                user_id=student.id,
                type=NotificationType.NEW_EXERCISE,
                title="Nouvel exercice disponible",
                message=f"Un nouvel exercice '{exercise_title}' a été publié.",
                link=f"/exercises/{exercise_id}"
            )
            await NotificationService.create_notification(db, notification)

    @staticmethod
    async def notify_submission_evaluated(
        db: Session,
        submission_id: int,
        exercise_title: str,
        student_id: int,
        score: float
    ):
        notification = NotificationCreate(
            user_id=student_id,
            type=NotificationType.SUBMISSION_EVALUATED,
            title="Exercice évalué",
            message=f"Votre soumission pour l'exercice '{exercise_title}' a été évaluée. Note: {score}/20",
            link=f"/submissions/{submission_id}"
        )
        await NotificationService.create_notification(db, notification)

    @staticmethod
    async def notify_feedback_updated(
        db: Session,
        submission_id: int,
        exercise_title: str,
        student_id: int
    ):
        notification = NotificationCreate(
            user_id=student_id,
            type=NotificationType.FEEDBACK_UPDATED,
            title="Feedback mis à jour",
            message=f"Le feedback pour votre soumission de l'exercice '{exercise_title}' a été mis à jour.",
            link=f"/submissions/{submission_id}"
        )
        await NotificationService.create_notification(db, notification)

    @staticmethod
    async def mark_as_read(
        db: Session,
        notification_id: int,
        user_id: int
    ) -> bool:
        notification = db.query(Notification)\
            .filter(Notification.id == notification_id)\
            .filter(Notification.user_id == user_id)\
            .first()
        
        if notification:
            notification.read = True
            db.commit()
            return True
        return False

    @staticmethod
    async def get_user_notifications(
        db: Session,
        user_id: int,
        unread_only: bool = False,
        skip: int = 0,
        limit: int = 50
    ) -> List[Notification]:
        query = db.query(Notification)\
            .filter(Notification.user_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.read == False)
        
        return query.order_by(Notification.created_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()

notification_service = NotificationService() 