from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # Database
    database_url: str = os.getenv("DATABASE_URL")
    
    # API Keys
    openai_api_key: Optional[str] = None
    firecrawl_api_key: Optional[str] = os.getenv("FIRECRAWL_API_KEY")
    
    # Temporal
    temporal_endpoint: str = os.getenv("TEMPORAL_ENDPOINT")
    temporal_namespace: str = os.getenv("TEMPORAL_NAMESPACE")
    
    # Firebase
    firebase_credentials_path: Optional[str] = os.getenv("FIREBASE_CREDENTIALS_PATH")
    
    class Config:
        env_file = ".env"

settings = Settings()