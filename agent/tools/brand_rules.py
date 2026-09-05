import re
from typing import Dict, Any, List, Optional

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

DEFAULT_BANNED_BUZZWORDS = [
    "synergy", "paradigm shift", "disrupting the industry",
    "groundbreaking revolutionary", "world-class cutting-edge",
    "delve", "game-changer", "unleash", "tapestry", "supercharge"
]

def evaluate_voice_consistency(draft: str, persona_dna: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Evaluates text against brand voice DNA, tone radar attributes, and forbidden buzzwords."""
    if not draft or not draft.strip():
        return {"voice_match_score": 0, "violations": ["Empty copy"], "passed": False}
    
    score = 100
    violations: List[str] = []
    strengths: List[str] = []
    
    banned = list(DEFAULT_BANNED_BUZZWORDS)
    if persona_dna and persona_dna.get("banned_words"):
        banned.extend([w.lower() for w in persona_dna["banned_words"]])
    banned = list(set(banned))
    
    lower_draft = draft.lower()
    found_banned = [w for w in banned if re.search(r'\b' + re.escape(w) + r'\b', lower_draft)]
    if found_banned:
        deduction = min(40, len(found_banned) * 15)
        score -= deduction
        violations.append(f"Forbidden buzzwords detected: {', '.join(found_banned)}")
    else:
        strengths.append("Strictly adhered to buzzword blacklist.")

    # Sentence rhythm and length variance
    sentences = [s.strip() for s in re.split(r'[.!?]+', draft) if s.strip()]
    if sentences:
        lengths = [len(s.split()) for s in sentences]
        avg_len = sum(lengths) / len(lengths)
        if avg_len > 25:
            score -= 10
            violations.append("Sentences are overly long/run-on; breaks reader cadence.")
        elif avg_len < 6:
            score -= 5
            violations.append("Sentences are excessively fragmented.")
        else:
            strengths.append(f"Optimal sentence cadence (avg {avg_len:.1f} words/sentence).")
    
    # Archetype tone evaluation
    if persona_dna:
        tone_attrs = persona_dna.get("tone_attributes", {})
        formality = tone_attrs.get("formality", 50)
        wit = tone_attrs.get("wit", 50)
        
        # High formality shouldn't have excessive slang or loose punctuation
        if formality > 70 and ("lol" in lower_draft or "?!" in draft or "!?" in draft):
            score -= 10
            violations.append("Informal slang/punctuation conflicts with high formality requirement.")
        
        # High wit should have punchy formatting or rhetorical questions
        if wit > 70 and not any(mark in draft for mark in ["?", ":", "\n\n"]):
            score -= 10
            violations.append("Tone lacks the punchy cadence expected for a witty voice archetype.")

    match_score = max(0, min(100, score))
    return {
        "voice_match_score": match_score,
        "passed": match_score >= 70,
        "violations": violations,
        "strengths": strengths
    }

def critique_draft(draft: str, tone: str = "engaging", persona_dna: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Critiques a raw draft against quality, tone, brand safety, and persona consistency."""
    score = 100
    strengths: List[str] = []
    weaknesses: List[str] = []
    
    if not draft or len(draft.strip()) < 20:
        return {
            "score": 20,
            "passed": False,
            "strengths": [],
            "weaknesses": ["Draft is too short or empty."],
            "recommendations": "Provide meaningful, structured copy.",
            "voice_match_score": 20
        }

    # Check for hook
    lines = [l.strip() for l in draft.split("\n") if l.strip()]
    first_line = lines[0] if lines else ""
    if len(first_line) > 10 and (first_line.endswith("?") or first_line.endswith("!") or any(w in first_line.lower() for w in ["how", "why", "stop", "introducing", "announcing", "here", "the", "most", "unpopular", "we"])):
        strengths.append("Strong hook in opening line.")
    else:
        score -= 10
        weaknesses.append("Opening hook could be more compelling.")

    # Check for CTA or question
    has_cta = any(w in draft.lower() for w in ["what do you think", "link below", "share your", "drop a comment", "learn more", "?", "let me know", "thoughts below"])
    if has_cta:
        strengths.append("Clear call-to-action or conversation starter.")
    else:
        score -= 15
        weaknesses.append("Missing clear call-to-action (CTA) or engagement prompt.")

    # Guardrail check against voice consistency and banned buzzwords
    guardrail = evaluate_voice_consistency(draft, persona_dna)
    if not guardrail["passed"]:
        score -= 20
        weaknesses.extend(guardrail["violations"])
    else:
        strengths.extend(guardrail["strengths"])

    # Tone check
    if tone.lower() in ["professional", "authoritative"]:
        emoji_count = len(re.findall(r'[\U00010000-\U0010ffff]', draft))
        if emoji_count > 6:
            score -= 10
            weaknesses.append("Too many emojis for a professional tone.")
        else:
            strengths.append("Tasteful balance of tone and formatting.")

    passed = score >= 70
    return {
        "score": max(0, score),
        "passed": passed,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "voice_match_score": guardrail.get("voice_match_score", 85),
        "recommendations": "Add an engaging question or CTA" if not has_cta else "Looks ready for platform formatting."
    }

def format_for_twitter(raw_text: str) -> str:
    """Adapts text to Twitter / X constraints (<= 280 chars, punchy spacing, <= 3 hashtags)."""
    clean_lines = [l.strip() for l in raw_text.split("\n") if l.strip()]
    if not clean_lines:
        return ""
    
    summary = " ".join(clean_lines)
    tags = re.findall(r'#\w+', summary)
    text_without_tags = re.sub(r'#\w+', '', summary).strip()
    
    max_body_len = 280 - 30
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
    
    formatted = f"{hook}\n\n{body}\n\n---\nWhat are your thoughts on this? Let me know in the comments below!"
    if "#" not in formatted:
        formatted += "\n\n#Leadership #Technology #Innovation #Productivity"
    return formatted