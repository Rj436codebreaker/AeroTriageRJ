from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/nurses", tags=["Nursing Care"])

OBSERVATIONS: list[dict] = []


class CareObservation(BaseModel):
    patient_id: str
    note: str
    spo2: int
    hr: int


@router.get("/observations")
def list_observations() -> list[dict]:
    return OBSERVATIONS


@router.post("/observations")
def add_observation(item: CareObservation) -> dict:
    record = item.model_dump()
    OBSERVATIONS.append(record)
    return {"status": "recorded", "observation": record}