from pymongo import MongoClient
from core.config import settings

try:
    client = MongoClient(settings.mongo_uri)
    
    client.admin.command('ping')
    
    db = client[settings.db_name]
    print("MongoDB connected successfully!")

except Exception as e:
    print("MongoDB connection failed:")
    print(e)