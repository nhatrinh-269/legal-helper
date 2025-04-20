from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime
from backend.models.Base import Base
from datetime import datetime

class Feedback(Base):
    __tablename__ = "Feedback"
    feedback_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
