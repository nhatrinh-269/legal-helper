from sqlalchemy import Column, Integer, ForeignKey, DateTime, DECIMAL, Enum
from backend.models.Base import Base
from datetime import datetime
import enum

class PaymentMethod(str, enum.Enum):
    momo = "momo"
    vnpay = "vnpay"
    paypal = "paypal"
    stripe = "stripe"

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    success = "success"
    failed = "failed"

class Payment(Base):
    __tablename__ = "Payments"
    payment_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False)
    method = Column(Enum(PaymentMethod), nullable=False)
    amount = Column(DECIMAL(12, 2), nullable=False)
    payment_time = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    package_id = Column(Integer, ForeignKey("ServicePackages.package_id", ondelete="SET NULL"))
