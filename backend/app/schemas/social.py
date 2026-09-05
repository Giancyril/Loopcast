from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, Any, List, Optional
from datetime import datetime

class GenerateRequest(BaseModel):
    topic: str = Field(..., description="Topic or prompt brief for content creation")
    tone: str = Field("engaging", description="Desired tone: engaging, professional, humorous, authoritative")
    target_platforms: List[str] = Field(default_factory=lambda: ["twitter", "linkedin"])

class PostApproveRequest(BaseModel):
    scheduled_for: Optional[datetime] = None

class PostRejectRequest(BaseModel):
    feedback: str = Field(..., description="Reason for rejection to guide AI regeneration")

class PostEditRequest(BaseModel):
    platform_content: Dict[str, str] = Field(..., description="Updated text for each platform")

class ApprovalLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    action: str
    reviewer_feedback: Optional[str] = None
    created_at: datetime

class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    topic: str
    tone: str
    raw_content: Optional[str] = None
    platform_content: Dict[str, str] = {}
    status: str
    critique: Dict[str, Any] = {}
    thread_id: Optional[str] = None
    scheduled_for: Optional[datetime] = None
    published_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    logs: List[ApprovalLogResponse] = []
