"""
API endpoint: POST /api/v1/best-times
Returns predicted best posting times with heatmaps per platform.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Any
from ..services.predictive_scheduler import get_best_times

router = APIRouter()


class BestTimesRequest(BaseModel):
    platforms: list[str] = Field(..., min_items=1, example=["twitter", "linkedin"])
    content_type: str = Field("single", example="thread")
    persona_id: str | None = Field(None, example="persona-abc-123")


class BestTimesResponse(BaseModel):
    recommendations: dict[str, Any]


@router.post("/best-times", response_model=BestTimesResponse, summary="Get predicted best posting times")
async def best_times(payload: BestTimesRequest) -> BestTimesResponse:
    """
    Compute engagement heatmaps and top-3 best posting windows per platform.

    - **platforms**: list of platforms to analyse (twitter, linkedin, instagram)
    - **content_type**: single | thread | carousel | video — adjusts engagement boosts
    - **persona_id**: optional — seeds slight persona-specific variation
    """
    valid = {"twitter", "linkedin", "instagram"}
    bad = [p for p in payload.platforms if p not in valid]
    if bad:
        raise HTTPException(status_code=422, detail=f"Unknown platforms: {bad}. Valid: {list(valid)}")

    data = get_best_times(
        platforms=payload.platforms,
        content_type=payload.content_type,
        persona_id=payload.persona_id,
    )
    return BestTimesResponse(recommendations=data)
