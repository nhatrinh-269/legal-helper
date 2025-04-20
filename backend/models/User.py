from sqlalchemy import Column, Integer, String, Enum, DateTime
from backend.models.Base import Base
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"

class UserStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    banned = "banned"

class User(Base):
    __tablename__ = "Users"
    user_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    registration_time = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(UserStatus), default=UserStatus.active)
