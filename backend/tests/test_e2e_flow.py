import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import SessionLocal
from backend.app.models.social import Post, PlatformConnection, ApprovalLog
from backend.app.services.scheduler_service import SchedulerService

client = TestClient(app)

def test_complete_end_to_end_agent_lifecycle():
    # Step 1: Connect platforms (Twitter & LinkedIn)
    c1 = client.post("/api/v1/platforms/twitter/connect")
    assert c1.status_code == 200
    c2 = client.post("/api/v1/platforms/linkedin/connect")
    assert c2.status_code == 200

    # Step 2: Agent generates content from a brief
    topic = "Autonomous Social Media Agents with Human-in-the-Loop"
    gen_res = client.post("/api/v1/posts/generate", json={
        "topic": topic,
        "tone": "professional",
        "target_platforms": ["twitter", "linkedin"]
    })
    assert gen_res.status_code == 201
    post = gen_res.json()
    post_id = post["id"]
    assert post["status"] == "pending_approval"
    assert "twitter" in post["platform_content"]
    assert "linkedin" in post["platform_content"]
    assert post["critique"]["score"] >= 70

    # Step 3: Human reviewer makes an inline adjustment
    updated_twitter = "Autonomous social media agents require human oversight. Check out our open-source release! #AI #Tech"
    edit_res = client.put(f"/api/v1/posts/{post_id}/edit", json={
        "platform_content": {
            "twitter": updated_twitter,
            "linkedin": post["platform_content"]["linkedin"]
        }
    })
    assert edit_res.status_code == 200
    assert edit_res.json()["platform_content"]["twitter"] == updated_twitter

    # Step 4: Human reviewer requests revision (feedback loop)
    feedback_text = "Add an explicit reference to LangGraph checkpoints"
    reject_res = client.post(f"/api/v1/posts/{post_id}/reject", json={
        "feedback": feedback_text
    })
    assert reject_res.status_code == 200
    revised = reject_res.json()
    assert revised["status"] == "pending_approval"
    # Ensure feedback is in raw content or audit logs
    assert any(log["action"] == "rejected" for log in revised["logs"])

    # Step 5: Human approves and schedules for immediate publication
    approve_res = client.post(f"/api/v1/posts/{post_id}/approve", json={
        "scheduled_for": None
    })
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "approved"

    # Step 6: Trigger background publishing scheduler
    poll_res = client.post("/api/v1/scheduler/run-now")
    assert poll_res.status_code == 200
    assert poll_res.json()["result"]["published_count"] >= 1

    # Step 7: Verify post status updated to published with audit trail
    final_res = client.get(f"/api/v1/posts/{post_id}")
    assert final_res.status_code == 200
    final_data = final_res.json()
    assert final_data["status"] == "published"
    assert final_data["published_at"] is not None
    assert any(log["action"] == "published" for log in final_data["logs"])

def test_error_states_and_edge_cases():
    # 1. 404 for non-existent post
    res = client.get("/api/v1/posts/non-existent-id")
    assert res.status_code == 404

    # 2. Approve non-existent post
    appr_res = client.post("/api/v1/posts/non-existent-id/approve", json={})
    assert appr_res.status_code == 404

    # 3. Reject non-existent post
    rej_res = client.post("/api/v1/posts/non-existent-id/reject", json={"feedback": "error"})
    assert rej_res.status_code == 404

    # 4. Invalid platform verification
    inv_p = client.get("/api/v1/platforms/unsupported_platform/verify")
    assert inv_p.status_code == 400
