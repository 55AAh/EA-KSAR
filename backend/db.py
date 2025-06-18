import logging
from contextlib import contextmanager
from typing import Annotated

import sqlalchemy
from fastapi import Depends
from sqlalchemy import orm

from .config import config

logger = logging.getLogger(__name__)


class Db:
    """Manages the database connection and session lifecycle."""

    engine: sqlalchemy.Engine | None = None
    session_maker: orm.sessionmaker[orm.Session] | None = None

    @classmethod
    def connect(cls):
        """
        Initializes the database driver & establishes connection & creates a session factory

        Raises:
            oracledb.exceptions.DatabaseError: in case initialization fails.
            sqlalchemy.exc.DatabaseError: in case connection to the database fails.
        """

        url_template = f"oracle+oracledb://{config.db_user}:%s@{config.db_host}:{config.db_port}/?service_name={config.db_service_name}"
        logger.debug("Connecting to %s", url_template % "****")
        cls.engine = sqlalchemy.create_engine(
            url_template % config.db_pass.get_secret_value(), echo=False
        )  # echo is handled in logger.py
        cls.session_maker = orm.sessionmaker(bind=cls.engine, expire_on_commit=False)

        # Ensuring the connection is working by executing a simple query
        with DbSessionContext() as session:
            stmt = sqlalchemy.select(sqlalchemy.func.now())
            curr_time = session.execute(stmt).scalar()
            logger.debug("DB query reply: current time = %s", curr_time)

        logger.info("DB connected")

    @classmethod
    def get_session(cls):
        """
        This method yields a session from the session maker. The session is
        automatically closed after use.

        If db is not connected, it will attempt to connect first by calling `connect`.

        Yields:
            Session: A SQLAlchemy session object.
        """

        if cls.session_maker is None:
            cls.connect()

        assert cls.session_maker is not None
        session = cls.session_maker()
        try:
            yield session
        finally:
            session.close()


# Dependency for FastAPI routes to inject a database session
DbSessionDep = Annotated[orm.Session, Depends(Db.get_session)]

# Context manager for database sessions
DbSessionContext = contextmanager(Db.get_session)
