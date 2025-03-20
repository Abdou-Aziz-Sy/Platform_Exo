from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models.user import UserRole

class ExerciseFilter(BaseModel):
    search: Optional[str] = None  # Recherche dans le titre et la description
    professor_id: Optional[int] = None
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None
    sort_by: Optional[str] = "created_at"  # title, created_at
    sort_order: Optional[str] = "desc"  # asc, desc

class SubmissionFilter(BaseModel):
    exercise_id: Optional[int] = None
    student_id: Optional[int] = None
    score_min: Optional[float] = None
    score_max: Optional[float] = None
    submitted_after: Optional[datetime] = None
    submitted_before: Optional[datetime] = None
    sort_by: Optional[str] = "submitted_at"  # submitted_at, score
    sort_order: Optional[str] = "desc"  # asc, desc 