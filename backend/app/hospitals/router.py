from fastapi import APIRouter
from pydantic import BaseModel
from app.ml_engine.engine import analytical_engine

router = APIRouter(prefix="/api/hospitals", tags=["Hospitals & Grid"])

LUCKNOW_HOSPITALS = [
    {
        "id": "H1",
        "name": "Lari Cardiology Center (KGMU)",
        "address": "Chowk, Lucknow",
        "lat": 26.8687,
        "lon": 80.9168,
        "distance_km": 4.2,
        "total_beds": 50,
        "available_beds": 0,
    },
    {
        "id": "H2",
        "name": "Dr. RML Institute (RMLIMS)",
        "address": "Gomti Nagar, Lucknow",
        "lat": 26.8631,
        "lon": 81.0001,
        "distance_km": 6.8,
        "total_beds": 30,
        "available_beds": 6,
    },
    {
        "id": "H3",
        "name": "Medanta Hospital",
        "address": "Shaheed Path, Lucknow",
        "lat": 26.7801,
        "lon": 80.9923,
        "distance_km": 8.4,
        "total_beds": 25,
        "available_beds": 8,
    },
]


class RoutingRequest(BaseModel):
    risk_probability_pct: float = 75.0


@router.get("/grid")
def get_hospital_grid() -> list[dict]:
    return LUCKNOW_HOSPITALS


@router.post("/rank")
def rank_hospitals(payload: RoutingRequest) -> list[dict]:
    return analytical_engine.score_hospitals(
        LUCKNOW_HOSPITALS, payload.risk_probability_pct
    )