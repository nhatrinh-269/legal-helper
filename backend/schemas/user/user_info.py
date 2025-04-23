# backend/schemas/user/user_info.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class QuestionUsage(BaseModel):
    used: int
    limit: int

class UserInfoResponse(BaseModel):
    full_name: str
    email: EmailStr
    registration_time: datetime
    package: str
    end_date: Optional[datetime]
    question_usage: QuestionUsage

class UserInfoUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    email:    Optional[EmailStr] = None
    password: Optional[str] = None
