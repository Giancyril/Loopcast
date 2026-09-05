import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_full_approval_and_feedback_lifecycle():
    # 1. Generate new post draft
    gen_res = client.post("/api/v1/posts/generate", json={
        "topic": "LangGraph Autonomous Agents",
        "tone": "engaging",
        "target_platforms": ["twitter", "linkedin"]
    })
    assert gen_res.status_code == 201
    post_data = gen_res.json()
    post_id = post_data["id"]
    assert post_data["status"] == "pending_approval"
    assert "twitter" in post_data["platform_content"]
    assert "linkedin" in post_data["platform_content"]
    assert len(post_data["logs"]) >= 1

    # 2. List posts in pending approval queue
    list_res = client.get("/api/v1/posts?status=pending_approval")
    assert list_res.status_code == 200
    posts = list_res.json()
    assert any(p["id"] == post_id for p in posts)

    # 3. Inline manual edit
    edited_twitter = "Updated hook: Autonomous agents with human safety nets. #AI"
    edit_res = client.put(f"/api/v1/posts/{post_id}/edit", json={
        "platform_content": {
            "twitter": edited_twitter,
            "linkedin": post_data["platform_content"]["linkedin"]
        }
    })
    assert edit_res.status_code == 200
    assert edit_res.json()["platform_content"]["twitter"] == edited_twitter

    # 4. Human rejection with feedback (triggers AI regeneration)
    feedback_msg = "Make it sound more punchy and mention 10x developer productivity"
    reject_res = client.post(f"/api/v1/posts/{post_id}/reject", json={
        "feedback": feedback_msg
    })
    assert reject_res.status_code == 200
    revised_data = reject_res.json()
    assert revised_data["status"] == "pending_approval"
    # Verify feedback was stored in audit logs
    assert any(log["action"] == "rejected" and log["reviewer_feedback"] == feedback_msg for log in revised_data["logs"])

    # 5. Approve and schedule
    scheduled_time = (datetime.utcnow() + timedelta(hours=2)).isoformat()
    approve_res = client.post(f"/api/v1/posts/{post_id}/approve", json={
        "scheduled_for": scheduled_time
    })
    assert approve_res.status_code == 200
    approved_data = approve_res.json()
    assert approved_data["status"] == "scheduled"
    assert approved_data["scheduled_for"] is not None

    # 6. Verify it is no longer in pending_approval list
    pending_check = client.get("/api/v1/posts?status=pending_approval")
    assert not any(p["id"] == post_id for p in pending_check.json())

    # 7. Verify it is in scheduled list
    scheduled_check = client.get("/api/v1/posts?status=scheduled")
    assert any(p["id"] == post_id for p in scheduled_check.json())
