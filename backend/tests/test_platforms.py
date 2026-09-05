import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.security import encrypt_token, decrypt_token
from platforms.twitter_adapter import TwitterAdapter
from platforms.linkedin_adapter import LinkedInAdapter

client = TestClient(app)

def test_token_encryption_roundtrip():
    secret = "oauth_access_token_secret_12345"
    cipher = encrypt_token(secret)
    assert cipher != secret
    decrypted = decrypt_token(cipher)
    assert decrypted == secret

def test_twitter_adapter_publishing():
    adapter = TwitterAdapter(is_mock=True)
    assert adapter.verify_connection() is True
    
    # Normal post
    res = adapter.publish("Short announcement on AI agents! #Tech")
    assert res["status"] == "published"
    assert "platform_post_id" in res
    assert "url" in res

    # Exceeding 280 chars raises ValueError
    with pytest.raises(ValueError):
        adapter.publish("A" * 281)

def test_linkedin_adapter_publishing():
    adapter = LinkedInAdapter(is_mock=True)
    assert adapter.verify_connection() is True

    res = adapter.publish("Excited to share our technical milestone with the community!\n\n#Leadership")
    assert res["status"] == "published"
    assert "urn:li:share" in res["platform_post_id"]

def test_platform_api_endpoints():
    # 1. List platforms
    list_res = client.get("/api/v1/platforms")
    assert list_res.status_code == 200
    platforms = list_res.json()
    assert len(platforms) >= 2
    twitter_p = next(p for p in platforms if p["platform"] == "twitter")
    assert twitter_p["name"] == "X (formerly Twitter)"

    # 2. Connect platform
    conn_res = client.post("/api/v1/platforms/twitter/connect")
    assert conn_res.status_code == 200
    assert conn_res.json()["status"] == "connected"

    # 3. Verify connection
    verify_res = client.get("/api/v1/platforms/twitter/verify")
    assert verify_res.status_code == 200
    assert verify_res.json()["is_valid"] is True

    # 4. Disconnect platform
    disc_res = client.post("/api/v1/platforms/twitter/disconnect")
    assert disc_res.status_code == 200
    assert disc_res.json()["status"] == "disconnected"
