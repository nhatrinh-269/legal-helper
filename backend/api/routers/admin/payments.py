# backend/api/routers/admin/payments.py

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.Payments import Payment as PaymentModel
from models.User import User as UserModel
from models.ServicePackages import ServicePackage as PackageModel
from schemas.admin.payments import AdminPayment
from api.dependencies import get_db

router = APIRouter()

@router.get("", response_model=List[AdminPayment], summary="Get all payments")
def get_payments(db: Session = Depends(get_db)):
    records = (
        db.query(PaymentModel, UserModel.full_name, PackageModel.package_name)
          .join(UserModel, PaymentModel.user_id == UserModel.user_id)
          .join(PackageModel, PaymentModel.package_id == PackageModel.package_id)
          .order_by(PaymentModel.payment_time.desc())
          .all()
    )
    return [
        AdminPayment(
            payment_id=pay.payment_id,
            user=user_name,
            method=pay.method,
            amount=pay.amount,
            package=package_name,
            status=pay.status,
            payment_time=pay.payment_time
        )
        for pay, user_name, package_name in records
    ]
