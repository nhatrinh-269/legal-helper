# backend/api/routers/admin/settings.py

from fastapi import APIRouter, HTTPException, status
from schemas.admin.settings import SettingsResponse, SettingsUpdateRequest

router = APIRouter()

# In-memory store giả lập
_settings_store = {
    "gemini_api_key": None,
    "quota_warning_threshold": 80,
    "system_email": "admin@legalhelper.com",
    "admin_password_hash": None,
}

@router.get("", response_model=SettingsResponse)
def get_settings():
    """
    Lấy cài đặt hiện tại (giả lập).
    """
    return SettingsResponse(
        gemini_api_key=_settings_store["gemini_api_key"],
        quota_warning_threshold=_settings_store["quota_warning_threshold"],
        system_email=_settings_store["system_email"]
    )

@router.put("", response_model=SettingsResponse)
def update_settings(payload: SettingsUpdateRequest):
    """
    Cập nhật các trường được gửi lên.
    (admin_password được hash hay không tuỳ bạn; ở đây lưu thẳng vào store)
    """
    if payload.gemini_api_key is not None:
        _settings_store["gemini_api_key"] = payload.gemini_api_key

    if payload.quota_warning_threshold is not None:
        _settings_store["quota_warning_threshold"] = payload.quota_warning_threshold

    if payload.system_email is not None:
        _settings_store["system_email"] = payload.system_email

    if payload.admin_password:
        # Giả lập lưu password hash (thực tế bạn có thể hash)
        _settings_store["admin_password_hash"] = payload.admin_password

    return SettingsResponse(
        gemini_api_key=_settings_store["gemini_api_key"],
        quota_warning_threshold=_settings_store["quota_warning_threshold"],
        system_email=_settings_store["system_email"]
    )
