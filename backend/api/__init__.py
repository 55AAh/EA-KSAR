from fastapi import APIRouter

from backend.api.auth import auth_router
from backend.api.plants_units import plants_units_router
from backend.api.unit import unit_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(plants_units_router)
api_router.include_router(unit_router)
