import httpx
from core.config import settings

async def askllms(question: str) -> str:
    url = f"{settings.GEMINI_CONFIG['endpoint']}?key={settings.GEMINI_API_KEY}"
    headers = {
        "Content-Type": "application/json"
    }

    payload = {
        "contents": [{
            "parts": [{"text": question}]
        }]
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            headers=headers,
            json=payload
        )

    if response.status_code == 200:
        gemini_reply = response.json()
        try:
            return gemini_reply["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError):
            return "Tôi không thể hiểu được phản hồi từ mô hình Gemini."
    else:
        return f"Lỗi từ Gemini API: {response.status_code} - {response.text}"
