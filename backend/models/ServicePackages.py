from sqlalchemy import Column, Integer, String, Text, DECIMAL
from models.Base import Base

class ServicePackage(Base):
    __tablename__ = "ServicePackages"
    package_id = Column(Integer, primary_key=True)
    package_name = Column(String(100), nullable=False)
    description = Column(Text)
    price = Column(DECIMAL(12, 2), nullable=False)
    duration_days = Column(Integer, nullable=False)
    question_limit = Column(Integer, nullable=False)
