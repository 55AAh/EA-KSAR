from .base import search_router
from . import plant  # Import to register the routes
from . import unit  # Import to register the unit routes

__all__ = ["search_router"]
