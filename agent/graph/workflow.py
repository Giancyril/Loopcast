import uuid
from typing import Dict, Any, List, Optional
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from agent.graph.state import AgentState
from agent.graph.nodes import (
    generate_node,
    critique_node,
    format_node,
    await_approval_node
)

def should_format(state: AgentState) -> str:
    """Conditional router based on critique score & self-correction iterations."""
    if state.get("critique_passed", False) or state.get("iteration_count", 0) >= 3:
        return "format"
    return "generate"

def build_social_agent_graph():
    """Builds and compiles the human-in-the-loop social media LangGraph state machine."""
    workflow = StateGraph(AgentState)

    # Register nodes
    workflow.add_node("generate", generate_node)
    workflow.add_node("critique", critique_node)
    workflow.add_node("format", format_node)
    workflow.add_node("await_approval", await_approval_node)

    # Set entry point
    workflow.set_entry_point("generate")

    # Connect nodes
    workflow.add_edge("generate", "critique")
    workflow.add_conditional_edges(
        "critique",
        should_format,
        {
            "format": "format",
            "generate": "generate"
        }
    )
    workflow.add_edge("format", "await_approval")
    workflow.add_edge("await_approval", END)

    # Checkpoint memory to enable durable interrupts and resume
    checkpointer = MemorySaver()
    compiled_app = workflow.compile(
        checkpointer=checkpointer,
        interrupt_before=["await_approval"]
    )
    return compiled_app

# Singleton instance
social_agent_app = build_social_agent_graph()

def run_agent_generation(
    topic: str,
    tone: str = "engaging",
    target_platforms: Optional[List[str]] = None,
    thread_id: Optional[str] = None
) -> Dict[str, Any]:
    """Runs generation pipeline up to the await_approval interrupt."""
    if not thread_id:
        thread_id = str(uuid.uuid4())

    config = {"configurable": {"thread_id": thread_id}}
    initial_state: AgentState = {
        "topic": topic,
        "tone": tone,
        "target_platforms": target_platforms or ["twitter", "linkedin"],
        "raw_draft": "",
        "critique": {},
        "critique_passed": False,
        "iteration_count": 0,
        "platform_posts": {},
        "human_feedback": None,
        "approval_status": "pending_approval",
        "error": None
    }

    # Execute graph until the interrupt point
    for _ in social_agent_app.stream(initial_state, config):
        pass

    # Retrieve current state from checkpointer
    state_snapshot = social_agent_app.get_state(config)
    return {
        "thread_id": thread_id,
        "state": state_snapshot.values,
        "next_step": state_snapshot.next
    }

def resume_agent_with_feedback(
    thread_id: str,
    feedback: str
) -> Dict[str, Any]:
    """Resumes agent from interrupt with human rejection feedback and re-generates."""
    config = {"configurable": {"thread_id": thread_id}}
    current_snapshot = social_agent_app.get_state(config)
    
    current_values = dict(current_snapshot.values)
    current_values["human_feedback"] = feedback
    current_values["critique_passed"] = False
    current_values["approval_status"] = "pending_approval"
    
    # Update state and restart at generate node
    social_agent_app.update_state(config, current_values, as_node="await_approval")
    
    # Re-run from generate
    for _ in social_agent_app.stream(
        {"human_feedback": feedback, "raw_draft": ""},
        config
    ):
        pass

    updated_snapshot = social_agent_app.get_state(config)
    return {
        "thread_id": thread_id,
        "state": updated_snapshot.values,
        "next_step": updated_snapshot.next
    }
