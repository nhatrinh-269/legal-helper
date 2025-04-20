import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import date

from core.config import settings
from models.UsageQuota import UsageQuota


async def askllms(question: str, user_id: int, db: Session) -> str:
    # 1. Kiểm tra quota hôm nay của user
    quota = db.query(UsageQuota).filter_by(user_id=user_id, usage_date=date.today()).first()

    if not quota:
        raise HTTPException(status_code=403, detail="Bạn chưa được cấp quota sử dụng hôm nay.")

    if quota.questions_asked >= quota.question_limit:
        raise HTTPException(status_code=403, detail="Bạn đã hết lượt hỏi trong ngày.")

    # 2. Gọi Gemini API
    url = f"{settings.GEMINI_CONFIG['endpoint']}?key={settings.GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{
            "parts": [{"text": question}]
        }]
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Lỗi từ Gemini API")

    try:
        answer = response.json()["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        raise HTTPException(status_code=500, detail="Không thể xử lý phản hồi từ mô hình Gemini")

    # 3. Cập nhật số câu hỏi đã hỏi
    quota.questions_asked += 1
    db.commit()

    return answer
