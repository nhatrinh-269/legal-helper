from pydantic import BaseModel
from typing import List
from datetime import datetime

class ChatRequest(BaseModel):
    user_id: int
    question: str


class ChatResponse(BaseModel):
    answer: str

class ChatMessage(BaseModel):
    role: str
    text: str

class ChatCreateRequest(BaseModel):
    user_id: int
    message_content: List[ChatMessage]

class ChatUpdateRequest(BaseModel):
    message_content: List[ChatMessage]

class ChatItem(BaseModel):
    id: int
    user_id: int
    title: str
    message_content: List[ChatMessage]
    timestamp: datetime

class ChatListResponse(BaseModel):
    chats: List[ChatItem]
