from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.social import Persona
from backend.app.schemas.social import PersonaCreate, PersonaUpdate

DEFAULT_ARCHETYPES = [
    {
        "name": "Tech Founder & Builder",
        "handle_or_tag": "@founder",
        "bio": "Building in public, sharing raw lessons, shipping metrics, and honest engineering challenges.",
        "archetype": "founder",
        "tone_attributes": {"wit": 75, "formality": 25, "provocation": 65, "technical_depth": 85},
        "banned_words": ["delve", "game-changer", "unleash", "tapestry", "revolutionary", "supercharge"],
        "sample_hooks": [
            "We rebuilt our entire architecture in 48 hours. Here is what broke:",
            "Most founders optimize for the wrong metric. Look at retention first:",
            "Unpopular opinion on scaling microservices vs monoliths in 2026:"
        ],
        "target_audience": "Founders, CTOs, and Full-Stack Engineers",
        "is_default": True
    },
    {
        "name": "Deep Tech Explainer",
        "handle_or_tag": "@explainer",
        "bio": "Demystifying complex distributed systems, LLM architectures, and infrastructure with clear mental models.",
        "archetype": "explainer",
        "tone_attributes": {"wit": 40, "formality": 60, "provocation": 30, "technical_depth": 95},
        "banned_words": ["magic", "easy", "simply", "tapestry", "game-changer"],
        "sample_hooks": [
            "How does vector search actually work under the hood? A visual breakdown:",
            "The trade-off between raft consensus and paxos in 60 seconds:",
            "Why your LLM context window is lying to you:"
        ],
        "target_audience": "Software Architects and Senior Engineers",
        "is_default": False
    },
    {
        "name": "Witty Growth Hacker",
        "handle_or_tag": "@growth",
        "bio": "Data-backed viral tactics, contrarian marketing takes, and high-converting copy teardowns.",
        "archetype": "growth_hacker",
        "tone_attributes": {"wit": 90, "formality": 15, "provocation": 85, "technical_depth": 50},
        "banned_words": ["delve", "synergy", "paradigm", "holistic", "seamless"],
        "sample_hooks": [
            "Stop writing boring LinkedIn openers. Use the curiosity gap instead:",
            "How we generated 100k impressions with 0 ad spend and 1 spicy graph:",
            "Your landing page has 3 seconds. Here is why users bounce:"
        ],
        "target_audience": "Product Marketers, Creators, and Growth Leads",
        "is_default": False
    },
    {
        "name": "Executive Thought Leader",
        "handle_or_tag": "@executive",
        "bio": "Strategic perspectives on AI leadership, team scaling, and sustainable business moats.",
        "archetype": "executive",
        "tone_attributes": {"wit": 30, "formality": 85, "provocation": 45, "technical_depth": 65},
        "banned_words": ["hacks", "secrets", "stuff", "delve", "crazy"],
        "sample_hooks": [
            "The three shifts every enterprise leadership team must make for autonomous AI:",
            "Culture is not perks. It is how your team handles critical outages:",
            "What board members are actually asking about AI governance this quarter:"
        ],
        "target_audience": "Executives, VPs, and Enterprise Decision Makers",
        "is_default": False
    }
]

class PersonaService:

    @staticmethod
    def ensure_default_personas(db: Session) -> List[Persona]:
        """Seeds default persona archetypes if none exist in the database."""
        count = db.query(Persona).count()
        if count > 0:
            return db.query(Persona).all()
        
        created = []
        for arch in DEFAULT_ARCHETYPES:
            p = Persona(**arch)
            db.add(p)
            created.append(p)
        db.commit()
        for p in created:
            db.refresh(p)
        return created

    @staticmethod
    def get_personas(db: Session) -> List[Persona]:
        PersonaService.ensure_default_personas(db)
        return db.query(Persona).order_by(Persona.is_default.desc(), Persona.created_at.asc()).all()

    @staticmethod
    def get_persona_by_id(db: Session, persona_id: str) -> Optional[Persona]:
        return db.query(Persona).filter(Persona.id == persona_id).first()

    @staticmethod
    def create_persona(db: Session, payload: PersonaCreate) -> Persona:
        if payload.is_default:
            db.query(Persona).update({Persona.is_default: False})
        
        p = Persona(**payload.model_dump())
        db.add(p)
        db.commit()
        db.refresh(p)
        return p

    @staticmethod
    def update_persona(db: Session, persona_id: str, payload: PersonaUpdate) -> Optional[Persona]:
        p = db.query(Persona).filter(Persona.id == persona_id).first()
        if not p:
            return None
        
        update_data = payload.model_dump(exclude_unset=True)
        if update_data.get("is_default"):
            db.query(Persona).filter(Persona.id != persona_id).update({Persona.is_default: False})

        for key, val in update_data.items():
            setattr(p, key, val)
        
        db.commit()
        db.refresh(p)
        return p

    @staticmethod
    def delete_persona(db: Session, persona_id: str) -> bool:
        p = db.query(Persona).filter(Persona.id == persona_id).first()
        if not p:
            return False
        db.delete(p)
        db.commit()
        return True