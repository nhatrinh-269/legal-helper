from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from schemas.user.feedback import FeedbackCreate, FeedbackOut
from models.Feedback import Feedback
from datetime import datetime

router = APIRouter()

@router.get("/fb/{user_id}", response_model=list[FeedbackOut])
def get_user_feedback(user_id: int, db: Session = Depends(get_db)):
    return db.query(Feedback).filter(Feedback.user_id == user_id).order_by(Feedback.timestamp.desc()).all()

@router.post("/createfb/{user_id}", status_code=201)
def create_feedback(user_id: int, payload: FeedbackCreate, db: Session = Depends(get_db)):
    if payload.user_id != user_id:
        raise HTTPException(status_code=400, detail="User ID mismatch")

    feedback = Feedback(
        user_id=user_id,
        content=payload.content,
        timestamp=datetime.utcnow()
    )
    db.add(feedback)
    db.commit()
    return {"message": "Feedback submitted"}
