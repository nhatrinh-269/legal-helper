# backend/api/routers/admin/subscriptions.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from models.Subscriptions import Subscription as SubModel
from models.User import User as UserModel
from models.ServicePackages import ServicePackage as PackageModel
from schemas.admin.subscriptions import AdminSubscription, DeleteResponse
from api.dependencies import get_db

router = APIRouter()

@router.get("", response_model=List[AdminSubscription], summary="Get all subscriptions")
def get_subscriptions(db: Session = Depends(get_db)):
    records = (
        db.query(SubModel, UserModel.full_name, PackageModel.package_name)
          .join(UserModel, SubModel.user_id == UserModel.user_id)
          .join(PackageModel, SubModel.package_id == PackageModel.package_id)
          .order_by(SubModel.start_time.desc())
          .all()
    )
    return [
        AdminSubscription(
            subscription_id=sub.subscription_id,
            user=user_name,
            package=package_name,
            start_time=sub.start_time,
            end_time=sub.end_time,
            status=sub.status
        )
        for sub, user_name, package_name in records
    ]

@router.delete("/{subscription_id}", response_model=DeleteResponse, summary="Cancel a subscription")
def cancel_subscription(subscription_id: int, db: Session = Depends(get_db)):
    sub = db.query(SubModel).filter(SubModel.subscription_id == subscription_id).first()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    db.delete(sub)
    db.commit()
    return DeleteResponse(success=True)
