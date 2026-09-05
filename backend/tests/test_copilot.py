"""
Tests for Phase 5 – AI Social Copilot & In-Line Refinement Engine
"""

import pytest
from backend.app.services.copilot_service import (
    refine_copy,
    sharpen_hook,
    condense,
    add_cta,
    viral_booster,
    diagnose_copy,
)


class TestCopilotService:
    def test_sharpen_hook_transforms_opening(self):
        original = "We are launching a new feature today for database caching."
        improved = sharpen_hook(original)
        assert "Most people get this completely backward:" in improved or "The uncomfortable truth" in improved
        assert "database caching" in improved

    def test_condense_removes_filler_words(self):
        text = "It is very really important to remember that in order to scale, needless to say we must test."
        condensed = condense(text)
        assert "really" not in condensed
        assert "in order to" not in condensed
        assert len(condensed) < len(text)

    def test_add_cta_twitter(self):
        text = "3 architecture decisions we made this year."
        with_cta = add_cta(text, platform="twitter")
        assert "👇" in with_cta
        assert "Bookmark" in with_cta

    def test_add_cta_linkedin(self):
        text = "Leadership in distributed systems."
        with_cta = add_cta(text, platform="linkedin")
        assert "Agree or disagree?" in with_cta

    def test_viral_booster_breaks_into_bullets(self):
        text = "We switched to async. Our latency dropped 80%. Our AWS bill cut in half."
        boosted = viral_booster(text)
        assert "•" in boosted
        assert "Here's the pattern:" in boosted

    def test_refine_copy_structured_pipeline(self):
        res = refine_copy(
            copy="Why software architecture matters for early stage startups.",
            action="sharpen_hook",
            platform="twitter",
        )
        assert res["original_text"] != ""
        assert res["refined_text"] != ""
        assert len(res["applied_actions"]) > 0
        assert "diff_summary" in res

    def test_diagnose_copy_metrics(self):
        text = "Check out this new release of our agentic framework."
        diag = diagnose_copy(text, platform="twitter")
        assert diag["char_count"] == len(text)
        assert diag["char_limit"] == 280
        assert diag["word_count"] > 0
        assert diag["hook_grade"] in ["A", "B", "C"]
        assert 0.0 <= diag["readability_score"] <= 100.0
        assert isinstance(diag["issues"], list)
        assert isinstance(diag["recommendations"], list)
