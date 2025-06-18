import logging

from rich.logging import RichHandler
from uvicorn import config as uvicorn_config

from .config import config


def setup_logging():
    """
    Sets up the base logging configuration:

    - Removes existing root handlers
    - Configures RichHandler for colored console output
    - Adjusts log levels for uvicorn, watchfiles, and sqlalchemy
    """

    class ShortNameFilter(logging.Filter):
        """
        A filter that shortens logger names and adds color markup
        for better readability in the console.
        """

        def __init__(self):
            super().__init__()
            self.levelno = logging.getLevelNamesMapping()[config.log_level.upper()]

            self.name_map = {
                "uvicorn.error": "UVICORN",
                "watchfiles.main": "WATCHER",
                "uvicorn.access": "WEB",
                "sqlalchemy.engine.Engine": "ORM",
            }

            self.color_map = {
                "UVICORN": "red",
                "WATCHER": "red",
                "WEB": "blue",
                "ORM": "green",
            }

        def filter(self, record):
            """
            Processes each log record:

            - Renames known logger names into short labels
            - Removes the ``backend.`` prefix from project modules
            - Applies Rich color markup if a color is defined
            """

            if record.name in self.name_map:
                record.name = self.name_map[record.name]

            color = self.color_map.get(record.name)
            record.name = record.name.removeprefix("backend.")

            if color:
                record.name = f"[{color}]{record.name}[/{color}]"

            return True

    # Create a RichHandler for colorful, formatted output
    handler = RichHandler(markup=True, show_path=False)
    handler.addFilter(ShortNameFilter())
    handler.setLevel(config.log_level.upper())

    # Set up logging configuration
    logging.basicConfig(
        level=config.log_level.upper(),
        format="%(name)s | %(message)s",
        datefmt="[%X]",
        handlers=[handler],
    )

    # Set specific log levels for known loggers
    logging.getLogger("backend.db").setLevel(config.log_level_db.upper())
    logging.getLogger("asyncio").setLevel(config.log_level_uvicorn.upper())
    logging.getLogger("sqlalchemy.engine.Engine").setLevel(config.log_level_orm.upper())
    logging.getLogger("watchfiles.main").setLevel(config.log_level_watcher.upper())
    logging.getLogger("python_multipart.multipart").setLevel(
        config.log_level_other.upper()
    )


def get_uvicorn_log_config():
    """
    Rewrites the default uvicorn logging configuration:

    - Removes default uvicorn handlers
    - Enables propagation to the root logger

    This allows uvicorn logs to be handled by the custom RichHandler.
    """

    log_config = uvicorn_config.LOGGING_CONFIG

    for name in ["uvicorn", "uvicorn.error", "uvicorn.access"]:
        log_config["loggers"][name]["handlers"] = []
        log_config["loggers"][name]["level"] = config.log_level_uvicorn.upper()
        log_config["loggers"][name]["propagate"] = True

    return log_config
