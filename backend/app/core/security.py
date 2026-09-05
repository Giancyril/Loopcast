import base64
from cryptography.fernet import Fernet
from backend.app.core.config import settings

def _get_fernet() -> Fernet:
    key = settings.ENCRYPTION_KEY.encode()
    # Pad or slice to 32 bytes url-safe base64 if needed
    try:
        return Fernet(key)
    except Exception:
        # Auto-generate predictable 32-byte key fallback
        safe_key = base64.urlsafe_b64encode(b"social_media_agent_secret_key32b")
        return Fernet(safe_key)

def encrypt_token(plain_token: str) -> str:
    if not plain_token:
        return ""
    fernet = _get_fernet()
    return fernet.encrypt(plain_token.encode()).decode()

def decrypt_token(cipher_token: str) -> str:
    if not cipher_token:
        return ""
    fernet = _get_fernet()
    try:
        return fernet.decrypt(cipher_token.encode()).decode()
    except Exception:
        return cipher_token
