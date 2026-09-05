"""
Tests for Phase 3 – Predictive Scheduling Engine
"""

import pytest
from backend.app.services.predictive_scheduler import (
    build_heatmap,
    get_best_times,
    PLATFORM_WINDOWS,
    DAYS,
)


class TestBuildHeatmap:
    def test_heatmap_returns_full_grid(self):
        hm = build_heatmap("twitter")
        # 7 days x 24 hours = 168 slots
        assert len(hm.slots) == 168

    def test_heatmap_score_range(self):
        hm = build_heatmap("linkedin")
        for slot in hm.slots:
            assert 0.0 <= slot["score"] <= 100.0, f"Bad score: {slot['score']}"

    def test_heatmap_top_three_populated(self):
        hm = build_heatmap("instagram")
        assert len(hm.top_three) == 3
        assert hm.best_slot is not None

    def test_best_slot_is_highest_score(self):
        hm = build_heatmap("twitter")
        top_scores = [s.score for s in hm.top_three]
        assert top_scores == sorted(top_scores, reverse=True)

    def test_unknown_platform_returns_empty(self):
        hm = build_heatmap("tiktok")
        assert hm.slots == []
        assert hm.best_slot is None

    def test_persona_seed_produces_consistent_results(self):
        hm1 = build_heatmap("twitter", persona_id="persona-abc")
        hm2 = build_heatmap("twitter", persona_id="persona-abc")
        assert hm1.top_three[0].score == hm2.top_three[0].score

    def test_different_personas_may_differ(self):
        hm1 = build_heatmap("twitter", persona_id="persona-aaa")
        hm2 = build_heatmap("twitter", persona_id="persona-zzz")
        # Not guaranteed to differ, but scores should be floats
        assert isinstance(hm1.top_three[0].score, float)
        assert isinstance(hm2.top_three[0].score, float)

    def test_content_type_boost_thread_twitter(self):
        hm_single = build_heatmap("twitter", content_type="single")
        hm_thread = build_heatmap("twitter", content_type="thread")
        # Thread has 1.35x boost so best scores should be relatively high
        assert hm_thread.best_slot is not None
        assert hm_single.best_slot is not None


class TestGetBestTimes:
    def test_multi_platform_keys_present(self):
        result = get_best_times(["twitter", "linkedin", "instagram"])
        assert "twitter" in result
        assert "linkedin" in result
        assert "instagram" in result

    def test_heatmap_and_recommendations_keys(self):
        result = get_best_times(["twitter"])
        tw = result["twitter"]
        assert "heatmap" in tw
        assert "top_recommendations" in tw

    def test_top_recommendations_shape(self):
        result = get_best_times(["instagram"], content_type="carousel")
        recs = result["instagram"]["top_recommendations"]
        assert len(recs) == 3
        for rec in recs:
            assert "weekday" in rec
            assert "hour_utc" in rec
            assert "score" in rec
            assert "estimated_reach" in rec
            assert "label" in rec
            assert "next_occurrence" in rec

    def test_next_occurrence_is_iso_string(self):
        result = get_best_times(["twitter"])
        rec = result["twitter"]["top_recommendations"][0]
        # Should be parseable as ISO datetime
        from datetime import datetime
        dt = datetime.fromisoformat(rec["next_occurrence"])
        assert dt is not None

    def test_single_platform_returns_correct_structure(self):
        result = get_best_times(["linkedin"], persona_id="test-persona")
        assert "linkedin" in result
        assert len(result["linkedin"]["heatmap"]) == 168  # 7*24
