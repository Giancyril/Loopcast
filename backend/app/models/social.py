import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Persona(Base):
    __tablename__ = "personas"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    handle_or_tag = Column(String(50), nullable=True)
    bio = Column(Text, nullable=True)
    archetype = Column(String(50), default="founder")  # founder, explainer, growth_hacker, executive
    tone_attributes = Column(JSON, default=dict)
    banned_words = Column(JSON, default=list)
    sample_hooks = Column(JSON, default=list)
    target_audience = Column(String(255), default="Tech Builders & Creators")
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Post(Base):
    __tablename__ = "posts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    topic = Column(String(255), nullable=False)
    tone = Column(String(50), default="engaging")
    persona_id = Column(String(36), ForeignKey("personas.id"), nullable=True)
    raw_content = Column(Text, nullable=True)
    platform_content = Column(JSON, default=dict)  # {"twitter": "...", "linkedin": "..."}
    is_thread = Column(Boolean, default=False)
    thread_tweets = Column(JSON, default=list)  # ["1/N ...", "2/N ..."]
    carousel_slides = Column(JSON, default=list)  # [{"slide": 1, "title": "...", "content": "..."}]
    status = Column(String(50), default="pending_approval", index=True)
    critique = Column(JSON, default=dict)
    thread_id = Column(String(64), nullable=True, index=True)
    scheduled_for = Column(DateTime, nullable=True, index=True)
    published_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    persona = relationship("Persona", lazy="joined")
    logs = relationship("ApprovalLog", back_populates="post", cascade="all, delete-orphan")

class PlatformConnection(Base):
    __tablename__ = "platform_connections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    platform = Column(String(50), nullable=False, index=True)
    account_name = Column(String(255), nullable=False)
    account_handle = Column(String(255), nullable=True)
    access_token_enc = Column(Text, nullable=True)
    refresh_token_enc = Column(Text, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ApprovalLog(Base):
    __tablename__ = "approval_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    post_id = Column(String(36), ForeignKey("posts.id"), nullable=False, index=True)
    action = Column(String(50), nullable=False)
    reviewer_feedback = Column(Text, nullable=True)
    diff_content = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="logs")