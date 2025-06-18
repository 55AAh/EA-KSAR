import logging
import pathlib
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.api import api_router
from .db import Db

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """
    Lifespan event handler for FastAPI.
    Connects to the database when the app starts.
    """
    Db.connect()
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(api_router)

# Serve static assets
frontend_dist = pathlib.Path(__file__).parent.parent / "frontend" / "dist"
app.mount(
    "/assets",
    StaticFiles(directory=frontend_dist / "assets", html=False),
    name="assets",
)


# Serve SPA
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith(("api/", "assets/")):
        return JSONResponse(content={"detail": "Not Found"}, status_code=404)
    return FileResponse(frontend_dist / "index.html")
