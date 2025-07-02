from .base import search_router
from . import plant  # Import to register the routes
from . import unit  # Import to register the unit routes
from . import document  # Import to register the document routes
from . import placement  # Import to register the placement routes

__all__ = ["search_router", "plant", "unit", "document", "placement"]
