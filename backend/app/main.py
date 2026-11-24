from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.ambulances.router import router as ambulances_router
from app.auth.router import router as auth_router
from app.clients.router import router as clients_router
from app.doctors.router import router as doctors_router
from app.family.router import router as family_router
from app.hospitals.router import router as hospitals_router
from app.nurses.router import router as nurses_router
from app.patients.router import router as patients_router

app = FastAPI(title="AeroTriage Enterprise API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(doctors_router)
app.include_router(nurses_router)
app.include_router(patients_router)
app.include_router(family_router)
app.include_router(ambulances_router)
app.include_router(hospitals_router)
app.include_router(clients_router)


@app.get("/")
def root() -> dict:
    return {"status": "online", "system": "AeroTriage"}