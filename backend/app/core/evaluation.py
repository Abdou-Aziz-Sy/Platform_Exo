from typing import Dict, Any, List
from pydantic import BaseModel
import json
from .ollama_client import ollama_client

class EvaluationCriteria(BaseModel):
    name: str
    weight: float
    description: str

class EvaluationResult(BaseModel):
    score: float
    feedback: str
    criteria_scores: Dict[str, float]
    detailed_feedback: Dict[str, str]
    improvement_suggestions: List[str]

class ExerciseEvaluator:
    DEFAULT_CRITERIA = [
        EvaluationCriteria(
            name="exactitude",
            weight=0.4,
            description="Exactitude des concepts et des réponses"
        ),
        EvaluationCriteria(
            name="completude",
            weight=0.3,
            description="Complétude de la réponse"
        ),
        EvaluationCriteria(
            name="clarte",
            weight=0.2,
            description="Clarté et structure de l'explication"
        ),
        EvaluationCriteria(
            name="pertinence",
            weight=0.1,
            description="Pertinence des exemples et illustrations"
        )
    ]

    @staticmethod
    async def evaluate_submission(
        student_answer: str,
        correction_model: str,
        criteria: List[EvaluationCriteria] = None
    ) -> EvaluationResult:
        if criteria is None:
            criteria = ExerciseEvaluator.DEFAULT_CRITERIA

        prompt = f"""Tu es un professeur expert en bases de données qui évalue une réponse d'étudiant.
        
        Modèle de correction :
        {correction_model}
        
        Réponse de l'étudiant :
        {student_answer}
        
        Évalue la réponse selon les critères suivants :
        {[f"- {c.name} ({c.weight*100}%): {c.description}" for c in criteria]}
        
        Format de réponse attendu (JSON) :
        {{
            "criteria_scores": {{
                "exactitude": <note_sur_10>,
                "completude": <note_sur_10>,
                "clarte": <note_sur_10>,
                "pertinence": <note_sur_10>
            }},
            "detailed_feedback": {{
                "exactitude": "<feedback_détaillé>",
                "completude": "<feedback_détaillé>",
                "clarte": "<feedback_détaillé>",
                "pertinence": "<feedback_détaillé>"
            }},
            "improvement_suggestions": [
                "<suggestion_1>",
                "<suggestion_2>",
                "<suggestion_3>"
            ]
        }}
        """

        try:
            evaluation = await ollama_client.evaluate_submission(student_answer, prompt)
            result = json.loads(evaluation["response"])

            # Calculer la note finale pondérée
            final_score = 0
            for criterion in criteria:
                criterion_score = result["criteria_scores"][criterion.name]
                final_score += criterion_score * criterion.weight

            # Générer le feedback global
            feedback = "Évaluation détaillée :\n\n"
            for criterion in criteria:
                feedback += f"• {criterion.name.capitalize()} ({criterion.weight*100}%) : "
                feedback += f"{result['criteria_scores'][criterion.name]}/10\n"
                feedback += f"  {result['detailed_feedback'][criterion.name]}\n\n"

            feedback += "\nSuggestions d'amélioration :\n"
            for suggestion in result["improvement_suggestions"]:
                feedback += f"• {suggestion}\n"

            return EvaluationResult(
                score=final_score * 2,  # Convertir en note sur 20
                feedback=feedback,
                criteria_scores=result["criteria_scores"],
                detailed_feedback=result["detailed_feedback"],
                improvement_suggestions=result["improvement_suggestions"]
            )

        except Exception as e:
            return EvaluationResult(
                score=0,
                feedback=f"Erreur lors de l'évaluation : {str(e)}",
                criteria_scores={c.name: 0 for c in criteria},
                detailed_feedback={c.name: "Erreur d'évaluation" for c in criteria},
                improvement_suggestions=["Impossible d'évaluer la réponse"]
            )

evaluator = ExerciseEvaluator() 