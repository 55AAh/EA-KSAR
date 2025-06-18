#!/usr/bin/env -S uv run

from backend.logger import setup_logging, get_uvicorn_log_config
from backend.config import config
import uvicorn

setup_logging()


def main():
    uvicorn.run(
        "backend.app:app",
        host=("127.0.0.1" if config.server_dev else "0.0.0.0"),
        port=config.server_port,
        reload=config.server_dev,
        log_config=get_uvicorn_log_config(),
    )


if __name__ == "__main__":
    main()
