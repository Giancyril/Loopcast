from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class BasePlatformAdapter(ABC):
    platform_name: str

    @abstractmethod
    def publish(self, content: str, media_urls: Optional[List[str]] = None) -> Dict[str, Any]:
        """Publishes content to the social media platform and returns post metadata."""
        pass

    @abstractmethod
    def verify_connection(self) -> bool:
        """Verifies if the current credentials/tokens are valid and operational."""
        pass

    @abstractmethod
    def get_account_profile(self) -> Dict[str, Any]:
        """Returns account handle, username, and connection status."""
        pass
