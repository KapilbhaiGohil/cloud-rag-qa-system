from pymongo import MongoClient
from core.config import settings
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

COLLECTION_NAME = "chat_documents"

try:
    client = MongoClient(settings.mongo_uri)
    client.admin.command('ping')
    db = client[settings.db_name]
    print("MongoDB connected successfully!")

    qdrant_client = QdrantClient(
        host="localhost",
        port=6333
    )
    print("Qdrant connected successfully!")

    qdrant_client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=3072,
            distance=Distance.COSINE
        )
    )
    print("Qdrant collection ready!")

except Exception as e:
    print("Connection failed:")
    print(e)