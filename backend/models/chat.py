from pydantic import BaseModel, Field, field_validator


class CreateChatRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError("Chat name cannot be empty")
        return v.strip()


class ChatResponse(BaseModel):
    chat_id: str
    name: str