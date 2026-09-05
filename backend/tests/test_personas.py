import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import SessionLocal, Base, engine
from backend.app.services.persona_service import PersonaService
from backend.app.schemas.social import PersonaCreate, PersonaUpdate
from agent.tools.brand_rules import evaluate_voice_consistency

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield

def test_persona_crud_and_default_archetypes():
    db = SessionLocal()
    try:
        # Test defaults ensure
        personas = PersonaService.ensure_default_personas(db)
        assert len(personas) >= 4
        default_persona = next((p for p in personas if p.is_default), None)
        assert default_persona is not None
        assert "Founder" in default_persona.name

        # Test create custom persona
        create_payload = PersonaCreate(
            name="AI Researcher",
            handle_or_tag="@researcher",
            bio="Publishing arXiv summaries and benchmarking frontier models.",
            archetype="explainer",
            tone_attributes={"wit": 20, "formality": 80, "provocation": 30, "technical_depth": 95},
            banned_words=["revolution", "unleash", "delve"],
            sample_hooks=["We evaluated 5 frontier models on mathematical reasoning:"],
            target_audience="AI/ML Researchers and Engineers",
            is_default=True
        )
        created = PersonaService.create_persona(db, create_payload)
        assert created.id is not None
        assert created.is_default is True

        # Ensure previous default was un-set
        old_default = PersonaService.get_persona_by_id(db, default_persona.id)
        assert old_default.is_default is False

        # Test update persona
        updated = PersonaService.update_persona(
            db, created.id, PersonaUpdate(name="Lead AI Scientist", tone_attributes={"technical_depth": 99})
        )
        assert updated.name == "Lead AI Scientist"
        assert updated.tone_attributes["technical_depth"] == 99

        # Test delete persona
        deleted = PersonaService.delete_persona(db, created.id)
        assert deleted is True
        assert PersonaService.get_persona_by_id(db, created.id) is None
    finally:
        db.close()

def test_persona_api_endpoints():
    # GET personas
    res = client.get("/api/v1/personas")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 4

    # POST persona
    new_persona = {
        "name": "SaaS Growth Advisor",
        "archetype": "growth_hacker",
        "tone_attributes": {"wit": 70, "formality": 30},
        "banned_words": ["synergy", "paradigm"],
        "target_audience": "B2B SaaS Founders"
    }
    post_res = client.post("/api/v1/personas", json=new_persona)
    assert post_res.status_code == 201
    created_id = post_res.json()["id"]

    # GET single persona
    get_res = client.get(f"/api/v1/personas/{created_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "SaaS Growth Advisor"

    # PUT update
    put_res = client.put(f"/api/v1/personas/{created_id}", json={"name": "SaaS Scale Advisor"})
    assert put_res.status_code == 200
    assert put_res.json()["name"] == "SaaS Scale Advisor"

    # DELETE
    del_res = client.delete(f"/api/v1/personas/{created_id}")
    assert del_res.status_code == 204

def test_voice_consistency_guardrail():
    persona_dna = {
        "banned_words": ["game-changer", "delve", "secret sauce"],
        "tone_attributes": {"formality": 85, "wit": 20}
    }
    
    bad_draft = "This game-changer tool will delve into your metrics and reveal the secret sauce lol!"
    result = evaluate_voice_consistency(bad_draft, persona_dna)
    assert result["passed"] is False
    assert result["voice_match_score"] < 70
    assert any("Forbidden buzzwords" in v for v in result["violations"])
    assert any("Informal slang" in v for v in result["violations"])

    good_draft = "We analyzed 50 high-growth SaaS companies across three operational dimensions. Here are the core observations from our latest infrastructure audit."
    good_result = evaluate_voice_consistency(good_draft, persona_dna)
    assert good_result["passed"] is True
    assert good_result["voice_match_score"] >= 80

def test_generate_post_with_persona():
    # Fetch default persona
    res = client.get("/api/v1/personas")
    assert res.status_code == 200
    personas = res.json()
    persona_id = personas[0]["id"]

    # Generate post specifying persona
    gen_payload = {
        "topic": "Zero Downtime Deployments",
        "tone": "authoritative",
        "persona_id": persona_id,
        "target_platforms": ["twitter", "linkedin"]
    }
    post_res = client.post("/api/v1/posts/generate", json=gen_payload)
    assert post_res.status_code in [200, 201]
    data = post_res.json()
    assert data["persona_id"] == persona_id
    assert "persona" in data
    assert data["persona"]["id"] == persona_id
    assert "twitter" in data["platform_content"]