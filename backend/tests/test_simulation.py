"""
Tests for Phase 4 – Social Simulation Sandbox & A/B Hook Testing
"""

import pytest
from backend.app.services.simulation_sandbox import (
    HookVariant,
    simulate_variant,
    run_ab_test,
    _generate_insight,
)


class TestSimulationSandbox:
    def test_simulate_variant_returns_all_metrics(self):
        variant = HookVariant(
            variant_id="v1",
            hook_text="Stop doing this in 2025: The counter-intuitive strategy.",
            hook_type="bold_claim",
        )
        res = simulate_variant(variant, platform="twitter")

        assert res.variant_id == "v1"
        assert res.impressions > 0
        assert res.clicks >= 0
        assert res.likes >= 0
        assert res.shares >= 0
        assert res.comments >= 0
        assert res.saves >= 0
        assert 0.0 <= res.ctr <= 100.0
        assert res.engagement_rate > 0.0
        assert res.virality_score > 0.0
        assert "positive" in res.sentiment_distribution
        assert "neutral" in res.sentiment_distribution
        assert "negative" in res.sentiment_distribution

    def test_run_ab_test_picks_winner(self):
        variants = [
            {"variant_id": "a", "hook_text": "Did you know that 80% of apps fail?", "hook_type": "question"},
            {"variant_id": "b", "hook_text": "Here is the exact blueprint to scale to 100k ARR.", "hook_type": "how_to"},
        ]
        test_result = run_ab_test(variants, platform="twitter")

        assert test_result["variants_tested"] == 2
        assert test_result["winner"] in ["a", "b"]
        assert len(test_result["results"]) == 2
        assert any(r["predicted_winner"] is True for r in test_result["results"])
        assert len(test_result["insight"]) > 0

    def test_deterministic_seed_consistency(self):
        v = HookVariant(variant_id="test", hook_text="Consistency is key for growth", hook_type="stat")
        m1 = simulate_variant(v, platform="linkedin")
        m2 = simulate_variant(v, platform="linkedin")

        assert m1.impressions == m2.impressions
        assert m1.likes == m2.likes
        assert m1.ctr == m2.ctr

    def test_generate_insight_handles_all_hook_types(self):
        for htype in ["bold_claim", "question", "stat", "story", "listicle", "how_to"]:
            dummy = simulate_variant(HookVariant(variant_id="x", hook_text="test", hook_type=htype))
            insight = _generate_insight(dummy)
            assert len(insight) > 10

    def test_empty_variants_ab_test(self):
        res = run_ab_test([], platform="twitter")
        assert res["variants_tested"] == 0
        assert res["winner"] is None
        assert res["insight"] == "No variants to evaluate."
