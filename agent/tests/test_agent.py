import pytest
from agent.tools.brand_rules import critique_draft, format_for_twitter, format_for_linkedin
from agent.graph.workflow import run_agent_generation, resume_agent_with_feedback

def test_brand_critique_quality_scores():
    # Good post with hook and CTA
    good_post = (
        "?? Is your team ready for the next shift in AI productivity?\n\n"
        "Here is what top engineering teams are doing differently this year.\n\n"
        "What has been your experience? Let us know below! ??\n"
        "#AI #Engineering"
    )
    result = critique_draft(good_post, tone="engaging")
    assert result["passed"] is True
    assert result["score"] >= 75
    assert len(result["strengths"]) > 0

    # Bad post with banned buzzwords and no CTA
    bad_post = "We are disrupting the industry with our groundbreaking revolutionary synergy."
    bad_result = critique_draft(bad_post, tone="engaging")
    assert bad_result["score"] < 75
    assert any("buzzwords" in w.lower() for w in bad_result["weaknesses"])

def test_platform_formatting_constraints():
    raw_text = (
        "We are announcing our new open-source social media management workflow today.\n"
        "It features automated generation, self-critique, and an intuitive approval queue.\n"
        "Check it out and let us know what you think!"
    )
    
    # Twitter: must be <= 280 characters
    tw_post = format_for_twitter(raw_text)
    assert len(tw_post) <= 280
    assert "#" in tw_post

    # LinkedIn: professional spacing and CTA
    li_post = format_for_linkedin(raw_text)
    assert "What are your thoughts" in li_post
    assert "#Leadership" in li_post

def test_langgraph_generation_and_interrupt():
    res = run_agent_generation(
        topic="Automated AI Workflows",
        tone="professional",
        target_platforms=["twitter", "linkedin"]
    )
    
    assert "thread_id" in res
    state = res["state"]
    assert state["raw_draft"] is not None
    assert len(state["raw_draft"]) > 10
    assert state["critique"] is not None
    assert state["approval_status"] == "pending_approval"
    assert "twitter" in state["platform_posts"]
    assert "linkedin" in state["platform_posts"]
    
    # Verify interrupt paused right before await_approval
    assert res["next_step"] == ("await_approval",)

def test_langgraph_feedback_loop():
    res = run_agent_generation(topic="DevOps Automation")
    thread_id = res["thread_id"]
    
    # Simulate human rejection with feedback
    feedback = "Make it shorter and emphasize security over speed"
    revised = resume_agent_with_feedback(thread_id, feedback)
    
    revised_state = revised["state"]
    assert revised_state["human_feedback"] == feedback
    assert feedback in revised_state["raw_draft"]
