import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import engine, Base
from backend.app.api.posts import router as posts_router
from backend.app.api.platforms import router as platforms_router
from backend.app.api.scheduler import router as scheduler_router
from backend.app.api.personas import router as personas_router
from backend.app.api.best_times import router as best_times_router
from backend.app.services.scheduler_service import SchedulerService
import backend.app.models.social

# Create tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: start APScheduler background service
    SchedulerService.start(interval_seconds=settings.SCHEDULER_INTERVAL_SECONDS)
    yield
    # Shutdown: stop scheduler
    SchedulerService.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(posts_router, prefix=settings.API_V1_STR)
app.include_router(platforms_router, prefix=settings.API_V1_STR)
app.include_router(scheduler_router, prefix=settings.API_V1_STR)
app.include_router(personas_router, prefix=settings.API_V1_STR)
app.include_router(best_times_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    is_sched_running = SchedulerService.scheduler is not None and SchedulerService.scheduler.running
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "scheduler_running": is_sched_running
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to AI Social Media Agent API",
        "docs": "/docs",
        "health": "/health"
    }

