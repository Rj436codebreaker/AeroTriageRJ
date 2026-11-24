import hashlib
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

ALLOWED_ROLES = {"doctor", "nurse", "patient", "family", "ambulance", "client"}
VERIFICATION_REQUIRED_ROLES = {"doctor", "nurse", "ambulance", "client"}
USERS_DB: dict[str, dict] = {}


def _hash(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


class AuthPayload(BaseModel):
    role: str
    email: str
    password: str
    full_name: str | None = None
    credential_or_id: str | None = None


@router.post("/register")
def register_user(payload: AuthPayload) -> dict:
    role = payload.role.strip().lower()
    if role not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Unsupported role.")
    key = f"{role}:{payload.email.strip().lower()}"
    if key in USERS_DB:
        raise HTTPException(status_code=409, detail="User already registered for this role.")

    status = "pending_verification" if role in VERIFICATION_REQUIRED_ROLES else "active"
    USERS_DB[key] = {
        "role": role,
        "email": payload.email.strip().lower(),
        "full_name": payload.full_name or payload.email.split("@")[0],
        "credential_or_id": payload.credential_or_id,
        "password_hash": _hash(payload.password),
        "status": status,
    }
    return {
        "message": "Registration recorded.",
        "role": role,
        "status": status,
    }


@router.post("/login")
def login_user(payload: AuthPayload) -> dict:
    role = payload.role.strip().lower()
    if role not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Unsupported role.")
    key = f"{role}:{payload.email.strip().lower()}"
    user = USERS_DB.get(key)
    if not user or user["password_hash"] != _hash(payload.password):
        raise HTTPException(status_code=401, detail="Invalid credentials for selected role.")
    return {
        "access_token": f"aerotriage-{role}-{user['email']}",
        "role": role,
        "full_name": user["full_name"],
        "status": user["status"],
    }