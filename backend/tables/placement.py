from datetime import datetime

from sqlalchemy import String, Integer, Identity, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.tables.base import BaseTable


class PlacementTable(BaseTable):
    __tablename__ = "T_CSS_PLACEMENTS"
    __table_args__ = {
        "comment": "Місце встановлення контейнерної збірки",
    }

    placement_id: Mapped[int] = mapped_column(
        Integer, Identity(), primary_key=True, comment="ID місця встановлення КЗ"
    )
    unit_id: Mapped[int] = mapped_column(
        ForeignKey("T_NPP_UNITS.unit_id"), nullable=False, comment="ID блоку"
    )
    sector: Mapped[int] = mapped_column(Numeric(1), nullable=False, comment="№ сектору")
    sector_num: Mapped[int] = mapped_column(
        Numeric(1), nullable=False, comment="№ місця в секторі"
    )
    name: Mapped[str] = mapped_column(
        String(3), nullable=False, comment="Технологічне позначення"
    )

    # Relationships
    unit = relationship("NppUnitTable", back_populates="placements")
    coupon_loads = relationship("CouponLoadTable", back_populates="irrad_placement")

    def __repr__(self):
        return f"{self.unit.name}-{self.name}" if self.unit else f"{self.name}"
