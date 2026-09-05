from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.social import PlatformConnection
from backend.app.core.security import decrypt_token
from platforms.base import BasePlatformAdapter
from platforms.twitter_adapter import TwitterAdapter
from platforms.linkedin_adapter import LinkedInAdapter

class PlatformManager:
    @staticmethod
    def get_adapter(platform_name: str, db: Optional[Session] = None) -> BasePlatformAdapter:
        platform_lower = platform_name.lower()
        token = None

        if db:
            conn = db.query(PlatformConnection).filter(
                PlatformConnection.platform == platform_lower,
                PlatformConnection.is_active == True
            ).first()
            if conn and conn.access_token_enc:
                token = decrypt_token(conn.access_token_enc)

        if "twitter" in platform_lower or "x" in platform_lower:
            return TwitterAdapter(access_token=token)
        elif "linkedin" in platform_lower:
            return LinkedInAdapter(access_token=token)
        else:
            raise ValueError(f"Unsupported platform: {platform_name}")
