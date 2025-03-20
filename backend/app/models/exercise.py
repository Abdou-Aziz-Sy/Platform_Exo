from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.mutable import MutableDict, MutableList
from ..db.database import Base
from datetime import datetime
from enum import Enum
import json

class ExerciseType(str, Enum):
    SQL = "sql"
    MCD = "mcd"
    MLD = "mld"
    ALGEBRA = "algebra"

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    exercise_type = Column(SQLEnum(ExerciseType), nullable=False)
    file_path = Column(String)  # Chemin du fichier PDF du sujet
    corrections = Column(MutableList.as_mutable(JSON), default=list)  # Liste des modèles de correction [{file_path: str, description: str}]
    evaluation_criteria = Column(MutableDict.as_mutable(JSON))  # Critères d'évaluation
    created_at = Column(DateTime, default=datetime.utcnow)
    professor_id = Column(Integer, ForeignKey("users.id"))

    # Relations
    professor = relationship("User", back_populates="exercises")
    submissions = relationship("Submission", back_populates="exercise")

    @property
    def correction_file_path(self):
        """Retourne le chemin du premier fichier de correction s'il existe."""
        if self.corrections and isinstance(self.corrections, list) and len(self.corrections) > 0:
            return self.corrections[0].get('file_path')
        return None

    @property
    def corrections_list(self):
        if isinstance(self.corrections, str):
            try:
                return json.loads(self.corrections)
            except:
                return []
        return self.corrections or []

    @corrections_list.setter
    def corrections_list(self, value):
        if isinstance(value, str):
            try:
                self.corrections = json.loads(value)
            except:
                self.corrections = []
        else:
            self.corrections = value or [] 