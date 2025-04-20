from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum
from models.Base import Base
from datetime import datetime
import enum

class SubscriptionStatus(str, enum.Enum):
    active = "active"
    expired = "expired"

class Subscription(Base):
    __tablename__ = "Subscriptions"
    subscription_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False)
    package_id = Column(Integer, ForeignKey("ServicePackages.package_id", ondelete="CASCADE"), nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.active)
