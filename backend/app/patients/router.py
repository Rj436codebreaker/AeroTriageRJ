from fastapi import APIRouter

router = APIRouter(prefix="/api/patients", tags=["Patient Portal"])


@router.get("/{patient_id}/summary")
def patient_summary(patient_id: str) -> dict:
    return {
        "patient_id": patient_id,
        "status": "Active Monitoring",
        "latest_notes": "Vitals synced with AeroTriage analytical engine.",
    }