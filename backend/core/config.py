from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongo_uri: str
    db_name: str
    secret_key: str
    access_token_expire_minutes: int
    frontend_url: str
    algorithm: str
    minio_endpoint: str
    minio_access_key: str
    minio_secret_key: str
    minio_bucket_name: str
    gemini_api_key: str
    gemini_model: str
    qdrant_host: str
    qdrant_port: int
    qdrant_collection: str
    vector_dimension: int
    class Config:
        env_file = ".env"

settings = Settings()