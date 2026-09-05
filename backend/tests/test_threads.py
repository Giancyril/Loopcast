import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import SessionLocal, Base, engine
from backend.app.services.post_service import PostService
from backend.app.services.scheduler_service import SchedulerService
from agent.tools.thread_weaver import generate_thread_and_carousel, critique_thread
from platforms.twitter_adapter import TwitterAdapter

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield

def test_thread_critique_metrics():
    # Good thread
    good_tweets = [
        "1/5 Why 90% of engineers fail to scale their microservices in year one:",
        "2/5 The problem is premature distributed transactions before establishing clear bounded contexts.",
        "3/5 Instead, adopt event-driven state machines with durable idempotency keys.",
        "4/5 We saw a 70% drop in cascade timeouts after migrating to this pattern.",
        "5/5 Bookmark this thread if you are designing distributed architectures in 2026! Follow for more breakdowns."
    ]
    critique = critique_thread(good_tweets)
    assert critique["passed"] is True
    assert critique["score"] >= 75
    assert critique["hook_score"] >= 70
    assert critique["rhythm_score"] >= 70
    assert critique["cta_score"] >= 70

    # Bad thread (no numbering, missing CTA, too short)
    bad_tweets = ["Just some thoughts on code.", "It works sometimes."]
    bad_critique = critique_thread(bad_tweets)
    assert bad_critique["passed"] is False
    assert bad_critique["score"] < 70
    assert any("too brief" in w.lower() for w in bad_critique["weaknesses"])

def test_thread_generator_output():
    result = generate_thread_and_carousel(
        topic="Event-Driven Microservices",
        raw_draft="Draft text here"
    )
    assert len(result["thread_tweets"]) == 5
    assert len(result["carousel_slides"]) == 5
    assert result["thread_tweets"][0].startswith("1/5")
    assert result["carousel_slides"][0]["type"] == "cover"

def test_twitter_adapter_publish_thread():
    adapter = TwitterAdapter(is_mock=True)
    tweets = [
        "1/3 Announcing our new distributed compute engine.",
        "2/3 Benchmarked at sub-millisecond p99 latency across 10 global regions.",
        "3/3 Read the technical whitepaper below and share your thoughts!"
    ]
    res = adapter.publish_thread(tweets)
    assert res["status"] == "published"
    assert res["is_thread"] is True
    assert res["tweet_count"] == 3
    assert len(res["thread"]) == 3
    # Verify sequential in_reply_to_tweet_id chaining
    assert res["thread"][0]["in_reply_to_tweet_id"] is None
    assert res["thread"][1]["in_reply_to_tweet_id"] == res["thread"][0]["tweet_id"]
    assert res["thread"][2]["in_reply_to_tweet_id"] == res["thread"][1]["tweet_id"]

def test_thread_end_to_end_approval_and_publishing():
    db = SessionLocal()
    try:
        # Generate thread post
        post = PostService.generate_post(
            db=db,
            topic="Next-Gen AI Agents",
            tone="engaging",
            target_platforms=["twitter"],
            generate_thread=True
        )
        assert post.is_thread is True
        assert len(post.thread_tweets) == 5
        assert len(post.carousel_slides) == 5

        # Approve post for immediate publishing
        approved = PostService.approve_post(db=db, post_id=post.id)
        assert approved.status == "approved"

        # Trigger scheduler sweep
        sweep_res = SchedulerService.publish_due_posts()
        assert sweep_res["published_count"] >= 1

        db.refresh(approved)
        assert approved.status == "published"
    finally:
        db.close()