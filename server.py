#!/usr/bin/env -S uv run

import logging
import typer
import uvicorn
from typing_extensions import Annotated
from pwdlib import PasswordHash
from sqlalchemy import select, update

from backend.logger import setup_logging, get_uvicorn_log_config
from backend.config import config
from backend.db import Db, DbSessionContext
from backend.tables.base import BaseTable
from backend.tables.user import UserTable


setup_logging()
logger = logging.getLogger(__name__)

app = typer.Typer(
    name="ksar",
    help="KSAR - Комплексна система аналізу результатів випробувань зразків-свідків та ресурсу корпусів реакторів",
    no_args_is_help=False,
)


@app.callback(invoke_without_command=True)
def main(
    ctx: typer.Context,
    host: Annotated[str | None, typer.Option(help="Host to run the server on")] = None,
    port: Annotated[int | None, typer.Option(help="Port to run the server on")] = None,
    reload: Annotated[bool | None, typer.Option(help="Enable auto-reload")] = None,
):
    """
    KSAR - Комплексна система аналізу результатів випробувань зразків-свідків та ресурсу корпусів реакторів
    
    By default, runs the FastAPI server. Use subcommands for other operations.
    """
    if ctx.invoked_subcommand is None:
        # No subcommand was invoked, run the server
        run_server(host, port, reload)


def run_server(
    host: str | None = None,
    port: int | None = None,
    reload: bool | None = None,
):
    """Run the FastAPI server with uvicorn."""
    typer.echo("Starting KSAR server...")

    # Use provided values or fall back to config defaults
    server_host = (
        host if host is not None else ("127.0.0.1" if config.server_dev else "0.0.0.0")
    )
    server_port = port if port is not None else config.server_port
    server_reload = reload if reload is not None else config.server_dev

    uvicorn.run(
        "backend.app:app",
        host=server_host,
        port=server_port,
        reload=server_reload,
        log_config=get_uvicorn_log_config(),
    )


@app.command()
def run(
    host: Annotated[str | None, typer.Option(help="Host to run the server on")] = None,
    port: Annotated[int | None, typer.Option(help="Port to run the server on")] = None,
    reload: Annotated[bool | None, typer.Option(help="Enable auto-reload")] = None,
):
    """Run the FastAPI server with uvicorn."""
    run_server(host, port, reload)


@app.command()
def create_tables():
    """Create all database tables using SQLAlchemy Base.metadata.create_all."""
    typer.echo("Creating database tables...")

    try:
        # Connect to the database
        Db.connect()

        # Ensure the engine is available
        if Db.engine is None:
            raise RuntimeError("Database engine not initialized")

        # Create all tables
        BaseTable.metadata.create_all(bind=Db.engine)

        typer.echo("✅ Database tables created successfully!")
        logger.info("Database tables created successfully")

    except Exception as e:
        typer.echo(f"❌ Error creating tables: {e}", err=True)
        logger.error("Error creating tables: %s", e)
        raise typer.Exit(code=1)


@app.command()
def reset_password(
    username: Annotated[
        str, typer.Argument(help="Username of the user to reset password for")
    ],
    new_password: Annotated[
        str | None,
        typer.Option(
            "--password",
            "-p",
            help="New password for the user (leave empty to set NULL)",
        ),
    ] = None,
):
    """Reset password for a given user."""
    typer.echo(f"Resetting password for user: {username}")

    # If no password provided, prompt for it using typer's built-in functionality
    if new_password is None:
        new_password = typer.prompt(
            "Enter new password (press Enter for empty/NULL)",
            hide_input=True,
            confirmation_prompt=True,
            default="",
        )

    try:
        # Connect to the database
        Db.connect()

        # Initialize password hasher (only if we have a password)
        password_hash = None
        if new_password:
            pwd_context = PasswordHash.recommended()
            password_hash = pwd_context.hash(new_password)

        with DbSessionContext() as session:
            # Find the user
            stmt = select(UserTable).where(UserTable.username == username)
            result = session.execute(stmt)
            user = result.scalar_one_or_none()

            if user is None:
                typer.echo(f"❌ User '{username}' not found!", err=True)
                raise typer.Exit(code=1)

            # Update the user's password (can be NULL)
            update_stmt = (
                update(UserTable)
                .where(UserTable.username == username)
                .values(password_hash=password_hash)
            )
            session.execute(update_stmt)
            session.commit()

            if password_hash:
                typer.echo(f"✅ Password successfully reset for user '{username}'!")
                logger.info("Password reset successfully for user: %s", username)
            else:
                typer.echo(f"✅ Password cleared (set to NULL) for user '{username}'!")
                logger.info("Password cleared for user: %s", username)

    except Exception as e:
        typer.echo(f"❌ Error resetting password: {e}", err=True)
        logger.error("Error resetting password for user %s: %s", username, e)
        raise typer.Exit(code=1)


if __name__ == "__main__":
    app()
