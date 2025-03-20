from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, Form
from sqlalchemy import or_, and_, desc, asc
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime
import os
import json

from ..db.database import get_db
from ..models.user import User, UserRole
from ..schemas.exercise import Exercise, ExerciseCreate, ExerciseUpdate, ExerciseResponse
from ..models.exercise import Exercise as ExerciseModel
from ..core.minio_client import minio_client
from ..core.security import oauth2_scheme
from ..api.auth import get_current_user
from ..schemas.filters import ExerciseFilter
from ..core.ai_evaluator import AIEvaluator

router = APIRouter(tags=["exercises"])

@router.get("/search", response_model=List[Exercise])
async def search_exercises(
    search: Optional[str] = None,
    professor_id: Optional[int] = None,
    created_after: Optional[datetime] = None,
    created_before: Optional[datetime] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ExerciseModel)

    # Appliquer les filtres
    if search:
        search_filter = or_(
            ExerciseModel.title.ilike(f"%{search}%"),
            ExerciseModel.description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    if professor_id:
        query = query.filter(ExerciseModel.professor_id == professor_id)

    if created_after:
        query = query.filter(ExerciseModel.created_at >= created_after)

    if created_before:
        query = query.filter(ExerciseModel.created_at <= created_before)

    # Appliquer le tri
    if sort_by == "title":
        sort_column = ExerciseModel.title
    else:
        sort_column = ExerciseModel.created_at

    if sort_order == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    # Pagination
    total = query.count()
    exercises = query.offset(skip).limit(limit).all()

    return exercises

@router.post("/", response_model=ExerciseResponse)
async def create_exercise(
    title: str = Form(...),
    description: str = Form(...),
    exercise_type: str = Form(...),
    file: UploadFile = File(...),
    corrections: List[UploadFile] = File(None),
    corrections_descriptions: str = Form(...),
    evaluation_criteria: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.PROFESSOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les professeurs peuvent créer des exercices"
        )
    
    # Vérifier que le fichier est un PDF
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le fichier doit être au format PDF"
        )
    
    # Vérifier le type d'exercice
    valid_types = ['sql', 'mcd', 'mld', 'algebra']
    if exercise_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Type d'exercice invalide"
        )
    
    # Vérifier les descriptions des corrections
    try:
        corrections_descriptions_dict = json.loads(corrections_descriptions)
        if not isinstance(corrections_descriptions_dict, list):
            raise ValueError("Les descriptions des corrections doivent être une liste")
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format des descriptions des corrections invalide"
        )
    
    # Vérifier les critères d'évaluation
    try:
        criteria_dict = json.loads(evaluation_criteria)
        total_weight = sum(c['poids'] for c in criteria_dict.values())
        if not (0.99 <= total_weight <= 1.01):  # Permettre de petites erreurs d'arrondi
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La somme des poids des critères doit être égale à 1"
            )
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format des critères d'évaluation invalide"
        )
    
    # Générer un nom de fichier unique pour l'exercice
    filename = f"{uuid.uuid4()}_{file.filename}"
    relative_path = f"exercises/{current_user.id}/{filename}"
    absolute_path = os.path.join("uploads", relative_path)
    
    # Créer le dossier s'il n'existe pas
    os.makedirs(os.path.dirname(absolute_path), exist_ok=True)
    
    # Sauvegarder le fichier d'exercice
    try:
        with open(absolute_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la sauvegarde du fichier"
        )
    
    # Sauvegarder les fichiers de correction
    correction_paths = []
    if corrections:
        for i, correction_file in enumerate(corrections):
            if not correction_file.filename.lower().endswith('.pdf'):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Le fichier de correction {i+1} doit être au format PDF"
                )
            
            correction_filename = f"{uuid.uuid4()}_{correction_file.filename}"
            correction_path = f"corrections/{current_user.id}/{correction_filename}"
            correction_absolute_path = os.path.join("uploads", correction_path)
            
            os.makedirs(os.path.dirname(correction_absolute_path), exist_ok=True)
            
            try:
                with open(correction_absolute_path, "wb") as buffer:
                    content = await correction_file.read()
                    buffer.write(content)
                correction_paths.append(correction_path)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Erreur lors de la sauvegarde du fichier de correction {i+1}"
                )
    
    # Créer l'exercice avec les corrections
    corrections_data = []
    for i, description in enumerate(corrections_descriptions_dict):
        correction_data = {
            "file_path": correction_paths[i] if i < len(correction_paths) else None,
            "description": description
        }
        corrections_data.append(correction_data)
    
    exercise = ExerciseModel(
        title=title,
        description=description,
        exercise_type=exercise_type,
        file_path=relative_path,
        corrections=corrections_data,
        evaluation_criteria=criteria_dict,
        professor_id=current_user.id
    )
    
    db.add(exercise)
    try:
        db.commit()
        db.refresh(exercise)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'exercice: {str(e)}"
        )
    
    # Convertir les données JSON en objets Python pour la réponse
    response_exercise = exercise.__dict__
    response_exercise["corrections"] = corrections_data
    response_exercise["evaluation_criteria"] = criteria_dict
    
    return response_exercise

