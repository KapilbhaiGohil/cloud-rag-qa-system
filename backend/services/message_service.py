from datetime import datetime, timezone
from bson import ObjectId
from db.client import db
import time
messages_collection = db["messages"]

def get_messages(chat_id: str):
    messages = list(
        messages_collection
        .find({"chat_id": ObjectId(chat_id)})
        .sort("created_at", 1)
    )

    for msg in messages:
        msg["_id"] = str(msg["_id"])
        msg["chat_id"] = str(msg["chat_id"])

    return messages

def create_message_with_reply(username: str, chat_id: str, content: str):
    user_message = {
        "chat_id": ObjectId(chat_id),
        "role": "user",
        "content": content,
        "created_at": datetime.now(timezone.utc),
    }

    user_result = messages_collection.insert_one(user_message)
    user_message["_id"] = str(user_result.inserted_id)
    user_message["chat_id"] = str(user_message["chat_id"])

    time.sleep(1)  
    
    assistant_text = f"Echo: {content}"

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