from datetime import datetime
from sqlalchemy import Date, Integer, String, Identity
from sqlalchemy import LargeBinary
from sqlalchemy.orm import Mapped, mapped_column

from backend.tables.base import BaseTable


class DocumentTable(BaseTable):
    __tablename__ = "T_DOCS"
    __table_args__ = {
        "comment": "Документ",
    }

    doc_id: Mapped[int] = mapped_column(
        Integer,
        Identity(),
        primary_key=True,
        comment="ID документа",
    )
    full_name: Mapped[str | None] = mapped_column(
        String(250),
        nullable=True,
        comment="Назва документу",
    )
    code_name: Mapped[str] = mapped_column(String(50), comment="№ (шифр) документу")
    issue_date: Mapped[datetime | None] = mapped_column(
        Date,
        nullable=True,
        comment="Дата введення в дію",
    )
    valid_until_date: Mapped[datetime | None] = mapped_column(
        Date,
        nullable=True,
        comment="Термін дії",
    )

    filename: Mapped[str] = mapped_column(
        String(255),
        comment="Ім'я файлу",
    )
    binary_content: Mapped[bytes] = mapped_column(
        LargeBinary,
        comment="Вміст файлу",
    )
