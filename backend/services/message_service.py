from datetime import datetime, timezone
import time
from bson import ObjectId
from services.embedding_service import retrieve_relevant_chunks
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
    user_result = messages_collection.insert_one(user_message)
    user_message["_id"] = str(user_result.inserted_id)
    user_message["chat_id"] = str(user_message["chat_id"])
    
    previous_messages = get_messages(chat_id)
    chat_history = ""
    for msg in previous_messages:
        if str(msg["_id"]) != str(user_message["_id"]):
            role = "User" if msg["role"] == "user" else "Assistant"
            chat_history += f"{role}: {msg['content']}\n"

    print(f"Searching Qdrant for: {content}")
    doc_context = retrieve_relevant_chunks(content, chat_id)

    assistant_text = generate_reply(content, chat_history, doc_context)

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