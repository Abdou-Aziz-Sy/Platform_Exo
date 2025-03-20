from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..db.database import Base

class NotificationType(str, enum.Enum):
    NEW_EXERCISE = "new_exercise"
    SUBMISSION_EVALUATED = "submission_evaluated"
    FEEDBACK_UPDATED = "feedback_updated"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(Enum(NotificationType))
    title = Column(String)
    message = Column(String)
    data = Column(JSON, nullable=True)
    link = Column(String, nullable=True)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    user = relationship("User") 