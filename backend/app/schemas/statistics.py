from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime

class ExerciseStats(BaseModel):
    exercise_id: int
    exercise_title: str
    total_submissions: int
    average_score: float
    min_score: float
    max_score: float
    submission_count_by_score_range: Dict[str, int]

    class Config:
        from_attributes = True

class StudentStats(BaseModel):
    total_submissions: int
    average_score: float
    completed_exercises: int
    score_evolution: List[Dict[str, Any]]
    performance_by_exercise: List[Dict[str, Any]]

    class Config:
        from_attributes = True

class GlobalStats(BaseModel):
    total_students: int
    total_exercises: int
    total_submissions: int
    average_score: float
    submissions_per_day: List[Dict[str, Any]]
    top_exercises: List[Dict[str, Any]]

    class Config:
        from_attributes = True 