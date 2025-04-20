from fastapi import APIRouter, Depends, HTTPException
from schemas.user.chat import (
    ChatRequest, ChatResponse,
    ChatCreateRequest, ChatUpdateRequest, ChatItem
)
from services.question_handler import askllms
from models.ChatHistory import ChatHistory
from sqlalchemy.orm import Session
from database.connection import get_db
from typing import List

router = APIRouter()

@router.post("/askllms", response_model=ChatResponse)
async def ask_question(payload: ChatRequest, db: Session = Depends(get_db)):
    answer = await askllms(payload.question, payload.user_id, db)
    if not answer:
        raise HTTPException(status_code=500, detail="Không nhận được phản hồi từ Gemini.")
    return ChatResponse(answer=answer)

@router.post("/create", response_model=ChatItem)
def create_chat(payload: ChatCreateRequest, db: Session = Depends(get_db)):
    title = payload.message_content[0].text[:10] if payload.message_content else "No Title"
    new_chat = ChatHistory(
        user_id=payload.user_id,
        message_content=[msg.dict() for msg in payload.message_content]
    )
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return {
        "id": new_chat.chat_id,
        "user_id": new_chat.user_id,
        "title": title,
        "message_content": new_chat.message_content,
        "timestamp": new_chat.timestamp
    }

@router.put("/update/{chat_id}", response_model=ChatItem)
def update_chat(chat_id: int, payload: ChatUpdateRequest, db: Session = Depends(get_db)):
    chat = db.query(ChatHistory).filter_by(chat_id=chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    chat.message_content = [msg.dict() for msg in payload.message_content]
    db.commit()
    db.refresh(chat)
    return {
        "id": chat.chat_id,
        "user_id": chat.user_id,
        "title": chat.message_content[0]['text'][:10] if chat.message_content else "No Title",
        "message_content": chat.message_content,
        "timestamp": chat.timestamp
    }

@router.get("/list/{user_id}", response_model=List[ChatItem])
def list_chats(user_id: int, db: Session = Depends(get_db)):
    chats = db.query(ChatHistory).filter_by(user_id=user_id).order_by(ChatHistory.timestamp.desc()).all()
    return [
        {
            "id": c.chat_id,
            "user_id": c.user_id,
            "title": c.message_content[0]['text'][:10] if c.message_content else "No Title",
            "message_content": c.message_content,
            "timestamp": c.timestamp
        }
        for c in chats
    ]

@router.delete("/delete/{chat_id}")
def delete_chat(chat_id: int, db: Session = Depends(get_db)):
    chat = db.query(ChatHistory).filter_by(chat_id=chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(chat)
    db.commit()
    return {"message": "Chat deleted"}
