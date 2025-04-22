# backend/schemas/admin/plans.py

from pydantic import BaseModel, Field, PositiveInt, constr, condecimal
from decimal import Decimal
from typing import Optional

class AdminPlan(BaseModel):
    package_id: int
    package_name: constr(min_length=1, max_length=100)
    description: Optional[str]
    price: condecimal(max_digits=12, decimal_places=2)
    duration_days: PositiveInt
    question_limit: PositiveInt

    class Config:
        orm_mode = True

class CreatePlan(BaseModel):
    package_name: constr(min_length=1, max_length=100)
    description: Optional[str]
    price: condecimal(max_digits=12, decimal_places=2)
    duration_days: PositiveInt
    question_limit: PositiveInt

class UpdatePlan(BaseModel):
    package_name: Optional[constr(min_length=1, max_length=100)]
    description: Optional[str]
    price: Optional[condecimal(max_digits=12, decimal_places=2)]
    duration_days: Optional[PositiveInt]
    question_limit: Optional[PositiveInt]

class DeleteResponse(BaseModel):
    success: bool

    class Config:
        orm_mode = True
