"""
Social Simulation Sandbox - Phase 4
Runs A/B hook tests and simulates post engagement metrics.
"""

from __future__ import annotations

import hashlib
import random
from dataclasses import dataclass, field
from typing import Any


@dataclass
class HookVariant:
    variant_id: str
    hook_text: str
    hook_type: str  # e.g. "question", "stat", "story", "bold_claim"


@dataclass
class SimulatedMetrics:
    variant_id: str
    hook_text: str
    hook_type: str
    impressions: int
    clicks: int
    likes: int
    shares: int
    comments: int
    saves: int
    ctr: float
    engagement_rate: float
    virality_score: float
    sentiment_distribution: dict[str, float]
    predicted_winner: bool = False


HOOK_TYPE_MULTIPLIERS: dict[str, dict[str, float]] = {
    "question": {"ctr": 1.25, "comments": 1.45, "shares": 1.1},
    "stat": {"ctr": 1.35, "likes": 1.2, "shares": 1.3},
    "story": {"ctr": 1.1, "likes": 1.35, "saves": 1.4, "comments": 1.2},
    "bold_claim": {"ctr": 1.4, "shares": 1.5, "comments": 1.6},
    "listicle": {"ctr": 1.2, "saves": 1.35, "likes": 1.1},
    "how_to": {"ctr": 1.15, "saves": 1.5, "likes": 1.25},
}

BASE_IMPRESSIONS = 5000


def _seed_from_text(text: str) -> int:
    return int(hashlib.sha256(text.encode()).hexdigest()[:8], 16) % 1_000_000


def simulate_variant(variant: HookVariant, platform: str = "twitter") -> SimulatedMetrics:
    rng = random.Random(_seed_from_text(variant.hook_text + platform))

    multipliers = HOOK_TYPE_MULTIPLIERS.get(variant.hook_type, {})

    impressions = int(BASE_IMPRESSIONS * rng.uniform(0.8, 1.3))

    base_ctr = rng.uniform(0.02, 0.05)
    ctr = base_ctr * multipliers.get("ctr", 1.0)
    clicks = int(impressions * ctr)

    likes = int(impressions * rng.uniform(0.03, 0.08) * multipliers.get("likes", 1.0))
    shares = int(impressions * rng.uniform(0.005, 0.02) * multipliers.get("shares", 1.0))
    comments = int(impressions * rng.uniform(0.005, 0.015) * multipliers.get("comments", 1.0))
    saves = int(impressions * rng.uniform(0.01, 0.04) * multipliers.get("saves", 1.0))

    total_engagements = likes + shares + comments + saves
    engagement_rate = round(total_engagements / impressions * 100, 2) if impressions else 0

    virality_score = round(
        (shares * 0.4 + comments * 0.3 + likes * 0.2 + saves * 0.1) / max(impressions, 1) * 1000, 2
    )

    sentiment_distribution = {
        "positive": round(rng.uniform(0.55, 0.80), 2),
        "neutral": round(rng.uniform(0.12, 0.25), 2),
        "negative": round(rng.uniform(0.04, 0.15), 2),
    }
    total_s = sum(sentiment_distribution.values())
    sentiment_distribution = {k: round(v / total_s, 2) for k, v in sentiment_distribution.items()}

    return SimulatedMetrics(
        variant_id=variant.variant_id,
        hook_text=variant.hook_text,
        hook_type=variant.hook_type,
        impressions=impressions,
        clicks=clicks,
        likes=likes,
        shares=shares,
        comments=comments,
        saves=saves,
        ctr=round(ctr * 100, 2),
        engagement_rate=engagement_rate,
        virality_score=virality_score,
        sentiment_distribution=sentiment_distribution,
    )


def run_ab_test(
    variants: list[dict[str, str]],
    platform: str = "twitter",
) -> dict[str, Any]:
    """
    Run A/B simulation across a list of hook variants.

    Each variant dict must have: variant_id, hook_text, hook_type.
    Returns ranked results with the predicted winner flagged.
    """
    hook_variants = [HookVariant(**v) for v in variants]
    simulated = [simulate_variant(hv, platform) for hv in hook_variants]

    # Sort by engagement_rate descending
    simulated.sort(key=lambda m: m.engagement_rate, reverse=True)
    if simulated:
        simulated[0].predicted_winner = True

    return {
        "platform": platform,
        "variants_tested": len(simulated),
        "results": [
            {
                "variant_id": m.variant_id,
                "hook_text": m.hook_text,
                "hook_type": m.hook_type,
                "predicted_winner": m.predicted_winner,
                "metrics": {
                    "impressions": m.impressions,
                    "clicks": m.clicks,
                    "likes": m.likes,
                    "shares": m.shares,
                    "comments": m.comments,
                    "saves": m.saves,
                    "ctr_percent": m.ctr,
                    "engagement_rate_percent": m.engagement_rate,
                    "virality_score": m.virality_score,
                    "sentiment": m.sentiment_distribution,
                },
            }
            for m in simulated
        ],
        "winner": simulated[0].variant_id if simulated else None,
        "insight": _generate_insight(simulated[0] if simulated else None),
    }


def _generate_insight(winner: SimulatedMetrics | None) -> str:
    if not winner:
        return "No variants to evaluate."
    tips = {
        "bold_claim": "Bold claims drive the highest share velocity. Use sparingly to preserve credibility.",
        "question": "Questions maximise comment threads. Great for community-building content.",
        "stat": "Stat-led hooks earn trust clicks. Back with a credible source for best results.",
        "story": "Story openers earn the highest saves — ideal for evergreen content.",
        "listicle": "Listicles earn solid saves and predictable reach. Use a strong odd number.",
        "how_to": "How-to hooks optimise for saves and DM shares. Strong top-of-funnel content.",
    }
    return tips.get(winner.hook_type, "Test more variants to find your optimal hook type.")
