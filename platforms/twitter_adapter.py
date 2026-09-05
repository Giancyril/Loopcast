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
            "account_name": "Loopcast Bot",
            "account_handle": "@loopcast_ai",
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
                "url": f"https://x.com/loopcast_ai/status/{tweet_id}",
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

    def publish_thread(self, tweets: List[str], media_urls: Optional[List[str]] = None) -> Dict[str, Any]:
        """Publishes a sequential chain of tweets forming a connected thread."""
        if not tweets:
            raise ValueError("Thread must contain at least 1 tweet.")
        for idx, t in enumerate(tweets):
            if len(t) > 280:
                raise ValueError(f"Tweet {idx+1} exceeds 280 characters ({len(t)} chars)")

        if self.is_mock:
            published = []
            prev_id = None
            for idx, tweet_text in enumerate(tweets):
                tid = f"tw_{uuid.uuid4().hex[:12]}"
                published.append({
                    "index": idx + 1,
                    "tweet_id": tid,
                    "in_reply_to_tweet_id": prev_id,
                    "text": tweet_text,
                    "url": f"https://x.com/loopcast_ai/status/{tid}"
                })
                prev_id = tid

            return {
                "platform": "twitter",
                "is_thread": True,
                "tweet_count": len(tweets),
                "platform_post_id": published[0]["tweet_id"],
                "url": published[0]["url"],
                "thread": published,
                "status": "published",
                "is_simulation": True
            }

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        published = []
        prev_id = None
        for idx, tweet_text in enumerate(tweets):
            payload = {"text": tweet_text}
            if prev_id:
                payload["reply"] = {"in_reply_to_tweet_id": prev_id}
            
            res = httpx.post("https://api.twitter.com/2/tweets", headers=headers, json=payload, timeout=10.0)
            res.raise_for_status()
            data = res.json()
            tid = data.get("data", {}).get("id")
            published.append({
                "index": idx + 1,
                "tweet_id": tid,
                "in_reply_to_tweet_id": prev_id,
                "text": tweet_text,
                "url": f"https://x.com/i/status/{tid}"
            })
            prev_id = tid

        return {
            "platform": "twitter",
            "is_thread": True,
            "tweet_count": len(tweets),
            "platform_post_id": published[0]["tweet_id"],
            "url": published[0]["url"],
            "thread": published,
            "status": "published",
            "is_simulation": False
        }