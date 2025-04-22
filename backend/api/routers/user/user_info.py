from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from models.User import User
from models.Subscriptions import Subscription
from models.ServicePackages import ServicePackage
from models.UsageQuota import UsageQuota

from datetime import date

router = APIRouter()

@router.get("/{user_id}")
def get_user_info_by_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(user_id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    subscription = db.query(Subscription, ServicePackage).\
        join(ServicePackage, Subscription.package_id == ServicePackage.package_id).\
        filter(Subscription.user_id == user_id, Subscription.status == 'active').first()

    quota = db.query(UsageQuota).filter_by(user_id=user_id).first()

    return {
        "full_name": user.full_name,
        "email": user.email,
        "registration_time": user.registration_time,
        "package": subscription.ServicePackage.package_name if subscription else "Không có",
        "end_date": subscription.Subscription.end_time if subscription else None,
        "question_usage": {
            "used": quota.questions_asked if quota else 0,
            "limit": quota.question_limit if quota else 0
        }
    }
