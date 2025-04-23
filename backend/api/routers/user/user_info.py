from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from auth.password import hash_password
from database.connection import get_db
from models.User import User
from models.Subscriptions import Subscription
from models.ServicePackages import ServicePackage
from models.UsageQuota import UsageQuota
from schemas.user.user_info import UserInfoResponse, UserInfoUpdateRequest

router = APIRouter()

@router.get("/{user_id}", response_model=UserInfoResponse)
def get_user_info(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(user_id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    sub = (
        db.query(Subscription, ServicePackage)
          .join(ServicePackage, Subscription.package_id == ServicePackage.package_id)
          .filter(Subscription.user_id == user_id, Subscription.status == 'active')
          .first()
    )
    package_name = sub.ServicePackage.package_name if sub else "Không có"
    end_time     = sub.Subscription.end_time       if sub else None

    quota = db.query(UsageQuota).filter_by(user_id=user_id).first()

    return UserInfoResponse(
        full_name=user.full_name,
        email=user.email,
        registration_time=user.registration_time,
        package=package_name,
        end_date=end_time,
        question_usage={
            "used":  quota.questions_asked if quota else 0,
            "limit": quota.question_limit  if quota else 0
        }
    )

@router.put("/{user_id}", response_model=UserInfoResponse)
def update_user_info(
    user_id: int,
    payload: UserInfoUpdateRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter_by(user_id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.email and payload.email != user.email:
        exists = db.query(User).filter(User.email == payload.email).first()
        if exists:
            raise HTTPException(status_code=400, detail="Email đã được sử dụng")
        user.email = payload.email

    if payload.full_name:
        user.full_name = payload.full_name

    if payload.password:
        user.password_hash = hash_password(payload.password)

    db.commit()
    db.refresh(user)
    return get_user_info(user_id, db)

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter_by(user_id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "Tài khoản đã được xóa"}
