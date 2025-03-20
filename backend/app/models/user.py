from sqlalchemy import Column, Integer, String, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from enum import Enum
from ..db.database import Base

class UserRole(str, Enum):
    STUDENT = "student"
    PROFESSOR = "professor"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(SQLEnum(UserRole))

    # Relations
    exercises = relationship("Exercise", back_populates="professor")
    submissions = relationship("Submission", back_populates="student")
    notifications = relationship("Notification", back_populates="user") 