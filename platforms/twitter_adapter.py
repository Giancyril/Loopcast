import uuid
import httpx
from typing import Dict, Any, List, Optional
from platforms.base import BasePlatformAdapter

class TwitterAdapter(BasePlatformAdapter):
    platform_name = "twitter"

    def __init__(self, access_token: Optional[str] = None, is_mock: bool = True):
        self.access_token = access_token
        self.is_mock = is_mock or not access_token

    def verify_connection(self) -> bool:
        if self.is_mock:
            return True
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            res = httpx.get("https://api.twitter.com/2/users/me", headers=headers, timeout=5.0)
            return res.status_code == 200
        except Exception:
            return False

    def get_account_profile(self) -> Dict[str, Any]:
        return {
            "platform": "twitter",
            "account_name": "Aegis Media Bot",
            "account_handle": "@aegis_agent",
            "is_connected": True,
            "status": "active"
        }

    def publish(self, content: str, media_urls: Optional[List[str]] = None) -> Dict[str, Any]:
        if len(content) > 280:
            raise ValueError(f"Content exceeds Twitter 280 character limit (current: {len(content)})")

        if self.is_mock:
            tweet_id = f"tw_{uuid.uuid4().hex[:12]}"
            return {
                "platform": "twitter",
                "platform_post_id": tweet_id,
                "url": f"https://x.com/aegis_agent/status/{tweet_id}",
                "status": "published",
                "character_count": len(content),
                "is_simulation": True
            }

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        payload = {"text": content}
        res = httpx.post("https://api.twitter.com/2/tweets", headers=headers, json=payload, timeout=10.0)
        res.raise_for_status()
        data = res.json()
        tweet_id = data.get("data", {}).get("id")
        return {
            "platform": "twitter",
            "platform_post_id": tweet_id,
            "url": f"https://x.com/i/status/{tweet_id}",
            "status": "published",
            "character_count": len(content),
            "is_simulation": False
        }
