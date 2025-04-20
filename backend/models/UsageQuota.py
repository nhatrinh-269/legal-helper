from sqlalchemy import Column, Integer, ForeignKey, Date, UniqueConstraint
from models.Base import Base

class UsageQuota(Base):
    __tablename__ = "UsageQuota"
    quota_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False)
    usage_date = Column(Date, nullable=False)
    questions_asked = Column(Integer, default=0, nullable=False)
    question_limit = Column(Integer, nullable=False)

    __table_args__ = (UniqueConstraint('user_id', 'usage_date', name='uq_user_date'),)
