from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict):
    topic: str
    tone: str
    target_platforms: List[str]
    raw_draft: str
    critique: Dict[str, Any]
    critique_passed: bool
    iteration_count: int
    platform_posts: Dict[str, str]
    human_feedback: Optional[str]
    approval_status: str  # "pending_approval", "approved", "rejected", "published"
    error: Optional[str]
