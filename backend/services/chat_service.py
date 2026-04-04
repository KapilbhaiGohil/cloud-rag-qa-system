from db.client import db
from datetime import datetime, timezone
from bson import ObjectId


def create_chat(username: str, name: str):
    chat = {
        "user_id": username,
        "name": name,
        "created_at": datetime.now(timezone.utc)
    }

    result = db.chats.insert_one(chat)

    return {
        "_id": str(result.inserted_id),
        "name": name
    }


def get_chats(username: str):
    chats = list(db.chats.find({"user_id": username}))

    for c in chats:
        c["_id"] = str(c["_id"])

    return chats


def rename_chat(username: str, chat_id: str, name: str):
    obj_id = ObjectId(chat_id)

    result = db.chats.update_one(
        {"_id": obj_id, "user_id": username},
        {"$set": {"name": name}}
    )

    return result.matched_count


def delete_chat(username: str, chat_id: str):
    obj_id = ObjectId(chat_id)

    result = db.chats.delete_one(
        {"_id": obj_id, "user_id": username}
    )

    if result.deleted_count:
        db.documents.delete_many({"chat_id": obj_id})
        db.messages.delete_many({"chat_id": obj_id})

    return result.deleted_count