from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
from services.utility import error_response, success_response
from models.user import LoginRequest, RegisterRequest
from db.client import db
from services.auth_service import authenticate_user, create_access_token, hash_password

router = APIRouter(prefix="/auth", tags=["auth"])

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