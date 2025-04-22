# backend/schemas/admin/payments.py

from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal

class AdminPayment(BaseModel):
    payment_id: int
    user: str
    method: str
    amount: Decimal
    package: str
    status: str
    payment_time: datetime

    class Config:
        orm_mode = True
        use_enum_values = True
