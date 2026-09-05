import os
from typing import Dict, Any
from agent.graph.state import AgentState
from agent.tools.brand_rules import critique_draft, format_for_twitter, format_for_linkedin
from backend.app.core.config import settings

def _generate_copy(topic: str, tone: str, feedback: str = None) -> str:
    """Generates social copy using LLM or deterministic fallback."""
    if settings.OPENAI_API_KEY and not settings.USE_MOCK_LLM_IF_NO_KEY:
        try:
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(model=settings.LLM_MODEL, api_key=settings.OPENAI_API_KEY)
            prompt = f"Write an engaging social media post about '{topic}' in a '{tone}' tone."
            if feedback:
                prompt += f" Previous version received this human feedback to address: '{feedback}'."
            prompt += " Include a captivating hook, concise body, and call-to-action."
            res = llm.invoke(prompt)
            return res.content.strip()
        except Exception:
            pass

    # High-quality fallback template
    if feedback:
        return (
            f"?? Excited to share an updated perspective on {topic}!\n\n"
            f"Taking your feedback directly to heart ({feedback}):\n"
            f"Here is why focusing on real execution, clear workflows, and automated oversight matters more than hype.\n\n"
            f"What has been your team's biggest challenge with this? Let us know in the comments below! ??\n\n"
            f"#Innovation #Productivity #AI"
        )
    
    return (
        f"?? Is your team ready for the next shift in {topic}?\n\n"
        f"We have been exploring how modern teams can streamline workflows without sacrificing quality or human oversight.\n\n"
        f"Key takeaway: When you pair smart automation with clear human review, you get 10x speed with 100% confidence.\n\n"
        f"How is your organization approaching this today? Drop your thoughts below! ??\n\n"
        f"#Productivity #FutureOfWork #Technology"
    )

def generate_node(state: AgentState) -> Dict[str, Any]:
    """Generates draft social copy, incorporating human feedback if present."""
    topic = state.get("topic", "Industry Trends")
    tone = state.get("tone", "engaging")
    feedback = state.get("human_feedback")
    
    draft = _generate_copy(topic, tone, feedback)
    return {
        "raw_draft": draft,
        "iteration_count": state.get("iteration_count", 0) + 1
    }

def critique_node(state: AgentState) -> Dict[str, Any]:
    """Evaluates raw draft against quality, tone, and brand safety rules."""
    draft = state.get("raw_draft", "")
    tone = state.get("tone", "engaging")
    
    critique_result = critique_draft(draft, tone)
    return {
        "critique": critique_result,
        "critique_passed": critique_result["passed"]
    }

def format_node(state: AgentState) -> Dict[str, Any]:
    """Formats the approved draft into platform-specific variants."""
    raw = state.get("raw_draft", "")
    platforms = state.get("target_platforms") or ["twitter", "linkedin"]
    
    posts: Dict[str, str] = {}
    for p in platforms:
        p_lower = p.lower()
        if "twitter" in p_lower or "x" in p_lower:
            posts["twitter"] = format_for_twitter(raw)
        elif "linkedin" in p_lower:
            posts["linkedin"] = format_for_linkedin(raw)
        else:
            posts[p_lower] = raw
            
    return {
        "platform_posts": posts,
        "approval_status": "pending_approval"
    }

def await_approval_node(state: AgentState) -> Dict[str, Any]:
    """Interrupt point for human-in-the-loop review."""
    return {
        "approval_status": state.get("approval_status", "pending_approval")
    }
