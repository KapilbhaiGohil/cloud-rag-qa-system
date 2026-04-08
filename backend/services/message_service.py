from datetime import datetime, timezone
import time
from bson import ObjectId
from services.gemini_service import generate_reply
from db.client import db

messages_collection = db["messages"]

def get_messages(chat_id: str):
    messages = list(
        messages_collection
        .find({"chat_id": ObjectId(chat_id)})
        .sort("created_at", 1)
    )
    # print("Fetched Messages:", messages)
    for msg in messages:
        msg["_id"] = str(msg["_id"])
        msg["chat_id"] = str(msg["chat_id"])
        if "created_at" in msg and isinstance(msg["created_at"], datetime):
            msg["created_at"] = msg["created_at"].replace(tzinfo=timezone.utc).isoformat()
    return messages

def create_message_with_reply(username: str, chat_id: str, content: str):
    user_message = {
        "chat_id": ObjectId(chat_id),
        "role": "user",
        "content": content,
        "created_at": datetime.now(timezone.utc),
    }
    # print("User Message:", user_message)
    user_result = messages_collection.insert_one(user_message)
    user_message["_id"] = str(user_result.inserted_id)
    user_message["chat_id"] = str(user_message["chat_id"])
    
    previous_messages = get_messages(chat_id)

    context = ""
    for msg in previous_messages:
        role = "User" if msg["role"] == "user" else "Assistant"
        context += f"{role}: {msg['content']}\n"

    context += f"User: {content}\nAssistant:"
    # time.sleep(6) 
    assistant_text = generate_reply(context,context)

    assistant_message = {
        "chat_id": ObjectId(chat_id),
        "role": "assistant",
        "content": assistant_text,
        "created_at": datetime.now(timezone.utc),
    }

    assistant_result = messages_collection.insert_one(assistant_message)
    assistant_message["_id"] = str(assistant_result.inserted_id)
    assistant_message["chat_id"] = str(assistant_message["chat_id"])

    return {
        "user_message": user_message,
        "assistant_message": assistant_message,
    }