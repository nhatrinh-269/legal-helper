from fastapi import APIRouter, HTTPException
from schemas.user.chat import ChatRequest, ChatResponse
from services.question_handler import askllms

router = APIRouter()

@router.post("/askllms", response_model=ChatResponse)
async def ask_question(payload: ChatRequest):
    answer = await askllms(payload.question)
    if not answer:
        raise HTTPException(status_code=500, detail="Không nhận được phản hồi từ Gemini.")
    return ChatResponse(answer=answer)
