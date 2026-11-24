from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/clients", tags=["Client / Hospital Org"])

ORGANIZATIONS: list[dict] = []


class OrgRegistration(BaseModel):
    organization_name: str
    city: str = "Lucknow"
    contact_email: str


@router.get("/organizations")
def list_orgs() -> list[dict]:
    return ORGANIZATIONS


@router.post("/organizations")
def register_org(org: OrgRegistration) -> dict:
    record = {**org.model_dump(), "verification_status": "PENDING_ADMIN_REVIEW"}
    ORGANIZATIONS.append(record)
    return record