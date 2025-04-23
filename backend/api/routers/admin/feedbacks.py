# backend/api/routers/admin/feedbacks.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from models.Feedback import Feedback as FeedbackModel
from models.User import User as UserModel
from schemas.admin.feedbacks import AdminFeedback, DeleteResponse, UserEmailResponse
from api.dependencies import get_db

router = APIRouter()

@router.get("", response_model=List[AdminFeedback], summary="Get all user feedbacks")
def get_feedbacks(db: Session = Depends(get_db)):
    # Join Feedback với User để lấy tên người dùng
    records = (
        db.query(FeedbackModel, UserModel.full_name)
          .join(UserModel, FeedbackModel.user_id == UserModel.user_id)
          .order_by(FeedbackModel.timestamp.desc())
          .all()
    )
    # mỗi record là tuple (FeedbackModel, full_name)
    return [
        AdminFeedback(
            feedback_id=fb.feedback_id,
            user=name,
            content=fb.content,
            timestamp=fb.timestamp
        )
        for fb, name in records
    ]

@router.delete("/{feedback_id}", response_model=DeleteResponse, summary="Delete a feedback")
def delete_feedback(feedback_id: int, db: Session = Depends(get_db)):
    fb = db.query(FeedbackModel).filter(FeedbackModel.feedback_id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    db.delete(fb)
    db.commit()
    return DeleteResponse(success=True)

@router.get("/{feedback_id}/user-email", response_model=UserEmailResponse, summary="Get user email by feedback id")
def get_feedback_user_email(feedback_id: int, db: Session = Depends(get_db)):
    fb = db.query(FeedbackModel).filter_by(feedback_id=feedback_id).first()
    if not fb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    user = db.query(UserModel).filter_by(user_id=fb.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserEmailResponse(email=user.email)
