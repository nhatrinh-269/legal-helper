# backend/schemas/admin/feedbacks.py

from pydantic import BaseModel
from datetime import datetime

class AdminFeedback(BaseModel):
    feedback_id: int
    user: str
    content: str
    timestamp: datetime

    class Config:
        orm_mode = True

class DeleteResponse(BaseModel):
    success: bool

    class Config:
        orm_mode = True
        
class UserEmailResponse(BaseModel):
    email: str
