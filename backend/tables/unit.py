from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, Identity, ForeignKey, Numeric, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.tables.base import BaseTable


if TYPE_CHECKING:
    from .plant import NppTable
    from .reactor_vessel import ReactorVesselTable


class NppUnitTable(BaseTable):
    __tablename__ = "T_NPP_UNITS"
    __table_args__ = {
        "comment": "Енергоблок АЕС",
    }

    unit_id: Mapped[int] = mapped_column(
        Integer,
        Identity(),
        primary_key=True,
        comment="ID блоку",
    )
    plant_id: Mapped[int] = mapped_column(
        ForeignKey("T_NPPS.plant_id"),
        comment="ID АЕС",
    )
    num: Mapped[int] = mapped_column(
        Numeric(1),
        comment="Номер блоку",
    )
    name: Mapped[str] = mapped_column(
        String(30),
        comment="Найменування блоку",
    )
    name_eng: Mapped[str] = mapped_column(
        String(30),
        comment="Найменування блоку (англ.)",
    )
    design: Mapped[str] = mapped_column(
        String(30),
        comment="Проект",
    )
    stage: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        comment="Черга",
    )
    power: Mapped[int] = mapped_column(
        Numeric(6, 2),
        comment="Встановлена потужність, МВт",
    )
    start_date: Mapped[datetime | None] = mapped_column(
        Date,
        nullable=True,
        comment="Дата початку експлуатації",
    )

    # Relationships
    plant: Mapped["NppTable"] = relationship(
        back_populates="units",
    )
    reactor_vessel: Mapped["ReactorVesselTable"] = relationship(
        back_populates="unit",
    )

    def __repr__(self):
        return f"{self.name}"
