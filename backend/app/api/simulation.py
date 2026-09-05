"""
API endpoint: POST /api/v1/simulation/ab-test
Runs A/B hook simulations and engagement forecasts.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Any, List
from ..services.simulation_sandbox import run_ab_test

router = APIRouter()


class VariantInput(BaseModel):
    variant_id: str = Field(..., json_schema_extra={"example": "var-a"})
    hook_text: str = Field(..., json_schema_extra={"example": "99% of creators fail because they ignore this 1 metric."})
    hook_type: str = Field("bold_claim", json_schema_extra={"example": "bold_claim"})


class ABTestRequest(BaseModel):
    variants: List[VariantInput] = Field(..., min_length=1)
    platform: str = Field("twitter", json_schema_extra={"example": "twitter"})


class ABTestResponse(BaseModel):
    platform: str
    variants_tested: int
    results: List[dict[str, Any]]
    winner: str | None
    insight: str


@router.post("/simulation/ab-test", response_model=ABTestResponse, summary="Run A/B hook simulation")
async def ab_test(payload: ABTestRequest) -> ABTestResponse:
    """
    Simulate A/B hook performance across virality, CTR, likes, shares, and comments.
    """
    valid_platforms = {"twitter", "linkedin", "instagram"}
    if payload.platform not in valid_platforms:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid platform '{payload.platform}'. Valid: {list(valid_platforms)}"
        )

    raw_variants = [v.model_dump() for v in payload.variants]
    result = run_ab_test(raw_variants, platform=payload.platform)

    return ABTestResponse(**result)
