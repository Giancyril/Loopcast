from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.social import PlatformConnection
from backend.app.core.security import encrypt_token
from platforms.manager import PlatformManager

router = APIRouter(prefix="/platforms", tags=["Connected Platforms"])

SUPPORTED_PLATFORMS = [
    {
        "platform": "twitter",
        "name": "X (formerly Twitter)",
        "default_handle": "@aegis_agent",
        "description": "Short-form punchy updates, announcements, and developer news."
    },
    {
        "platform": "linkedin",
        "name": "LinkedIn",
        "default_handle": "linkedin.com/in/aegis-media",
        "description": "Longer thought leadership, team milestones, and case studies."
    }
]

@router.get("", response_model=List[Dict[str, Any]])
def list_platforms(db: Session = Depends(get_db)):
    """Returns status of all supported platforms and their connection states."""
    results = []
    for p in SUPPORTED_PLATFORMS:
        conn = db.query(PlatformConnection).filter(
            PlatformConnection.platform == p["platform"],
            PlatformConnection.is_active == True
        ).first()

        results.append({
            "platform": p["platform"],
            "name": p["name"],
            "description": p["description"],
            "is_connected": conn is not None,
            "account_handle": conn.account_handle if conn else p["default_handle"],
            "account_name": conn.account_name if conn else p["name"],
            "updated_at": conn.updated_at.isoformat() if conn else None
        })
    return results

@router.post("/{platform}/connect")
def connect_platform(platform: str, db: Session = Depends(get_db)):
    """Connects or authenticates a platform account."""
    p_lower = platform.lower()
    matched = next((p for p in SUPPORTED_PLATFORMS if p["platform"] == p_lower), None)
    if not matched:
        raise HTTPException(status_code=400, detail=f"Unsupported platform {platform}")

    conn = db.query(PlatformConnection).filter(
        PlatformConnection.platform == p_lower
    ).first()

    mock_token = f"oauth_token_{p_lower}_simulated_secret"
    enc_token = encrypt_token(mock_token)

    if not conn:
        conn = PlatformConnection(
            platform=p_lower,
            account_name=matched["name"],
            account_handle=matched["default_handle"],
            access_token_enc=enc_token,
            is_active=True
        )
        db.add(conn)
    else:
        conn.is_active = True
        conn.access_token_enc = enc_token
        conn.account_handle = matched["default_handle"]

    db.commit()
    db.refresh(conn)
    return {
        "status": "connected",
        "platform": p_lower,
        "account_handle": conn.account_handle,
        "message": f"Successfully connected {matched['name']}"
    }

@router.post("/{platform}/disconnect")
def disconnect_platform(platform: str, db: Session = Depends(get_db)):
    """Disconnects or revokes account connection."""
    p_lower = platform.lower()
    conn = db.query(PlatformConnection).filter(
        PlatformConnection.platform == p_lower
    ).first()
    if conn:
        conn.is_active = False
        db.commit()
    return {"status": "disconnected", "platform": p_lower}

@router.get("/{platform}/verify")
def verify_platform_connection(platform: str, db: Session = Depends(get_db)):
    """Verifies that platform credentials are functioning."""
    try:
        adapter = PlatformManager.get_adapter(platform, db=db)
        is_valid = adapter.verify_connection()
        return {
            "platform": platform,
            "is_valid": is_valid,
            "status": "operational" if is_valid else "degraded"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
