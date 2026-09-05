"""
End-to-End Integration Suite for Loopcast 5 Advanced Features:
1. Voice Studio & Personas
2. Thread Weaver & Carousel Engine
3. Predictive Best-Time Scheduling
4. Social Simulation Sandbox
5. AI Social Copilot Refinement
"""

import pytest
from backend.app.core.database import SessionLocal, Base, engine
from backend.app.services.persona_service import PersonaService
from backend.app.schemas.social import PersonaCreate
from backend.app.services.predictive_scheduler import get_best_times
from backend.app.services.simulation_sandbox import run_ab_test
from backend.app.services.copilot_service import refine_copy, diagnose_copy
from platforms.twitter_adapter import TwitterAdapter


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield


class TestLoopcastAdvancedFeatures:
    def test_feature_1_persona_lifecycle_and_guardrails(self):
        db = SessionLocal()
        try:
            payload = PersonaCreate(
                name="E2E Test Persona",
                archetype="technical",
                tagline="Engineering lead",
                bio="Deep systems engineer",
                voice_rules="Use active voice and numbers.",
                banned_words=["revolutionary", "synergy"],
                tone_profile={"formality": 80, "humor": 20, "technicality": 90, "assertiveness": 85},
                is_default=False,
            )
            persona = PersonaService.create_persona(db, payload)
            assert persona.id is not None
            assert persona.name == "E2E Test Persona"
            assert "revolutionary" in persona.banned_words
        finally:
            db.close()

    def test_feature_2_thread_weaver_and_platform_adapter(self):
        adapter = TwitterAdapter(is_mock=True)
        tweets = [
            "1/3 Rebuilding our indexing pipeline 🧵",
            "2/3 Hard lesson on deterministic state machines.",
            "3/3 What is your biggest takeaway? Drop it below 👇"
        ]
        result = adapter.publish_thread(tweets)
        assert result["status"] == "published"
        assert result["tweet_count"] == 3
        assert len(result["thread"]) == 3

    def test_feature_3_predictive_scheduler_heatmaps(self):
        res = get_best_times(["twitter", "linkedin"], content_type="thread")
        assert "twitter" in res
        assert "linkedin" in res
        assert len(res["twitter"]["top_recommendations"]) == 3
        top_slot = res["twitter"]["top_recommendations"][0]
        assert top_slot["score"] > 0
        assert top_slot["estimated_reach"] > 0

    def test_feature_4_simulation_sandbox_ab_test(self):
        variants = [
            {"variant_id": "v1", "hook_text": "Why 90% of microservices fail in production.", "hook_type": "bold_claim"},
            {"variant_id": "v2", "hook_text": "Are you making this critical DB indexing mistake?", "hook_type": "question"},
        ]
        sim = run_ab_test(variants, platform="twitter")
        assert sim["variants_tested"] == 2
        assert sim["winner"] in ["v1", "v2"]
        assert len(sim["insight"]) > 0

    def test_feature_5_copilot_refinement_and_diagnostics(self):
        text = "This is a very really important announcement for all engineering teams."
        refined = refine_copy(text, action="condense", platform="twitter")
        assert len(refined["refined_text"]) < len(text)

        diag = diagnose_copy(refined["refined_text"], platform="twitter")
        assert diag["word_count"] > 0
        assert diag["readability_score"] > 0


