from fastapi import APIRouter
from backend.app.services.scheduler_service import SchedulerService

router = APIRouter(prefix="/scheduler", tags=["Scheduler & Publishing"])

@router.post("/run-now")
def trigger_scheduler_tick():
    """Immediately triggers a polling cycle to publish any due posts."""
    result = SchedulerService.publish_due_posts()
    return {
        "status": "triggered",
        "result": result
    }

@router.get("/status")
def get_scheduler_status():
    """Returns whether the scheduler background worker is active."""
    is_running = SchedulerService.scheduler is not None and SchedulerService.scheduler.running
    return {
        "is_running": is_running
    }
