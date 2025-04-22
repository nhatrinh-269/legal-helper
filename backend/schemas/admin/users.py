# backend/schemas/admin/users.py
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from models.User import UserRole, UserStatus

class AdminUser(BaseModel):
    # Cho phép lấy giá trị trực tiếp từ ORM
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    full_name: str
    email: str
    role: UserRole
    status: UserStatus
    registration_time: datetime

class ToggleStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    success: bool
    user_id: int
    status: UserStatus
