from fastapi import APIRouter

router = APIRouter(prefix="/api/family", tags=["Family Portal"])


@router.get("/guidance")
def family_guidance() -> dict:
    return {
        "linked_status": "Awaiting live patient link",
        "emergency_protocol": [
            "Lay the person flat safely and check responsiveness and breathing.",
            "Keep airway clear; do not force liquids if unconscious.",
            "Track ambulance dispatch and confirm hospital bed readiness.",
        ],
    }