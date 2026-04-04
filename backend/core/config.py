from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongo_uri: str
    db_name: str
    secret_key: str
    access_token_expire_minutes: int
    frontend_url: str
    algorithm: str
    
    class Config:
        env_file = ".env"

settings = Settings()