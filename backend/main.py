from fastapi import FastAPI
from api.auth import router as auth_router
from api.chat import router as chat_router
from api.message import router as message_router
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
app = FastAPI(title="FastAPI + MongoDB Auth")

origins = [settings.frontend_url]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(chat_router)
app.include_router(auth_router)
app.include_router(message_router)