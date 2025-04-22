# backend/schemas/admin/subscriptions.py

from pydantic import BaseModel
from datetime import datetime

class AdminSubscription(BaseModel):
    subscription_id: int
    user: str
    package: str
    start_time: datetime
    end_time: datetime
    status: str

    class Config:
        orm_mode = True
        use_enum_values = True

class DeleteResponse(BaseModel):
    success: bool

    class Config:
        orm_mode = True
