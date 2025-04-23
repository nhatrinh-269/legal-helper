from pydantic import BaseModel, EmailStr, conint
from typing import Optional

class SettingsResponse(BaseModel):
    gemini_api_key: Optional[str]
    quota_warning_threshold: conint(ge=0, le=100)
    system_email: EmailStr

class SettingsUpdateRequest(BaseModel):
    gemini_api_key: Optional[str] = None
    quota_warning_threshold: Optional[conint(ge=0, le=100)] = None
    system_email: Optional[EmailStr] = None
    admin_password: Optional[str] = None
