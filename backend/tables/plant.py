from typing import TYPE_CHECKING
from sqlalchemy import Numeric, String, Integer, Identity
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.tables.base import BaseTable


if TYPE_CHECKING:
    from .unit import NppUnitTable


class NppTable(BaseTable):
    __tablename__ = "T_NPPS"
    __table_args__ = {
        "comment": "Атомна електростанція",
    }

    plant_id: Mapped[int] = mapped_column(
        Integer,
        Identity(),
        primary_key=True,
        comment="ID АЕС",
    )
    num: Mapped[int] = mapped_column(
        Numeric(1),
        comment="Номер АЕС",
    )
    sh_name: Mapped[str] = mapped_column(
        String(10),
        comment="Позначення АЕС",
    )
    name: Mapped[str] = mapped_column(
        String(50),
        comment="Найменування АЕС",
    )
    descr: Mapped[str | None] = mapped_column(
        String(2000),
        nullable=True,
        comment="Опис АЕС",
    )
    sh_name_eng: Mapped[str] = mapped_column(
        String(10),
        comment="Позначення АЕС (англ.)",
    )
    name_eng: Mapped[str] = mapped_column(
        String(50),
        comment="Найменування АЕС (англ.)",
    )

    # Relationships
    units: Mapped[list["NppUnitTable"]] = relationship(
        back_populates="plant",
        order_by="NppUnitTable.num",
    )

    def __repr__(self):
        return f"{self.sh_name}"
