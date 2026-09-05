from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict):
    topic: str
    tone: str
    persona_dna: Optional[Dict[str, Any]]
    target_platforms: List[str]
    generate_thread: bool
    thread_tweets: List[str]
    carousel_slides: List[Dict[str, Any]]
    raw_draft: str
    critique: Dict[str, Any]
    critique_passed: bool
    iteration_count: int
    platform_posts: Dict[str, str]
    human_feedback: Optional[str]
    approval_status: str  # "pending_approval", "approved", "rejected", "published"
    error: Optional[str]