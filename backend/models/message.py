# models/message.py
from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime

class CreateMessageRequest(BaseModel):
    chat_id: str
    role: Literal["user", "assistant"]
    content: str


class MessageInDB(BaseModel):
    id: str
    chat_id: str
    role: str
    content: str
    created_at: datetime