from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas.social import PersonaCreate, PersonaUpdate, PersonaResponse
from backend.app.services.persona_service import PersonaService

router = APIRouter(prefix="/personas", tags=["personas"])

@router.get("", response_model=List[PersonaResponse])
def get_all_personas(db: Session = Depends(get_db)):
    """Retrieve all configured brand voice personas."""
    return PersonaService.get_personas(db)

@router.get("/{persona_id}", response_model=PersonaResponse)
def get_persona(persona_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a single brand persona."""
    persona = PersonaService.get_persona_by_id(db, persona_id)
    if not persona:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Persona not found")
    return persona

@router.post("", response_model=PersonaResponse, status_code=status.HTTP_201_CREATED)
def create_persona(payload: PersonaCreate, db: Session = Depends(get_db)):
    """Create a new custom brand voice persona."""
    return PersonaService.create_persona(db, payload)

@router.put("/{persona_id}", response_model=PersonaResponse)
def update_persona(persona_id: str, payload: PersonaUpdate, db: Session = Depends(get_db)):
    """Update persona guidelines, banned words, or tone sliders."""
    updated = PersonaService.update_persona(db, persona_id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Persona not found")
    return updated

@router.delete("/{persona_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_persona(persona_id: str, db: Session = Depends(get_db)):
    """Delete a brand voice persona."""
    success = PersonaService.delete_persona(db, persona_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Persona not found")
    return None