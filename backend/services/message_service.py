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
    user_result = messages_collection.insert_one(user_message)
    user_id = str(user_result.inserted_id)
    
    assistant_placeholder = {
        "chat_id": ObjectId(chat_id),
        "role": "assistant",
        "content": "",
        "is_aborted": True,
        "created_at": datetime.now(timezone.utc),
    }
    result = messages_collection.insert_one(assistant_placeholder)
    assistant_id = str(result.inserted_id)
    
    yield f"MSG_ID:{user_id},{assistant_id}\n"
    
    previous_messages = get_messages(chat_id)
    chat_history = ""
    for msg in previous_messages:
        if str(msg.get("_id")) != str(user_message.get("_id")):
            role = "User" if msg["role"] == "user" else "Assistant"
            chat_history += f"{role}: {msg['content']}\n"
            if(msg.get("is_aborted", False)):
                chat_history += "[This response was stopped by the user]\n"

    print(f"Searching Qdrant for: {content}")
    doc_context = retrieve_relevant_chunks(content, chat_id)

    assistant_text = ""
    for chunk in generate_reply_stream(content, chat_history, doc_context):
        assistant_text += chunk
        yield chunk

    messages_collection.update_one(
        {"_id": ObjectId(assistant_id)},
        {"$set": {"content": assistant_text, "is_aborted": False}}
    )
    
def update_aborted_message(message_id: str, content: str):
    messages_collection.update_one(
        {"_id": ObjectId(message_id)},
        {"$set": {"content": content, "is_aborted": True}}
    )