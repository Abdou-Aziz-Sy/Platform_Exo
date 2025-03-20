from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Base de données
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    
    # JWT
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # MinIO
    MINIO_ROOT_USER: str = "minioadmin"
    MINIO_ROOT_PASSWORD: str = "minioadmin"
    MINIO_URL: str = "localhost:9000"
    MINIO_SECURE: bool = False
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_BUCKET_NAME: str = "evaluation-files"
    EXERCISES_BUCKET: str = "exercises"
    SUBMISSIONS_BUCKET: str = "submissions"
    
    # Ollama
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_API_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "deepseek-coder"
    MODEL_NAME: str = "deepseek"
    
    class Config:
        env_file = ".env"

settings = Settings() 