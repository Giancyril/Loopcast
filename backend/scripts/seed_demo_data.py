"""
Seed realistic demo data for Loopcast
"""

import sys
import os
import uuid
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.core.database import SessionLocal, engine, Base
from backend.app.models.social import Post, PlatformConnection, Persona

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        now = datetime.now(timezone.utc)
        existing_topics = [p.topic for p in db.query(Post).all()]

        if "5 Engineering Lessons from Rebuilding Our Agentic Pipeline" not in existing_topics:
            p1 = Post(
                topic="5 Engineering Lessons from Rebuilding Our Agentic Pipeline",
                tone="technical",
                status="pending_approval",
                is_thread=True,
                thread_tweets=[
                    "We rebuilt our multi-agent pipeline from scratch. Here are 5 hard lessons on state management and interrupts 🧵👇",
                    "1/ Deterministic state beats prompt magic every time. If your agent depends on a 4,000-token prompt without checkpointing, it will drift.",
                    "2/ Human-in-the-loop shouldn't be an afterthought. Interrupt nodes in LangGraph gave us instant review capabilities without killing state.",
                    "3/ Rate limits kill silent agents. Add exponential backoff with jitter on your publishing adapters immediately.",
                    "4/ The best prompt is a small prompt with focused guardrail schemas. Strip out buzzwords before the model ever outputs.",
                    "5/ Next step: We're making our predictive scheduler open. What's your biggest bottleneck with autonomous agents? Drop it below 🔖"
                ],
                platform_content={
                    "twitter": "We rebuilt our multi-agent pipeline from scratch. Here are 5 hard lessons on state management and interrupts 🧵👇",
                    "linkedin": "Last quarter we re-architected our core AI publishing pipeline.\n\nKey takeaways:\n• State machine determinism over fuzzy prompts\n• Native human-in-the-loop review interrupts\n• Guardrails that ban fluff before output\n\nHow is your team handling agentic state persistence?",
                },
                critique={
                    "score": 94,
                    "strengths": ["Strong hook with curiosity gap", "Actionable numbered tips", "Clear technical authority"],
                    "recommendations": "Add a link to the architecture diagram in the final tweet.",
                },
                created_at=now - timedelta(hours=2),
            )
            db.add(p1)

        if "The 2025 Playbook for Organic B2B Growth" not in existing_topics:
            p2 = Post(
                topic="The 2025 Playbook for Organic B2B Growth",
                tone="professional",
                status="scheduled",
                scheduled_for=now + timedelta(days=1, hours=4),
                carousel_slides=[
                    {"slide": 1, "title": "The 2025 B2B Growth Playbook", "subtitle": "Why old playbooks are failing & what works now", "type": "cover"},
                    {"slide": 2, "title": "The Problem: Feed Algorithmic Fatigue", "subtitle": "Generic AI fluff has cratered organic CTR by 42%", "type": "problem"},
                    {"slide": 3, "title": "The Solution: Brand Voice DNA", "subtitle": "Guardrails that enforce authentic founder perspective", "type": "solution"},
                    {"slide": 4, "title": "The Data: 3.4x Higher Engagement", "subtitle": "Measured across 50,000 published tech updates", "type": "metrics"},
                    {"slide": 5, "title": "Ready to Automate Authentically?", "subtitle": "Start your autonomous loop with Loopcast", "type": "cta"},
                ],
                platform_content={
                    "linkedin": "Most B2B social feeds look identical because teams use default prompts.\n\nHere is our 5-slide breakdown on building authentic distribution engines 📊",
                    "twitter": "Most B2B feeds look identical because teams use default prompts. Here is the 5-slide breakdown on authentic distribution:",
                },
                critique={
                    "score": 91,
                    "strengths": ["Clear visual hierarchy", "High-value slide sequence"],
                    "recommendations": "Ensure slide 4 metrics are emphasized in the cover text.",
                },
                created_at=now - timedelta(hours=6),
            )
            db.add(p2)

        db.commit()
        print("Demo seed complete. Total posts:", db.query(Post).count())
    finally:
        db.close()

if __name__ == "__main__":
    seed()
