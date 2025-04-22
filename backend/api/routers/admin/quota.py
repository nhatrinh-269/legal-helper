# backend/api/routers/admin/quota.py

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.UsageQuota import UsageQuota as QuotaModel
from models.User import User as UserModel
from schemas.admin.quota import AdminQuota
from api.dependencies import get_db

router = APIRouter()

@router.get("", response_model=List[AdminQuota], summary="Get daily usage quotas")
def get_quota(db: Session = Depends(get_db)):
    # Join UsageQuota với User để lấy tên
    records = (
        db.query(QuotaModel, UserModel.full_name)
          .join(UserModel, QuotaModel.user_id == UserModel.user_id)
          .order_by(QuotaModel.usage_date.desc())
          .all()
    )
    result = []
    for quota, name in records:
        # tính phần trăm sử dụng
        pct = 0.0
        if quota.question_limit:
            pct = (quota.questions_asked / quota.question_limit) * 100
        result.append(
            AdminQuota(
                user=name,
                usage_date=quota.usage_date,
                questions_asked=quota.questions_asked,
                question_limit=quota.question_limit,
                percent_used=pct
            )
        )
    return result
