from fastapi import APIRouter, HTTPException
from models.user import User
from services.auth_service import authenticate_user, create_access_token, hash_password
from fastapi import status
from pydantic import BaseModel,Field
from db.client import db

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6,max_length=128)
    
@router.post("/login")
def login(request: LoginRequest):
    user = authenticate_user(request.username, request.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    token = create_access_token({"sub": user["username"]})
    return {"access_token": token, "token_type": "bearer", "username": user["username"]}

@router.post("/register")
def register(user: RegisterRequest):
    existing_user = db.users.find_one({"username": user.username})
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    hashed_pwd = hash_password(user.password)

    db.users.insert_one({
        "username": user.username,
        "password": hashed_pwd
    })

    return {"message": "User registered successfully"}