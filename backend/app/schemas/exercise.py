from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, List, Any

class CorrectionModel(BaseModel):
    file_path: Optional[str] = None
    description: str

class ExerciseBase(BaseModel):
    title: str
    description: str
    exercise_type: str  # 'sql', 'mcd', 'mld', 'algebra'
    due_date: Optional[datetime] = None

class ExerciseCreate(ExerciseBase):
    corrections: List[Dict[str, Any]] = []
    evaluation_criteria: Optional[Dict[str, Any]] = None

class ExerciseUpdate(ExerciseBase):
    title: Optional[str] = None
    description: Optional[str] = None
    exercise_type: Optional[str] = None
    corrections: Optional[List[Dict[str, Any]]] = None
    evaluation_criteria: Optional[Dict[str, Any]] = None

class Exercise(ExerciseBase):
    id: int
    file_path: Optional[str] = None
    corrections: List[Dict[str, Any]] = []
    evaluation_criteria: Optional[Dict[str, Any]] = None
    created_at: datetime
    professor_id: int

    class Config:
        from_attributes = True

class ExerciseResponse(Exercise):
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        } 