import uuid
import httpx
from typing import Dict, Any, List, Optional
from platforms.base import BasePlatformAdapter

class LinkedInAdapter(BasePlatformAdapter):
    platform_name = "linkedin"

    def __init__(self, access_token: Optional[str] = None, is_mock: bool = True):
        self.access_token = access_token
        self.is_mock = is_mock or not access_token

    def verify_connection(self) -> bool:
        if self.is_mock:
            return True
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            res = httpx.get("https://api.linkedin.com/v2/userinfo", headers=headers, timeout=5.0)
            return res.status_code == 200
        except Exception:
            return False

    def get_account_profile(self) -> Dict[str, Any]:
        return {
            "platform": "linkedin",
            "account_name": "Aegis Media Team",
            "account_handle": "linkedin.com/in/aegis-media",
            "is_connected": True,
            "status": "active"
        }

    def publish(self, content: str, media_urls: Optional[List[str]] = None) -> Dict[str, Any]:
        if len(content) > 3000:
            raise ValueError(f"Content exceeds LinkedIn 3000 character limit (current: {len(content)})")

        if self.is_mock:
            post_urn = f"urn:li:share:{uuid.uuid4().hex[:12]}"
            return {
                "platform": "linkedin",
                "platform_post_id": post_urn,
                "url": f"https://www.linkedin.com/feed/update/{post_urn}",
                "status": "published",
                "character_count": len(content),
                "is_simulation": True
            }

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0"
        }
        payload = {
            "author": "urn:li:person:me",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": content},
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"}
        }
        res = httpx.post("https://api.linkedin.com/v2/ugcPosts", headers=headers, json=payload, timeout=10.0)
        res.raise_for_status()
        urn = res.headers.get("x-restli-id", f"urn:li:share:{uuid.uuid4().hex[:8]}")
        return {
            "platform": "linkedin",
            "platform_post_id": urn,
            "url": f"https://www.linkedin.com/feed/update/{urn}",
            "status": "published",
            "character_count": len(content),
            "is_simulation": False
        }
