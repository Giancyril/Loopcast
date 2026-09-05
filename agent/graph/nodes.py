import os
from typing import Dict, Any, Optional
from agent.graph.state import AgentState
from agent.tools.brand_rules import critique_draft, format_for_twitter, format_for_linkedin
from backend.app.core.config import settings

def _generate_copy(topic: str, tone: str, feedback: str = None, persona_dna: Optional[Dict[str, Any]] = None) -> str:
    """Generates social copy using LLM or deterministic fallback tailored to persona DNA."""
    persona_name = persona_dna.get("name") if persona_dna else None
    banned_words = persona_dna.get("banned_words", []) if persona_dna else []
    sample_hooks = persona_dna.get("sample_hooks", []) if persona_dna else []
    archetype = persona_dna.get("archetype", "founder") if persona_dna else "founder"
    target_audience = persona_dna.get("target_audience", "Builders & Creators") if persona_dna else "Builders & Creators"

    if settings.OPENAI_API_KEY and not settings.USE_MOCK_LLM_IF_NO_KEY:
        try:
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(model=settings.LLM_MODEL, api_key=settings.OPENAI_API_KEY)
            prompt = f"Write an engaging social media post about '{topic}' in a '{tone}' tone for target audience: {target_audience}."
            if persona_name:
                prompt += f" Persona Voice: '{persona_name}'. Archetype: {archetype}."
            if banned_words:
                prompt += f" Strictly DO NOT use these words: {', '.join(banned_words)}."
            if sample_hooks:
                prompt += f" Inspired by hook style: '{sample_hooks[0]}'."
            if feedback:
                prompt += f" Address previous reviewer feedback: '{feedback}'."
            prompt += " Include a captivating hook, concise body, and call-to-action."
            res = llm.invoke(prompt)
            return res.content.strip()
        except Exception:
            pass

    # High-quality fallback template customized by persona
    hook_prefix = sample_hooks[0] if sample_hooks else f"Here is an unfiltered take on {topic}:"
    
    if feedback:
        return (
            f"{hook_prefix}\n\n"
            f"Addressing feedback directly ({feedback}):\n"
            f"When building for {target_audience}, clear execution beats buzzword vanity metrics every single time.\n\n"
            f"What is your team's direct experience with this? Let us know below!\n\n"
            f"#Tech #{archetype.capitalize()} #Productivity"
        )
    
    if archetype == "growth_hacker":
        return (
            f"{hook_prefix}\n\n"
            f"Most teams waste hours overcomplicating {topic}.\n"
            f"We tracked 3 key metrics that drove 80% of our outcomes:\n"
            f"1. Ruthless prioritization\n"
            f"2. Automated feedback loops\n"
            f"3. Shipping daily iterations\n\n"
            f"Which one are you implementing this week?\n\n"
            f"#Growth #Strategy #Data"
        )
    elif archetype == "explainer":
        return (
            f"{hook_prefix}\n\n"
            f"Understanding {topic} comes down to one core mental model:\n"
            f"Instead of treating it as a black box, break it into input, transformation, and verification layers.\n\n"
            f"Key takeaway: Systems that enforce explicit guardrails scale with zero surprises.\n\n"
            f"Want a deeper architecture breakdown? Share your thoughts below!\n\n"
            f"#SoftwareEngineering #Architecture #TechExplained"
        )
    else:  # founder / default
        return (
            f"{hook_prefix}\n\n"
            f"We have been exploring how modern teams tackle {topic} without sacrificing quality or human oversight.\n\n"
            f"Key takeaway: Pair smart automation with continuous human review to get 10x speed with complete control.\n\n"
            f"How is your team approaching this today? Drop your thoughts below!\n\n"
            f"#Founders #BuildingInPublic #AI"
        )

def generate_node(state: AgentState) -> Dict[str, Any]:
    """Generates draft social copy, incorporating human feedback and persona DNA if present."""
    topic = state.get("topic", "Industry Trends")
    tone = state.get("tone", "engaging")
    feedback = state.get("human_feedback")
    persona_dna = state.get("persona_dna")
    
    draft = _generate_copy(topic, tone, feedback, persona_dna)
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