from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, and_, desc
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict
import json

from ..db.database import get_db
from ..models.user import User, UserRole
from ..models.exercise import Exercise
from ..models.submission import Submission
from ..schemas.statistics import ExerciseStats, StudentStats, GlobalStats
from ..api.auth import get_current_user

router = APIRouter()

@router.get("/statistics/exercise/{exercise_id}", response_model=ExerciseStats)
async def get_exercise_statistics(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.PROFESSOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les professeurs peuvent voir ces statistiques"
        )

    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercice non trouvé")

    # Récupérer les statistiques de base
    stats = db.query(
        func.count(Submission.id).label("total"),
        func.avg(Submission.grade).label("average"),
        func.min(Submission.grade).label("min"),
        func.max(Submission.grade).label("max")
    ).filter(Submission.exercise_id == exercise_id).first()

    # Calculer la distribution des notes
    ranges = {
        "0-5": 0,
        "5-10": 0,
        "10-15": 0,
        "15-20": 0
    }
    
    submissions = db.query(Submission).filter(Submission.exercise_id == exercise_id).all()
    for sub in submissions:
        if sub.grade <= 5:
            ranges["0-5"] += 1
        elif sub.grade <= 10:
            ranges["5-10"] += 1
        elif sub.grade <= 15:
            ranges["10-15"] += 1
        else:
            ranges["15-20"] += 1

    return ExerciseStats(
        exercise_id=exercise_id,
        exercise_title=exercise.title,
        total_submissions=stats.total or 0,
        average_score=float(stats.average or 0),
        min_score=float(stats.min or 0),
        max_score=float(stats.max or 0),
        submission_count_by_score_range=ranges
    )

@router.get("/statistics/student/{student_id}", response_model=StudentStats)
async def get_student_statistics(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Vérifier les permissions
    if current_user.role == UserRole.STUDENT and current_user.id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez voir que vos propres statistiques"
        )

    # Statistiques de base
    stats = db.query(
        func.count(Submission.id).label("total"),
        func.avg(Submission.grade).label("average")
    ).filter(Submission.student_id == student_id).first()

    # Nombre d'exercices complétés
    completed_exercises = db.query(func.count(func.distinct(Submission.exercise_id)))\
        .filter(Submission.student_id == student_id).scalar()

    # Évolution des scores dans le temps
    submissions = db.query(
        Submission.created_at,
        Submission.grade,
        Exercise.title
    ).join(Exercise)\
        .filter(Submission.student_id == student_id)\
        .order_by(Submission.created_at).all()

    score_evolution = [
        {
            "date": sub.created_at.isoformat(),
            "score": sub.grade,
            "exercise": sub.title
        } for sub in submissions
    ]

    # Performance par exercice
    performance = db.query(
        Exercise.title,
        func.avg(Submission.grade).label("average_score"),
        func.count(Submission.id).label("attempts")
    ).join(Exercise)\
        .filter(Submission.student_id == student_id)\
        .group_by(Exercise.title).all()

    performance_by_exercise = [
        {
            "exercise": perf.title,
            "average_score": float(perf.average_score),
            "attempts": perf.attempts
        } for perf in performance
    ]

    return StudentStats(
        total_submissions=stats.total or 0,
        average_score=float(stats.average or 0),
        completed_exercises=completed_exercises,
        score_evolution=score_evolution,
        performance_by_exercise=performance_by_exercise
    )

@router.get("/statistics/global", response_model=GlobalStats)
async def get_global_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.PROFESSOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les professeurs peuvent voir ces statistiques"
        )

    # Statistiques globales
    total_students = db.query(func.count(User.id))\
        .filter(User.role == UserRole.STUDENT).scalar()
    total_exercises = db.query(func.count(Exercise.id)).scalar()
    
    submission_stats = db.query(
        func.count(Submission.id).label("total"),
        func.avg(Submission.grade).label("average")
    ).first()

    # Soumissions par jour (30 derniers jours)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily_submissions = db.query(
        func.date(Submission.created_at).label("date"),
        func.count(Submission.id).label("count")
    ).filter(Submission.created_at >= thirty_days_ago)\
        .group_by(func.date(Submission.created_at))\
        .order_by(func.date(Submission.created_at)).all()

    # Exercices les plus populaires
    top_exercises = db.query(
        Exercise.id,
        Exercise.title,
        func.count(Submission.id).label("submission_count"),
        func.avg(Submission.grade).label("average_score")
    ).join(Submission)\
        .group_by(Exercise.id)\
        .order_by(desc("submission_count"))\
        .limit(5).all()

    return GlobalStats(
        total_students=total_students,
        total_exercises=total_exercises,
        total_submissions=submission_stats.total or 0,
        average_score=float(submission_stats.average or 0),
        submissions_per_day=[
            {"date": str(day.date), "count": day.count}
            for day in daily_submissions
        ],
        top_exercises=[
            {
                "id": ex.id,
                "title": ex.title,
                "submissions": ex.submission_count,
                "average_score": float(ex.average_score)
            }
            for ex in top_exercises
        ]
    ) 