@router.get("/", response_model=List[ExerciseResponse])
async def get_exercises(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Les étudiants voient tous les exercices
    # Les professeurs ne voient que leurs exercices
    if current_user.role == UserRole.PROFESSOR:
        exercises = db.query(ExerciseModel).filter(
            ExerciseModel.professor_id == current_user.id
        ).all()
    else:
        exercises = db.query(ExerciseModel).all()
    
    # Convertir les données JSON en objets Python pour la réponse
    response_exercises = []
    for exercise in exercises:
        exercise_dict = exercise.__dict__
        if isinstance(exercise_dict['corrections'], str):
            try:
                exercise_dict['corrections'] = json.loads(exercise_dict['corrections'])
            except:
                exercise_dict['corrections'] = []
        if isinstance(exercise_dict['evaluation_criteria'], str):
            try:
                exercise_dict['evaluation_criteria'] = json.loads(exercise_dict['evaluation_criteria'])
            except:
                exercise_dict['evaluation_criteria'] = {}
        response_exercises.append(exercise_dict)
    
    return response_exercises

@router.get("/{exercise_id}", response_model=ExerciseResponse)
async def get_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exercise = db.query(ExerciseModel).filter(ExerciseModel.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercice non trouvé")
    
    # Vérifier que le professeur a le droit de voir cet exercice
    if current_user.role == UserRole.PROFESSOR and exercise.professor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas accès à cet exercice"
        )
    
    return exercise

@router.put("/{exercise_id}", response_model=ExerciseResponse)
async def update_exercise(
    exercise_id: int,
    title: str = Form(...),
    description: str = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.PROFESSOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les professeurs peuvent modifier des exercices"
        )

    db_exercise = db.query(ExerciseModel).filter(ExerciseModel.id == exercise_id).first()
    if db_exercise is None:
        raise HTTPException(status_code=404, detail="Exercice non trouvé")
    
    if db_exercise.professor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez modifier que vos propres exercices"
        )

    # Mettre à jour les champs de base
    db_exercise.title = title
    db_exercise.description = description

    # Si un nouveau fichier est fourni, le sauvegarder
    if file:
        # Vérifier que le fichier est un PDF
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le fichier doit être au format PDF"
            )
        
        # Générer un nom de fichier unique
        filename = f"{uuid.uuid4()}_{file.filename}"
        relative_path = f"exercises/{current_user.id}/{filename}"
        absolute_path = os.path.join("uploads", relative_path)
        
        # Créer le dossier s'il n'existe pas
        os.makedirs(os.path.dirname(absolute_path), exist_ok=True)
        
        try:
            # Sauvegarder le nouveau fichier
            with open(absolute_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Supprimer l'ancien fichier si possible
            if db_exercise.file_path:
                old_path = os.path.join("uploads", db_exercise.file_path)
                if os.path.exists(old_path):
                    os.remove(old_path)
            
            # Mettre à jour le chemin du fichier
            db_exercise.file_path = relative_path
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erreur lors de la sauvegarde du fichier"
            )

    db.commit()
    db.refresh(db_exercise)
    return db_exercise

@router.delete("/{exercise_id}")
async def delete_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.PROFESSOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les professeurs peuvent supprimer des exercices"
        )

    db_exercise = db.query(ExerciseModel).filter(ExerciseModel.id == exercise_id).first()
    if db_exercise is None:
        raise HTTPException(status_code=404, detail="Exercice non trouvé")
    
    if db_exercise.professor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez supprimer que vos propres exercices"
        )

    db.delete(db_exercise)
    db.commit()
    return {"message": "Exercice supprimé avec succès"} 