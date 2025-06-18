import secrets

from pydantic import SecretStr, Field
from pydantic_settings import BaseSettings


class Config(BaseSettings):
    """
    A class to manage application configuration.
    Reads from the ``.env`` file & from environment variables.
    """

    # Server configuration
    server_dev: bool = False  # Development mode
    server_port: int = 8000  # Port for the server to listen on

    # Database configuration
    db_drivername: str = "oracle+oracledb"
    db_host: str = "localhost"  # Database ip address
    db_port: int = 1521
    db_service_name: str = "KSAR_PDB"  # Database/service name
    db_user: str = "ksar"
    db_pass: SecretStr = SecretStr("ksar")

    auth_jwt_secret_key: SecretStr = Field(
        default_factory=lambda: SecretStr(secrets.token_hex(32))
    )
    auth_session_expire_seconds: int = 2592000  # 30 days

    # Logging configuration
    log_level: str = "INFO"
    log_level_db: str = "INFO"
    log_level_uvicorn: str = "INFO"
    log_level_watcher: str = "WARNING"
    log_level_orm: str = "WARNING"
    log_level_other: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


config = Config()
