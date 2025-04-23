# backend/services/question_handler.py

import httpx
from httpx import ReadTimeout
from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import date

from models.UsageQuota import UsageQuota
from models.Subscriptions import Subscription, SubscriptionStatus
from models.ServicePackages import ServicePackage

from core.config import settings

async def askllms(
    user_id: int,
    question: str,
    histories: list[dict],
    db: Session
) -> str:
    # 1. Kiểm tra quota (logic cũ)
    quota = db.query(UsageQuota).filter_by(user_id=user_id).first()
    if not quota:
        raise HTTPException(403, "Bạn chưa được cấp quota hôm nay.")
    if quota.questions_asked >= quota.question_limit:
        raise HTTPException(403, "Bạn đã hết lượt hỏi trong ngày.")

    # 2. Lấy plan_type thật sự từ Subscription & package
    sub = (
        db.query(Subscription)
          .filter_by(user_id=user_id, status=SubscriptionStatus.active)
          .order_by(Subscription.end_time.desc())
          .first()
    )
    if sub:
        pkg = db.query(ServicePackage).filter_by(package_id=sub.package_id).first()
        plan_type = pkg.package_name.lower()  # "free" / "pro" / "premium"
        print("Plan type:", plan_type)
    else:
        print("No active subscription found, defaulting to free plan.")
        plan_type = "free"

    # 3. Forward payload lên Law-RAG API
    url = settings.LAW_RAG_CHAT_URL
    payload = {
        "question": question,
        "histories": histories,
        "plan_type": plan_type
    }

    # Thiết lập timeout đầy đủ: connect, read, write, pool
    timeout = httpx.Timeout(connect=5.0, read=60.0, write=60.0, pool=5.0)

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            res = await client.post(url, json=payload)
    except ReadTimeout:
        raise HTTPException(504, "Service pháp lý đang bận, vui lòng thử lại sau.")
    except httpx.HTTPError as e:
        raise HTTPException(502, f"Lỗi kết nối đến service pháp lý: {e}")

    if res.status_code != 200:
        raise HTTPException(res.status_code, f"Law-RAG lỗi: {res.text}")

    body = res.json()
    if body.get("error"):
        raise HTTPException(500, body["error"])
    answer = body.get("response") or ""

    # 4. Cập nhật quota
    quota.questions_asked += 1
    db.commit()

    return answer.strip()
