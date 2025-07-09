from sqlalchemy import Boolean
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.compiler import compiles


class BaseTable(DeclarativeBase):
    """Base class for all SQLAlchemy tables."""


class OracleBoolean(Boolean):
    pass


@compiles(OracleBoolean, "oracle")
def compile_oracle_boolean(*_a, **_kw):
    return "NUMBER(1)"
