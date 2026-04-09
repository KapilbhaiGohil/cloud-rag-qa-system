from datetime import datetime, timezone
import time
from bson import ObjectId
from services.embedding_service import retrieve_relevant_chunks
from services.gemini_service import generate_reply_stream
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

def create_message_with_reply_stream(username: str, chat_id: str, content: str):
    user_message = {
        "chat_id": ObjectId(chat_id),
        "role": "user",
        "content": content,
        "created_at": datetime.now(timezone.utc),
    }
    messages_collection.insert_one(user_message)
    
    previous_messages = get_messages(chat_id)
    chat_history = ""
    for msg in previous_messages:
        # Don't include the message that just inserted
        if str(msg.get("_id")) != str(user_message.get("_id")):
            role = "User" if msg["role"] == "user" else "Assistant"
            chat_history += f"{role}: {msg['content']}\n"

    print(f"Searching Qdrant for: {content}")
    doc_context = retrieve_relevant_chunks(content, chat_id)

    assistant_text = ""
    for chunk in generate_reply_stream(content, chat_history, doc_context):
        assistant_text += chunk
        yield chunk

    if assistant_text.strip():
        assistant_message = {
            "chat_id": ObjectId(chat_id),
            "role": "assistant",
            "content": assistant_text,
            "created_at": datetime.now(timezone.utc),
        }
        messages_collection.insert_one(assistant_message)