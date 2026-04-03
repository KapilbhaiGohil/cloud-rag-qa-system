from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
from db.client import db
from services.auth_service import authenticate_user, create_access_token, hash_password

router = APIRouter(prefix="/auth", tags=["auth"])

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

def success_response(message: str, data: dict = None):
    return {
        "success": True,
        "message": message,
        "data": data or {}
    }


def error_response(message: str, errors: dict = None):
    return {
        "success": False,
        "message": message,
        "errors": errors or {}
    }

@router.post("/login")
def login(request: LoginRequest):
    user = authenticate_user(request.username, request.password)

    if not user:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content=error_response(
                "Invalid credentials",
                {"auth": "Incorrect username or password"}
            )
        )

    token = create_access_token({"sub": user["username"]})

    return success_response(
        "Login successful",
        {
            "access_token": token,
            "token_type": "bearer",
            "username": user["username"]
        }
    )


@router.post("/register")
def register(user: RegisterRequest):
    existing_user = db.users.find_one({"username": user.username})

    if existing_user:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=error_response(
                "Registration failed",
                {"username": "Username already exists"}
            )
        )

    hashed_pwd = hash_password(user.password)

    db.users.insert_one({
        "username": user.username,
        "password": hashed_pwd
    })

    return success_response("User registered successfully")