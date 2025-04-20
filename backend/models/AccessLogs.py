from sqlalchemy import Column, Integer, ForeignKey, Enum, DateTime, Text
from models.Base import Base
from datetime import datetime
import enum

class AccessAction(str, enum.Enum):
    login = "login"
    chat = "chat"
    feedback = "feedback"
    payment = "payment"

class AccessLog(Base):
    __tablename__ = "AccessLogs"
    log_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False)
    action = Column(Enum(AccessAction), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(Text)
