from fastapi import APIRouter
from pydantic import BaseModel
from app.hospitals.router import LUCKNOW_HOSPITALS
from app.ml_engine.engine import analytical_engine

router = APIRouter(prefix="/api/doctors", tags=["Doctor Triage"])


class TriageAssessmentInput(BaseModel):
    patient_name: str
    age: int
    hr: int
    sbp: int
    spo2: int
    troponin: float


@router.post("/triage")
def run_triage_assessment(payload: TriageAssessmentInput) -> dict:
    analysis = analytical_engine.analyze_vitals(
        age=payload.age,
        hr=payload.hr,
        sbp=payload.sbp,
        spo2=payload.spo2,
        troponin=payload.troponin,
    )
    ranked = analytical_engine.score_hospitals(
        LUCKNOW_HOSPITALS, analysis["risk_probability_pct"]
    )
    return {
        "patient_name": payload.patient_name,
        "analysis": analysis,
        "recommended_hospitals": ranked,
    }