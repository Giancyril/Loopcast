from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas.social import (
    GenerateRequest,
    PostApproveRequest,
    PostRejectRequest,
    PostEditRequest,
    PostResponse
)
from backend.app.services.post_service import PostService

router = APIRouter(prefix="/posts", tags=["Posts & Approval"])

@router.post("/generate", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def generate_post_endpoint(
    req: GenerateRequest,
    db: Session = Depends(get_db)
):
    """Triggers LangGraph agent to generate copy, self-critique, and store as pending_approval."""
    try:
        post = PostService.generate_post(
            db=db,
            topic=req.topic,
            tone=req.tone,
            target_platforms=req.target_platforms,
            persona_id=req.persona_id
        )
        return post
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@router.get("", response_model=List[PostResponse])
def list_posts_endpoint(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lists posts, optionally filtered by status (e.g. pending_approval, scheduled, published)."""
    return PostService.list_posts(db=db, status=status)

@router.get("/{post_id}", response_model=PostResponse)
def get_post_endpoint(
    post_id: str,
    db: Session = Depends(get_db)
):
    post = PostService.get_post(db=db, post_id=post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.post("/{post_id}/approve", response_model=PostResponse)
def approve_post_endpoint(
    post_id: str,
    req: PostApproveRequest,
    db: Session = Depends(get_db)
):
    """Approves a post and optionally schedules it for a specific timestamp."""
    try:
        return PostService.approve_post(db=db, post_id=post_id, scheduled_for=req.scheduled_for)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{post_id}/reject", response_model=PostResponse)
def reject_post_endpoint(
    post_id: str,
    req: PostRejectRequest,
    db: Session = Depends(get_db)
):
    """Rejects a post with feedback, automatically prompting the agent to regenerate a new draft."""
    try:
        return PostService.reject_post_with_feedback(db=db, post_id=post_id, feedback=req.feedback)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{post_id}/edit", response_model=PostResponse)
def edit_post_endpoint(
    post_id: str,
    req: PostEditRequest,
    db: Session = Depends(get_db)
):
    """Performs manual inline edit of platform text prior to approval."""
    try:
        return PostService.edit_post(db=db, post_id=post_id, platform_content=req.platform_content)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
