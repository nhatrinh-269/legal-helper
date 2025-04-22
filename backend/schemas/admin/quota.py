# backend/schemas/admin/quota.py

from pydantic import BaseModel
from datetime import date

class AdminQuota(BaseModel):
    user: str
    usage_date: date
    questions_asked: int
    question_limit: int
    percent_used: float

    class Config:
        orm_mode = True
