from pydantic import BaseModel
from typing import List

class PackageInfoResponse(BaseModel):
    package_id: int
    package_name: str
    description: List[str]
    price: float
    duration_days: int
    question_limit: int
    methods: List[str]

class PaymentRequest(BaseModel):
    user_id: int        
    package_id: int
    method: str

class PaymentResponse(BaseModel):
    payment_id: int
    status: str
    message: str
