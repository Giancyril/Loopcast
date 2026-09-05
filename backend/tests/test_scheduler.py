import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import SessionLocal
from backend.app.models.social import Post
from backend.app.services.scheduler_service import SchedulerService

client = TestClient(app)

def test_scheduler_publishes_approved_immediate_post():
    db = SessionLocal()
    post = Post(
        topic="Immediate Release",
        tone="engaging",
        status="approved",
        platform_content={
            "twitter": "Breaking news on our AI pipeline! #Innovation",
            "linkedin": "We are proud to share our immediate announcement with you.\n\n#Leadership"
        }
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    post_id = post.id
    db.close()

    # Trigger scheduler
    res = SchedulerService.publish_due_posts()
    assert res["published_count"] >= 1

    # Verify DB state
    db = SessionLocal()
    updated = db.query(Post).filter(Post.id == post_id).first()
    assert updated.status == "published"
    assert updated.published_at is not None
    db.close()

def test_scheduler_publishes_due_scheduled_post():
    db = SessionLocal()
    due_time = datetime.utcnow() - timedelta(minutes=5)
    post = Post(
        topic="Scheduled Release Past",
        tone="engaging",
        status="scheduled",
        scheduled_for=due_time,
        platform_content={
            "twitter": "Scheduled post reaching Twitter! #Tech"
        }
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    post_id = post.id
    db.close()

    SchedulerService.publish_due_posts()

    db = SessionLocal()
    updated = db.query(Post).filter(Post.id == post_id).first()
    assert updated.status == "published"
    db.close()

def test_scheduler_ignores_future_scheduled_post():
    db = SessionLocal()
    future_time = datetime.utcnow() + timedelta(hours=5)
    post = Post(
        topic="Future Release",
        tone="engaging",
        status="scheduled",
        scheduled_for=future_time,
        platform_content={
            "twitter": "This post should NOT publish yet! #Future"
        }
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    post_id = post.id
    db.close()

    SchedulerService.publish_due_posts()

    db = SessionLocal()
    updated = db.query(Post).filter(Post.id == post_id).first()
    assert updated.status == "scheduled"
    assert updated.published_at is None
    db.close()

def test_scheduler_api_endpoints():
    res = client.post("/api/v1/scheduler/run-now")
    assert res.status_code == 200
    assert res.json()["status"] == "triggered"

    status_res = client.get("/api/v1/scheduler/status")
    assert status_res.status_code == 200
    assert "is_running" in status_res.json()
