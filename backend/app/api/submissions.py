from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, Form
from sqlalchemy import func, and_, or_, desc, asc
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import PyPDF2
import io
from datetime import datetime
import os

from ..db.database import get_db
from ..models.user import User, UserRole
from ..models.exercise import Exercise
from ..models.submission import Submission as SubmissionModel
from ..schemas.submission import Submission, SubmissionCreate, SubmissionWithDetails, SubmissionResponse
from ..core.minio_client import minio_client
from ..core.ollama_client import ollama_client
from ..api.auth import get_current_user
from ..schemas.filters import SubmissionFilter
from ..core.ai_evaluator import AIEvaluator
from ..models.notification import Notification
from ..schemas.notification import NotificationType

router = APIRouter(prefix="/submissions", tags=["submissions"])

@router.get("/search", response_model=List[SubmissionWithDetails])
async def search_submissions(
    exercise_id: Optional[int] = None,
    student_id: Optional[int] = None,
    score_min: Optional[float] = None,
    score_max: Optional[float] = None,
    submitted_after: Optional[datetime] = None,
    submitted_before: Optional[datetime] = None,
    sort_by: Optional[str] = "submitted_at",
    sort_order: Optional[str] = "desc",
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Base query avec les relations nécessaires
    query = db.query(SubmissionModel)\
        .join(Exercise)\
        .join(User, SubmissionModel.student_id == User.id)

    # Appliquer les filtres selon le rôle
    if current_user.role == UserRole.STUDENT:
        query = query.filter(SubmissionModel.student_id == current_user.id)
    elif current_user.role == UserRole.PROFESSOR:
        if student_id:
            query = query.filter(SubmissionModel.student_id == student_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )

    # Appliquer les autres filtres
    if exercise_id:
        query = query.filter(SubmissionModel.exercise_id == exercise_id)
    
    if score_min is not None:
        query = query.filter(SubmissionModel.score >= score_min)
    
    if score_max is not None:
        query = query.filter(SubmissionModel.score <= score_max)
    
    if submitted_after:
        query = query.filter(SubmissionModel.submitted_at >= submitted_after)
    
    if submitted_before:
        query = query.filter(SubmissionModel.submitted_at <= submitted_before)

    # Appliquer le tri
    if sort_by == "score":
        sort_column = SubmissionModel.score
    else:
        sort_column = SubmissionModel.submitted_at

    if sort_order == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    # Pagination
    total = query.count()
    submissions = query.offset(skip).limit(limit).all()

    # Préparer les résultats avec les détails
    result = []
    for submission in submissions:
        exercise = db.query(Exercise).filter(Exercise.id == submission.exercise_id).first()
        student = db.query(User).filter(User.id == submission.student_id).first()
        submission_dict = {
            **submission.__dict__,
            "exercise_title": exercise.title if exercise else "Inconnu",
            "student_name": student.full_name if student else "Inconnu"
        }
        result.append(submission_dict)

    return result

@router.post("/", response_model=SubmissionResponse)
async def create_submission(
    exercise_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Vérifier que l'utilisateur est un étudiant
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les étudiants peuvent soumettre des exercices"
        )
    
    # Vérifier que l'exercice existe
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercice non trouvé"
        )
    
    # Vérifier que le fichier est un PDF
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le fichier doit être au format PDF"
        )
    
    # Générer un nom de fichier unique
    filename = f"{uuid.uuid4()}_{file.filename}"
    relative_path = f"submissions/{current_user.id}/{filename}"
    absolute_path = os.path.join("uploads", relative_path)
    
    # Créer le dossier s'il n'existe pas
    os.makedirs(os.path.dirname(absolute_path), exist_ok=True)
    
    # Sauvegarder le fichier
    try:
        with open(absolute_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la sauvegarde du fichier"
        )
    
    # Créer la soumission
    submission = SubmissionModel(
        exercise_id=exercise_id,
        student_id=current_user.id,
        file_path=relative_path,
        status="pending",
        created_at=datetime.utcnow()
    )
    
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    # Évaluer la soumission avec l'IA
    if exercise.corrections and exercise.evaluation_criteria:
        try:
            evaluation = await AIEvaluator.evaluate_submission(
                submission=submission,
                exercise=exercise
            )
            
            submission.grade = evaluation["grade"]
            submission.feedback = evaluation["feedback"]
            submission.status = "graded"
            
            # Créer une notification pour l'étudiant
            notification = Notification(
                user_id=current_user.id,
                type=NotificationType.SUBMISSION_EVALUATED,
                title="Soumission évaluée",
                message=f"Votre soumission pour l'exercice '{exercise.title}' a été évaluée.",
                data={
                    "exercise_id": exercise_id,
                    "submission_id": submission.id,
                    "grade": evaluation["grade"],
                    "criteria_scores": evaluation["criteria_scores"]
                }
            )
            
            db.add(notification)
            db.commit()
            db.refresh(submission)
            
        except Exception as e:
            print(f"Erreur lors de l'évaluation automatique : {str(e)}")
            submission.status = "error"
            submission.feedback = "Erreur lors de l'évaluation automatique"
            db.commit()
    else:
        submission.status = "pending"
        submission.feedback = "En attente de la correction du professeur"
        db.commit()
    
    # Créer la réponse avec tous les champs requis
    response_dict = {
        "id": submission.id,
        "exercise_id": submission.exercise_id,
        "student_id": submission.student_id,
        "file_path": submission.file_path,
        "status": submission.status,
        "grade": submission.grade,
        "feedback": submission.feedback,
        "created_at": submission.created_at,
        "exercise_title": exercise.title
    }
    
    return SubmissionResponse(**response_dict)

@router.get("/", response_model=List[SubmissionResponse])
async def get_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Les étudiants ne voient que leurs soumissions
    if current_user.role == UserRole.STUDENT:
        submissions = db.query(SubmissionModel).filter(
            SubmissionModel.student_id == current_user.id
        ).all()
    # Les professeurs voient toutes les soumissions
    else:
        submissions = db.query(SubmissionModel).all()
    
    # Ajouter le titre de l'exercice pour chaque soumission
    responses = []
    for submission in submissions:
        exercise = db.query(Exercise).filter(Exercise.id == submission.exercise_id).first()
        response = SubmissionResponse(
            **submission.__dict__,
            exercise_title=exercise.title
        )
        responses.append(response)
    
    return responses

@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    submission = db.query(SubmissionModel).filter(SubmissionModel.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Soumission non trouvée"
        )
    
    # Vérifier que l'utilisateur a le droit de voir cette soumission
    if current_user.role == UserRole.STUDENT and submission.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez pas voir les soumissions des autres étudiants"
        )
    
    exercise = db.query(Exercise).filter(Exercise.id == submission.exercise_id).first()
    response = SubmissionResponse(
        **submission.__dict__,
        exercise_title=exercise.title
    )
    
    return response

@router.delete("/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Récupérer la soumission
    submission = db.query(SubmissionModel).filter(SubmissionModel.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Soumission non trouvée"
        )
    
    # Vérifier que l'utilisateur est le propriétaire de la soumission ou un professeur
    if current_user.role == UserRole.STUDENT and submission.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez pas supprimer les soumissions des autres étudiants"
        )
    
    # Vérifier que la soumission n'est pas déjà notée
    if submission.status == "graded":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible de supprimer une soumission déjà notée"
        )
    
    # Supprimer le fichier
    try:
        file_path = os.path.join("uploads", submission.file_path)
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Erreur lors de la suppression du fichier : {str(e)}")
    
    # Supprimer la soumission de la base de données
    db.delete(submission)
    db.commit()
    
    return None 