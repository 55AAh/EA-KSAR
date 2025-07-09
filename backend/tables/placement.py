from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, Identity, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.tables.base import BaseTable


if TYPE_CHECKING:
    from .coupon_load import CouponLoadTable
    from .sector import ReactorVesselSectorTable


class PlacementTable(BaseTable):
    __tablename__ = "T_CSS_PLACEMENTS"
    __table_args__ = {
        "comment": "Місце встановлення контейнерної збірки",
    }

    placement_id: Mapped[int] = mapped_column(
        Integer,
        Identity(),
        primary_key=True,
        comment="ID місця встановлення КЗ",
    )
    sector_id: Mapped[int] = mapped_column(
        ForeignKey("T_RCT_VESSEL_SECTORS.rpv_sector_id"),
        comment="ID сектору",
    )
    num_in_sector: Mapped[int] = mapped_column(
        Numeric(1),
        comment="№ місця в секторі",
    )
    name: Mapped[str] = mapped_column(
        String(3),
        comment="Технологічне позначення",
    )

    # Relationships
    coupon_loads: Mapped[list["CouponLoadTable"]] = relationship(
        back_populates="irrad_placement",
        order_by="CouponLoadTable.load_date",
    )
    sector: Mapped["ReactorVesselSectorTable"] = relationship(
        back_populates="placements",
    )

    def __repr__(self):
        return f"Placement {self.name}"
