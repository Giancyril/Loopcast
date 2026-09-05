from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, Any, List, Optional
from datetime import datetime

class PersonaBase(BaseModel):
    name: str = Field(..., description="Persona display name")
    handle_or_tag: Optional[str] = Field(None, description="Tag or handle alias")
    bio: Optional[str] = Field(None, description="Bio or core mission")
    archetype: str = Field("founder", description="Archetype e.g. founder, explainer, growth_hacker, executive")
    tone_attributes: Dict[str, int] = Field(
        default_factory=lambda: {"wit": 60, "formality": 40, "provocation": 50, "technical_depth": 70}
    )
    banned_words: List[str] = Field(
        default_factory=lambda: ["delve", "game-changer", "unleash", "tapestry", "supercharge"]
    )
    sample_hooks: List[str] = Field(default_factory=list)
    target_audience: str = Field("Tech Builders & Founders", description="Primary reader persona")
    is_default: bool = False

class PersonaCreate(PersonaBase):
    pass

class PersonaUpdate(BaseModel):
    name: Optional[str] = None
    handle_or_tag: Optional[str] = None
    bio: Optional[str] = None
    archetype: Optional[str] = None
    tone_attributes: Optional[Dict[str, int]] = None
    banned_words: Optional[List[str]] = None
    sample_hooks: Optional[List[str]] = None
    target_audience: Optional[str] = None
    is_default: Optional[bool] = None

class PersonaResponse(PersonaBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime

class GenerateRequest(BaseModel):
    topic: str = Field(..., description="Topic or prompt brief for content creation")
    tone: str = Field("engaging", description="Desired tone: engaging, professional, humorous, authoritative")
    persona_id: Optional[str] = Field(None, description="Optional persona ID to enforce voice DNA")
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
    persona_id: Optional[str] = None
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
    persona: Optional[PersonaResponse] = None