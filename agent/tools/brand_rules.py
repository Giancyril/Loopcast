import re
from typing import Dict, Any, List

PLATFORM_CONSTRAINTS = {
    "twitter": {
        "max_length": 280,
        "max_hashtags": 3,
        "ideal_length_min": 100,
        "ideal_length_max": 260,
    },
    "linkedin": {
        "max_length": 3000,
        "max_hashtags": 5,
        "ideal_length_min": 250,
        "ideal_length_max": 1200,
    }
}

BANNED_BUZZWORDS = [
    "synergy", "paradigm shift", "disrupting the industry",
    "groundbreaking revolutionary", "world-class cutting-edge"
]

def critique_draft(draft: str, tone: str = "engaging") -> Dict[str, Any]:
    """Critiques a raw draft against quality, tone, and brand safety guidelines."""
    score = 100
    strengths: List[str] = []
    weaknesses: List[str] = []
    
    if not draft or len(draft.strip()) < 20:
        return {
            "score": 20,
            "passed": False,
            "strengths": [],
            "weaknesses": ["Draft is too short or empty."],
            "recommendations": "Provide meaningful, structured copy."
        }

    # Check for hook
    lines = [l.strip() for l in draft.split("\n") if l.strip()]
    first_line = lines[0] if lines else ""
    if len(first_line) > 10 and (first_line.endswith("?") or first_line.endswith("!") or any(w in first_line.lower() for w in ["how", "why", "stop", "introducing", "announcing", "here", "the"])):
        strengths.append("Strong hook in opening line.")
    else:
        score -= 10
        weaknesses.append("Opening hook could be more compelling.")

    # Check for CTA or question
    has_cta = any(w in draft.lower() for w in ["what do you think", "link below", "share your", "drop a comment", "learn more", "?", "let me know"])
    if has_cta:
        strengths.append("Clear call-to-action or conversation starter.")
    else:
        score -= 15
        weaknesses.append("Missing clear call-to-action (CTA) or engagement prompt.")

    # Check for banned buzzwords
    found_buzzwords = [bw for bw in BANNED_BUZZWORDS if bw in draft.lower()]
    if found_buzzwords:
        score -= 20
        weaknesses.append(f"Contains overused buzzwords: {', '.join(found_buzzwords)}")
    else:
        strengths.append("Authentic vocabulary free of corporate fluff.")

    # Tone check
    if tone.lower() in ["professional", "authoritative"]:
        emoji_count = len(re.findall(r'[\U00010000-\U0010ffff]', draft))
        if emoji_count > 6:
            score -= 10
            weaknesses.append("Too many emojis for a professional tone.")
        else:
            strengths.append("Tasteful balance of tone and formatting.")

    passed = score >= 75
    return {
        "score": max(0, score),
        "passed": passed,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": "Add an engaging question or CTA" if not has_cta else "Looks ready for platform formatting."
    }

def format_for_twitter(raw_text: str) -> str:
    """Adapts text to Twitter / X constraints (<= 280 chars, punchy spacing, <= 3 hashtags)."""
    clean_lines = [l.strip() for l in raw_text.split("\n") if l.strip()]
    if not clean_lines:
        return ""
    
    # Preserve hook and primary point
    summary = " ".join(clean_lines)
    # Extract existing hashtags or generate relevant tags
    tags = re.findall(r'#\w+', summary)
    text_without_tags = re.sub(r'#\w+', '', summary).strip()
    
    max_body_len = 280 - 30  # Leave room for tags
    if len(text_without_tags) > max_body_len:
        text_without_tags = text_without_tags[:max_body_len - 3] + "..."
        
    selected_tags = tags[:2] if tags else ["#Tech", "#Innovation"]
    formatted = f"{text_without_tags}\n\n{' '.join(selected_tags)}".strip()
    return formatted[:280]

def format_for_linkedin(raw_text: str) -> str:
    """Adapts text for LinkedIn (scannable paragraph breaks, professional tone, engaging CTA)."""
    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]
    if not lines:
        return ""
    
    hook = lines[0]
    body = "\n\n".join(lines[1:]) if len(lines) > 1 else raw_text
    
    if not hook.endswith((".", "!", "?")):
        hook += " ??"
        
    formatted = f"{hook}\n\n{body}\n\n---\n?? What are your thoughts on this? Let me know in the comments below!"
    # Ensure reasonable LinkedIn hashtags
    if "#" not in formatted:
        formatted += "\n\n#Leadership #Technology #Innovation #Productivity"
    return formatted
