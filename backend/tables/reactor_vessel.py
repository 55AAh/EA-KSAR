from typing import TYPE_CHECKING
from sqlalchemy import Integer, Identity, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.tables.base import BaseTable


if TYPE_CHECKING:
    from .unit import NppUnitTable
    from .sector import ReactorVesselSectorTable
    from .coupon_complect import CouponComplectTable


class ReactorVesselTable(BaseTable):
    __tablename__ = "T_NPU_RCT_VESSELS"
    __table_args__ = {
        "comment": "Корпус реактора",
    }

    vessel_id: Mapped[int] = mapped_column(
        Integer,
        Identity(),
        primary_key=True,
        comment="ID корпусу реактора",
    )
    unit_id: Mapped[int] = mapped_column(
        ForeignKey("T_NPP_UNITS.unit_id"),
        unique=True,
        comment="ID енергоблоку",
    )

    # Relationships
    unit: Mapped["NppUnitTable"] = relationship(
        back_populates=None,
    )
    sectors: Mapped[list["ReactorVesselSectorTable"]] = relationship(
        back_populates="vessel",
        order_by="ReactorVesselSectorTable.sector_number",
    )
    coupon_complects: Mapped[list["CouponComplectTable"]] = relationship(
        back_populates="vessel",
        order_by="CouponComplectTable.name",
    )

    def __repr__(self):
        return f"Reactor Vessel {self.vessel_id} for Unit {self.unit_id}"
