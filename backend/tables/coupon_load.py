from sqlalchemy import Integer, Identity, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.tables.base import BaseTable


class CouponLoadTable(BaseTable):
    __tablename__ = "T_CPN_LOADS"
    __table_args__ = {
        "comment": "Завантаження ЗС",
    }

    cpn_load_id: Mapped[int] = mapped_column(
        Integer, Identity(), primary_key=True, comment="ID завантаження ЗС"
    )
    load_date: Mapped[str | None] = mapped_column(
        String(15), nullable=True, comment="Дата завантаження"
    )
    irrad_container_sys_id: Mapped[int] = mapped_column(
        ForeignKey("T_CPN_CONTAINER_SYS.container_sys_id"),
        nullable=False,
        comment="ID опромінюваної КЗ",
    )
    irrad_placement_id: Mapped[int] = mapped_column(
        ForeignKey("T_CSS_PLACEMENTS.placement_id"),
        nullable=False,
        comment="ID місця встановлення ОКЗ",
    )

    # Relationships
    irrad_container_sys = relationship(
        "ContainerSysTable", back_populates="coupon_loads"
    )
    irrad_placement = relationship("PlacementTable", back_populates="coupon_loads")

    def __repr__(self):
        return (
            f"{self.irrad_container_sys.name} -> {self.irrad_placement}"
            if self.irrad_container_sys and self.irrad_placement
            else f"Load {self.cpn_load_id}"
        )
