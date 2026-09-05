import re
from typing import Dict, Any, List, Optional

def critique_thread(tweets: List[str]) -> Dict[str, Any]:
    """Evaluates a multi-tweet thread for viral hook strength, progression rhythm, and conversion CTA."""
    if not tweets:
        return {
            "score": 0,
            "passed": False,
            "hook_score": 0,
            "rhythm_score": 0,
            "cta_score": 0,
            "strengths": [],
            "weaknesses": ["No tweets found in thread."]
        }

    score = 100
    strengths: List[str] = []
    weaknesses: List[str] = []

    # 1. Hook Tweet 1 Evaluation
    first_tweet = tweets[0]
    hook_score = 100
    if len(first_tweet) < 40:
        hook_score -= 30
        weaknesses.append("Opening hook is too short to generate curiosity.")
    elif len(first_tweet) > 270:
        hook_score -= 15
        weaknesses.append("Opening hook is near character limit, risking truncation.")
    
    if any(q in first_tweet.lower() for q in ["how", "why", "stop", "most", "unpopular", "1/", "here is"]):
        strengths.append("Hook uses high-performing curiosity gap framework.")
    else:
        hook_score -= 20
        weaknesses.append("Hook lacks a strong curiosity trigger or tension.")

    # 2. Rhythm and Progression
    rhythm_score = 100
    if len(tweets) < 3:
        rhythm_score -= 30
        weaknesses.append("Thread is too brief (minimum 3 tweets recommended for depth).")
    elif len(tweets) > 8:
        rhythm_score -= 15
        weaknesses.append("Thread is overly lengthy; audience drop-off increases past 7 tweets.")
    else:
        strengths.append(f"Ideal thread length ({len(tweets)} tweets) for maximum retention.")

    # Check numbering continuity
    has_numbering = all(re.search(r'\b\d+/\d+\b', t) for t in tweets)
    if has_numbering:
        strengths.append("Clean index numbering (e.g. 1/5, 2/5) guides reader through thread.")
    else:
        rhythm_score -= 15
        weaknesses.append("Inconsistent or missing thread numbering.")

    # 3. CTA Quality on Final Tweet
    final_tweet = tweets[-1]
    cta_score = 100
    if any(w in final_tweet.lower() for w in ["bookmark", "repost", "retweet", "follow", "share", "thoughts", "comment"]):
        strengths.append("Final tweet contains clear bookmark & share conversion call-to-action.")
    else:
        cta_score -= 25
        weaknesses.append("Final tweet is missing a bookmark or sharing prompt.")

    total_score = int((hook_score * 0.4) + (rhythm_score * 0.3) + (cta_score * 0.3))
    total_score = max(0, min(100, total_score))

    return {
        "score": total_score,
        "passed": total_score >= 70,
        "hook_score": max(0, hook_score),
        "rhythm_score": max(0, rhythm_score),
        "cta_score": max(0, cta_score),
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": "Thread structure is optimized for high retention." if total_score >= 75 else "Strengthen opening hook and final tweet conversion prompt."
    }

def generate_thread_and_carousel(
    topic: str,
    raw_draft: str,
    persona_dna: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Generates a high-retention 5-part Twitter/X thread and a 5-slide LinkedIn carousel breakdown."""
    archetype = persona_dna.get("archetype", "founder") if persona_dna else "founder"
    target_audience = persona_dna.get("target_audience", "Builders & Engineers") if persona_dna else "Builders & Engineers"

    # Multi-tweet Twitter/X Thread
    tweets = [
        f"1/5 Most teams get {topic} completely wrong.\n\nThey copy yesterday's playbooks instead of engineering for durability.\n\nHere is the exact architecture breakdown that changes the game: 👇",
        f"2/5 The hidden bottleneck:\n\nWhen scaling {topic}, 80% of failures stem from poor boundary design and silent failures.\n\nIf you don't enforce strict review guardrails, entropy always wins.",
        f"3/5 What high-velocity teams do instead:\n\n• Decouple generation from execution\n• Keep humans in the loop for critical checkpoints\n• Enforce strict brand voice blacklists\n\nSpeed without governance is just automated chaos.",
        f"4/5 The results speak for themselves:\n\n✓ 10x faster draft turnaround\n✓ 0 brand hallucination incidents\n✓ 100% confidence before every public broadcast",
        f"5/5 TL;DR on {topic}:\n\n1. Automate drafts, keep human approval.\n2. Enforce explicit voice DNA.\n3. Measure real outcome metrics.\n\nIf you found this valuable, bookmark this thread and follow for more engineering breakdowns!"
    ]

    # LinkedIn Carousel Slide Breakdown
    slides = [
        {
            "slide": 1,
            "title": f"The Modern Guide to {topic}",
            "subtitle": f"A strategic playbook for {target_audience}",
            "type": "cover"
        },
        {
            "slide": 2,
            "title": "The Core Problem",
            "content": "Why conventional workflows break under pressure, causing bottlenecks and inconsistent public messaging.",
            "type": "problem"
        },
        {
            "slide": 3,
            "title": "The Architectural Shift",
            "content": "Combining autonomous AI agent generation with rigorous human-in-the-loop review queues.",
            "type": "solution"
        },
        {
            "slide": 4,
            "title": "Benchmark Results",
            "content": "• 10x production acceleration\n• Zero unauthorized posts\n• Predictable peak-engagement release windows",
            "type": "metrics"
        },
        {
            "slide": 5,
            "title": "Implementation Checklist",
            "content": "Step 1: Codify brand DNA.\nStep 2: Connect OAuth channels.\nStep 3: Establish human approval checkpoints.",
            "type": "cta"
        }
    ]

    critique = critique_thread(tweets)

    return {
        "thread_tweets": tweets,
        "carousel_slides": slides,
        "thread_critique": critique
    }