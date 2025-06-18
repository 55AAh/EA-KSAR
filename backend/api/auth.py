import logging

from fastapi import APIRouter

logger = logging.getLogger(__name__)


auth_router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@auth_router.get("/me", operation_id="get_me")
async def get_me():
    """
    Get the current user.
    """
    # TODO implement authentication logic
    logger.info("Fetching current user")
    return {"username": "kkulyk"}
