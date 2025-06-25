from fastapi import APIRouter, Depends

from backend.api.auth import auth_router, get_current_user
from backend.api.plants_units import plants_units_router
from backend.api.unit import unit_router
from backend.api.search import search_router

api_router = APIRouter(prefix="/api")

# Auth routes don't require authentication
api_router.include_router(auth_router)

# Protected API router that requires authentication for all routes
protected_router = APIRouter(dependencies=[Depends(get_current_user)])
protected_router.include_router(plants_units_router)
protected_router.include_router(unit_router)
protected_router.include_router(search_router, prefix="/search")

# Include the protected router in the main API router
api_router.include_router(protected_router)
