from db.client import db
from models.user import User
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta, timezone
from core.config import settings

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)
def get_user(username: str):
    return db.users.find_one({"username": username})

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return None
    if not verify_password(password, user["password"]):
        return None
    return user

def create_access_token(data: dict, expires_delta: int = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=(expires_delta or settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm="HS256")
    return encoded_jwt