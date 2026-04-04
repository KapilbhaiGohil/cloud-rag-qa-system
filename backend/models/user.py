from pydantic import BaseModel, Field, field_validator
from typing import Optional

class User(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=4)
    id: Optional[str] = None  

class LoginRequest(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Username cannot be empty")
        return v.strip()


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=6, max_length=128)

    @field_validator("username")
    @classmethod
    def clean_username(cls, v):
        if not v.strip():
            raise ValueError("Username cannot be empty")
        if " " in v:
            raise ValueError("Username cannot contain spaces")
        return v.strip()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if " " in v:
            raise ValueError("Password cannot contain spaces")
        return v
