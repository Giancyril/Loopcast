import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="allow")

    PROJECT_NAME: str = "AI Social Media Agent API"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./social_agent.db"
    
    # Encryption secret for OAuth token storage
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "u_8K9zY0b3v6p1X5m2q7R4w8Z1a9C3e5G7i8K0m2O4s=")
    
    # LLM Settings (OpenAI / Anthropic / Mock)
    OPENAI_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gpt-4o-mini"
    USE_MOCK_LLM_IF_NO_KEY: bool = True
    
    # Platform Simulator Settings
    SIMULATE_PLATFORM_POSTING: bool = True
    
    # Scheduler Settings
    SCHEDULER_INTERVAL_SECONDS: int = 15

settings = Settings()
