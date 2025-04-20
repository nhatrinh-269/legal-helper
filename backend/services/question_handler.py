import httpx
from core.config import settings

async def send_question_to_gemini(question: str, user_id: int) -> str:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.GEMINI_API_KEY}"
    }

    payload = {
        "contents": [
            {
                "parts": [{"text": question}]
            }
        ]
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url=settings.GEMINI_CONFIG["endpoint"],
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            # Tùy thuộc vào response thực tế từ Gemini
            return result["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        return f"❌ Gemini API Error: {e}"
