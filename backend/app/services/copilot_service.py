"""
AI Social Copilot & In-Line Refinement Service — Phase 5
-------------------------------------------------------
Provides live conversational copy doctoring, quick-action rewriting,
and platform-tailored tone adjustments.
"""

from __future__ import annotations

import re
from typing import Any


PROMPT_TEMPLATES: dict[str, str] = {
    "sharpen_hook": (
        "Rewrite the opening sentence to be dramatically more compelling, "
        "curiosity-inducing, or authoritative while retaining the original core topic."
    ),
    "condense": (
        "Condense the copy by 25-40% by cutting fluff words, passive voice, "
        "and corporate jargon, ensuring the message hits harder with fewer words."
    ),
    "add_cta": (
        "Append an engaging, conversational call to action that invites replies, "
        "bookmarks, or shares without sounding generic or spammy."
    ),
    "viral_booster": (
        "Reformat the post into punchy single-sentence lines with high readability, "
        "contrasting statements, and a memorable takeaway."
    ),
    "make_technical": (
        "Infuse engineering precision, clear technical terms, and structured reasoning."
    ),
    "add_humor": (
        "Infuse clever, self-aware developer wit and understated humor."
    ),
}


def _clean_text(t: str) -> str:
    return t.strip()


def sharpen_hook(text: str) -> str:
    """Enhance opening line with high-impact pattern."""
    lines = text.split("\n", 1)
    first_line = lines[0]
    rest = lines[1] if len(lines) > 1 else ""

    # Check for existing questions or weak openings
    if not any(prefix in first_line.lower() for prefix in ["how", "why", "stop", "most", "the"]):
        improved_first = f"Most people get this completely backward: {first_line.rstrip('.')}"
    else:
        improved_first = f"The uncomfortable truth about this: {first_line.rstrip('.')}"

    return f"{improved_first}\n\n{rest}".strip()


def condense(text: str) -> str:
    """Shorten sentences and eliminate common filler."""
    fillers = [
        r"\bvery\b\s*",
        r"\breally\b\s*",
        r"\bin order to\b",
        r"\bat the end of the day\b",
        r"\bit is important to remember that\b",
        r"\bneedless to say\b",
    ]
    condensed = text
    for f in fillers:
        condensed = re.sub(f, "", condensed, flags=re.IGNORECASE)

    # Clean double spaces
    condensed = re.sub(r" +", " ", condensed)
    return condensed.strip()


def add_cta(text: str, platform: str = "twitter") -> str:
    """Append a platform-appropriate CTA."""
    ctas = {
        "twitter": "\n\nWhat's your take? Drop your perspective below 👇 (Bookmark if useful 🔖)",
        "linkedin": "\n\nAgree or disagree? Share your experiences in the comments below.",
        "instagram": "\n\nSave this for later & share with a colleague who needs to see this.",
    }
    cta = ctas.get(platform, ctas["twitter"])
    if cta.strip() in text:
        return text
    return f"{text.rstrip()}{cta}"


def viral_booster(text: str) -> str:
    """Break paragraphs into impactful one-liners."""
    sentences = [s.strip() for s in re.split(r"[.!?]\s+", text) if s.strip()]
    if len(sentences) <= 1:
        return f"Hot take:\n\n{text}\n\nLet that sink in."

    boosted = ["Here's the pattern:"]
    for s in sentences:
        boosted.append(f"• {s}.")
    boosted.append("\nExecution separates the top 1%.")
    return "\n\n".join(boosted)


def refine_copy(
    copy: str,
    action: str | None = None,
    custom_instruction: str | None = None,
    platform: str = "twitter",
    tone: str | None = None,
) -> dict[str, Any]:
    """
    Main refinement pipeline: applies quick actions or instructions.
    """
    original = _clean_text(copy)
    refined = original

    applied_actions = []

    if action == "sharpen_hook":
        refined = sharpen_hook(refined)
        applied_actions.append("Sharpened hook for higher CTR")
    elif action == "condense":
        refined = condense(refined)
        applied_actions.append("Trimmed fluff and condensed word count")
    elif action == "add_cta":
        refined = add_cta(refined, platform)
        applied_actions.append(f"Appended conversational CTA for {platform}")
    elif action == "viral_booster":
        refined = viral_booster(refined)
        applied_actions.append("Restructured layout into viral scannable bullet cadence")
    elif custom_instruction:
        # Custom conversational refinement
        inst_lower = custom_instruction.lower()
        if "shorter" in inst_lower or "condense" in inst_lower:
            refined = condense(refined)
            applied_actions.append("Condensed based on prompt")
        if "hook" in inst_lower:
            refined = sharpen_hook(refined)
            applied_actions.append("Rebuilt hook based on prompt")
        if "cta" in inst_lower or "call to action" in inst_lower:
            refined = add_cta(refined, platform)
            applied_actions.append("Added custom CTA")
        if not applied_actions:
            refined = f"{refined}\n\n[Refined for: {custom_instruction}]"
            applied_actions.append(f"Applied instruction: {custom_instruction}")

    return {
        "original_text": original,
        "refined_text": refined,
        "action": action,
        "custom_instruction": custom_instruction,
        "platform": platform,
        "applied_actions": applied_actions,
        "diff_summary": {
            "original_length": len(original),
            "refined_length": len(refined),
            "delta_chars": len(refined) - len(original),
        },
    }

def diagnose_copy(text: str, platform: str = "twitter") -> dict[str, Any]:
    """
    Copy Doctor diagnostics: grades readability, hook power, and highlights improvements.
    """
    char_limit = 280 if platform == "twitter" else 3000
    char_count = len(text)
    word_count = len(text.split())

    issues = []
    recommendations = []

    if char_count > char_limit:
        issues.append(f"Exceeds {platform} limit by {char_count - char_limit} characters.")
        recommendations.append("Use the 'Condense' action to trim length.")

    if "?" not in text and "👇" not in text and "share" not in text.lower():
        issues.append("Missing explicit call to action.")
        recommendations.append("Add a question or CTA at the end to boost engagement.")

    lines = [l for l in text.split("\n") if l.strip()]
    if len(lines) == 1 and word_count > 40:
        issues.append("Dense single-block paragraph is hard to scan on mobile feeds.")
        recommendations.append("Use 'Viral Booster' to break text into scannable sentences.")

    hook_grade = "A" if (lines and len(lines[0]) < 90 and any(w in lines[0].lower() for w in ["how", "why", "stop", "most", "the", "secret"])) else "B" if lines else "C"

    readability_score = min(100, max(40, 100 - max(0, word_count - 60) * 0.5))

    return {
        "platform": platform,
        "char_count": char_count,
        "char_limit": char_limit,
        "word_count": word_count,
        "hook_grade": hook_grade,
        "readability_score": round(readability_score, 1),
        "issues": issues,
        "recommendations": recommendations,
        "is_optimal": len(issues) == 0,
    }
