from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/ambulances", tags=["Ambulance Dispatch"])

DISPATCHES: list[dict] = []


class DispatchRequest(BaseModel):
    ambulance_code: str
    hospital_id: str
    patient_ref: str


@router.get("/dispatches")
def list_dispatches() -> list[dict]:
    return DISPATCHES


@router.post("/dispatch")
def create_dispatch(req: DispatchRequest) -> dict:
    entry = {**req.model_dump(), "status": "EN_ROUTE"}
    DISPATCHES.append(entry)
    return entry