from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SubmissionBase(BaseModel):
    exercise_id: int
    file_path: str

class SubmissionCreate(SubmissionBase):
    pass

class Submission(SubmissionBase):
    id: int
    student_id: int
    status: str
    grade: Optional[float] = None
    feedback: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SubmissionResponse(Submission):
    exercise_title: str

    class Config:
        from_attributes = True

class SubmissionUpdate(BaseModel):
    score: Optional[float] = None
    feedback: Optional[str] = None

class SubmissionWithDetails(Submission):
    exercise_title: str
    student_name: str 