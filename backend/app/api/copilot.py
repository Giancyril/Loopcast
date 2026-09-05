"""
API endpoints for AI Social Copilot Chat & Refinement Drawer
POST /api/v1/copilot/refine
POST /api/v1/copilot/diagnose
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Any, List, Optional
from ..services.copilot_service import refine_copy, diagnose_copy

router = APIRouter()


class RefineRequest(BaseModel):
    copy: str = Field(..., min_length=1)
    action: Optional[str] = Field(None, example="sharpen_hook")
    custom_instruction: Optional[str] = Field(None, example="Make it sound like a senior software architect")
    platform: str = Field("twitter", example="twitter")
    tone: Optional[str] = Field(None, example="technical")


class RefineResponse(BaseModel):
    original_text: str
    refined_text: str
    action: Optional[str]
    custom_instruction: Optional[str]
    platform: str
    applied_actions: List[str]
    diff_summary: dict[str, Any]


class DiagnoseRequest(BaseModel):
    copy: str = Field(..., min_length=1)
    platform: str = Field("twitter", example="twitter")


class DiagnoseResponse(BaseModel):
    platform: str
    char_count: int
    char_limit: int
    word_count: int
    hook_grade: str
    readability_score: float
    issues: List[str]
    recommendations: List[str]
    is_optimal: bool


@router.post("/copilot/refine", response_model=RefineResponse, summary="Refine post copy with Copilot")
async def refine_endpoint(payload: RefineRequest) -> RefineResponse:
    res = refine_copy(
        copy=payload.copy,
        action=payload.action,
        custom_instruction=payload.custom_instruction,
        platform=payload.platform,
        tone=payload.tone,
    )
    return RefineResponse(**res)


@router.post("/copilot/diagnose", response_model=DiagnoseResponse, summary="Diagnose copy readability and hook")
async def diagnose_endpoint(payload: DiagnoseRequest) -> DiagnoseResponse:
    res = diagnose_copy(text=payload.copy, platform=payload.platform)
    return DiagnoseResponse(**res)
