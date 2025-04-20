from pydantic import BaseModel
from datetime import datetime

class FeedbackCreate(BaseModel):
    user_id: int
    content: str

class FeedbackOut(BaseModel):
    content: str
    timestamp: datetime
