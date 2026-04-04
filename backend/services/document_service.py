# services/document_service.py
from datetime import datetime, timezone
from bson import ObjectId
from db.client import db

documents_collection = db["documents"]


def create_document(chat_id: str, name: str, url: str):
    doc = {
        "chat_id": ObjectId(chat_id),
        "name": name,
        "url": url,
        "created_at": datetime.now(timezone.utc),
    }

    result = documents_collection.insert_one(doc)

    doc["_id"] = str(result.inserted_id)
    doc["chat_id"] = str(doc["chat_id"])

    return doc


def get_documents(chat_id: str):
    docs = list(
        documents_collection
        .find({"chat_id": ObjectId(chat_id)})
        .sort("created_at", -1)
    )

    for d in docs:
        d["_id"] = str(d["_id"])
        d["chat_id"] = str(d["chat_id"])

    return docs


def rename_document(doc_id: str, name: str):
    result = documents_collection.update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": {"name": name}}
    )
    return result.modified_count

def delete_document(doc_id: str):
    result = documents_collection.delete_one(
        {"_id": ObjectId(doc_id)}
    )
    return result.deleted_count