from datetime import datetime, timezone
from bson import ObjectId
from db.client import db
from core.minio import minio_client, BUCKET_NAME

from db.client import qdrant_client, COLLECTION_NAME
from qdrant_client.models import Filter, FieldCondition, MatchValue

documents_collection = db["documents"]

def create_document(chat_id: str, name: str, url: str, username: str):
    doc = {
        "chat_id": ObjectId(chat_id),
        "user_id": username,
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

def delete_document(doc_id: str, username: str):
    doc = documents_collection.find_one({
        "_id": ObjectId(doc_id),
        "user_id": username
    })

    if not doc:
        return 0

    try:
        file_url = doc["url"]
        object_name = file_url.split(f"/{BUCKET_NAME}/")[-1]
        minio_client.remove_object(BUCKET_NAME, object_name)
    except Exception as e:
        print("MinIO delete error:", e)

    try:
        qdrant_client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="doc_id",
                        match=MatchValue(value=str(doc_id)),
                    )
                ]
            )
        )
        print(f"Deleted Qdrant vectors for doc {doc_id}")
    except Exception as e:
        print("Qdrant delete error:", e)

    result = documents_collection.delete_one({
        "_id": ObjectId(doc_id),
        "user_id": username
    })

    return result.deleted_count