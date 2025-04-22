from datetime import datetime
from enum import Enum
from models.Payments import PaymentStatus, PaymentMethod
from sqlalchemy.orm import Session
from models.Payments import Payment
from core.config import settings

# Hàm giả lập thanh toán (mock)
def process_payment(db: Session, user_id: int, amount: float, method: PaymentMethod, package_id: int = None) -> Payment:
    status = PaymentStatus.success if amount > 0 else PaymentStatus.failed

    payment = Payment(
        user_id=user_id,
        amount=amount,
        method=method,
        status=status,
        package_id=package_id,
        payment_time=datetime.utcnow()
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment
