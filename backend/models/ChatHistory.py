from sqlalchemy import Column, Integer, ForeignKey, JSON, DateTime
from models.Base import Base
from datetime import datetime

class ChatHistory(Base):
    __tablename__ = "ChatHistory"
    chat_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False)
    message_content = Column(JSON, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
