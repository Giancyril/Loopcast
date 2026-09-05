"""
Predictive Scheduling Engine - Phase 3
Computes best-time recommendations per platform based on engagement heatmaps.
"""

from __future__ import annotations

import hashlib
import random
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Any

PLATFORM_WINDOWS: dict[str, list[tuple[int, int, float]]] = {
    "twitter": [
        (0, 9, 1.4), (0, 12, 1.7), (0, 17, 1.5),
        (1, 9, 1.5), (1, 12, 1.9), (1, 17, 1.6),
        (2, 9, 1.6), (2, 12, 2.0), (2, 17, 1.7),
        (3, 9, 1.5), (3, 12, 1.8), (3, 17, 1.6),
        (4, 9, 1.3), (4, 12, 1.6), (4, 17, 1.4),
        (5, 11, 1.1), (5, 14, 1.0),
        (6, 11, 1.0), (6, 14, 0.9),
    ],
    "linkedin": [
        (0, 8, 1.8), (0, 12, 1.6),
        (1, 8, 2.0), (1, 12, 1.7), (1, 17, 1.5),
        (2, 8, 2.1), (2, 12, 1.8),
        (3, 8, 2.0), (3, 12, 1.7),
        (4, 8, 1.7), (4, 12, 1.5),
    ],
    "instagram": [
        (0, 11, 1.5), (0, 19, 1.8),
        (1, 11, 1.6), (1, 19, 1.9),
        (2, 11, 1.7), (2, 19, 2.0),
        (3, 11, 1.6), (3, 19, 1.9),
        (4, 11, 1.5), (4, 19, 1.7),
        (5, 11, 1.8), (5, 14, 1.9), (5, 19, 2.1),
        (6, 11, 1.7), (6, 14, 1.8), (6, 19, 2.0),
    ],
}

CONTENT_TYPE_BOOSTS: dict[str, dict[str, float]] = {
    "thread": {"twitter": 1.35, "linkedin": 0.9},
    "carousel": {"linkedin": 1.45, "instagram": 1.3},
    "single": {"twitter": 1.0, "linkedin": 1.0, "instagram": 1.0},
    "video": {"instagram": 1.5, "twitter": 1.2, "linkedin": 1.25},
}

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


@dataclass
class SlotScore:
    weekday: int
    weekday_label: str
    hour_utc: int
    score: float
    estimated_reach: int
    label: str

    def isoformat_next(self) -> str:
        now = datetime.now(timezone.utc)
        days_ahead = (self.weekday - now.weekday()) % 7
        if days_ahead == 0 and now.hour >= self.hour_utc:
            days_ahead = 7
        target = (now + timedelta(days=days_ahead)).replace(
            hour=self.hour_utc, minute=0, second=0, microsecond=0
        )
        return target.isoformat()


@dataclass
class PlatformHeatmap:
    platform: str
    slots: list[dict[str, Any]] = field(default_factory=list)
    best_slot: SlotScore | None = None
    top_three: list[SlotScore] = field(default_factory=list)


def _seed_from_persona(persona_id: str | None) -> int:
    if not persona_id:
        return 42
    return int(hashlib.sha256(persona_id.encode()).hexdigest()[:8], 16) % 10000


def _classify(score: float, max_score: float) -> str:
    ratio = score / max_score if max_score else 0
    if ratio >= 0.85:
        return "Peak"
    elif ratio >= 0.65:
        return "Good"
    return "Average"


def build_heatmap(platform: str, content_type: str = "single", persona_id: str | None = None) -> PlatformHeatmap:
    windows = PLATFORM_WINDOWS.get(platform, [])
    if not windows:
        return PlatformHeatmap(platform=platform)

    content_boost = CONTENT_TYPE_BOOSTS.get(content_type, {}).get(platform, 1.0)
    rng = random.Random(_seed_from_persona(persona_id))

    all_scores: list[float] = [w[2] * content_boost * rng.uniform(0.9, 1.1) for w in windows]
    max_raw = max(all_scores) if all_scores else 1.0

    scored: list[SlotScore] = []
    for (weekday, hour, _), raw in zip(windows, all_scores):
        normalised = raw / max_raw
        reach = int(2000 + normalised * 18000 + rng.uniform(-500, 500))
        scored.append(SlotScore(
            weekday=weekday, weekday_label=DAYS[weekday], hour_utc=hour,
            score=round(normalised * 100, 1), estimated_reach=max(0, reach),
            label=_classify(raw, max_raw),
        ))

    scored.sort(key=lambda s: s.score, reverse=True)
    top3 = scored[:3]

    lookup: dict[tuple[int, int], SlotScore] = {(s.weekday, s.hour_utc): s for s in scored}
    grid: list[dict[str, Any]] = []
    for w in range(7):
        for h in range(24):
            slot = lookup.get((w, h))
            grid.append({
                "weekday": w, "weekday_label": DAYS[w], "hour": h,
                "score": slot.score if slot else 0.0,
                "estimated_reach": slot.estimated_reach if slot else 0,
                "label": slot.label if slot else "Off-peak",
                "next_occurrence": slot.isoformat_next() if slot else None,
            })

    return PlatformHeatmap(platform=platform, slots=grid, best_slot=top3[0] if top3 else None, top_three=top3)


def get_best_times(platforms: list[str], content_type: str = "single", persona_id: str | None = None) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for platform in platforms:
        hm = build_heatmap(platform, content_type, persona_id)
        result[platform] = {
            "heatmap": hm.slots,
            "top_recommendations": [
                {
                    "weekday": s.weekday_label, "hour_utc": s.hour_utc, "score": s.score,
                    "estimated_reach": s.estimated_reach, "label": s.label,
                    "next_occurrence": s.isoformat_next(),
                }
                for s in hm.top_three
            ],
        }
    return result
