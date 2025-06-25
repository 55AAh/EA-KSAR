from fastapi import APIRouter

# Create the main search router
search_router = APIRouter()

# This router will be used to include all search-related endpoints
# Individual search modules will register their routes with this router
