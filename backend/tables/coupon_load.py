from typing import TYPE_CHECKING
from sqlalchemy import Integer, Identity, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.tables.base import BaseTable


if TYPE_CHECKING:
    from .container_sys import ContainerSysTable
    from .placement import PlacementTable


class CouponLoadTable(BaseTable):
    __tablename__ = "T_CPN_LOADS"
    __table_args__ = {
        "comment": "Завантаження ЗС",
    }

    cpn_load_id: Mapped[int] = mapped_column(
        Integer,
        Identity(),
        primary_key=True,
        comment="ID завантаження ЗС",
    )
    load_date: Mapped[str | None] = mapped_column(
        String(15),
        nullable=True,
        comment="Дата завантаження",
    )
    irrad_container_sys_id: Mapped[int] = mapped_column(
        ForeignKey("T_CPN_CONTAINER_SYS.container_sys_id"),
        comment="ID опромінюваної КЗ",
    )
    irrad_placement_id: Mapped[int] = mapped_column(
        ForeignKey("T_CSS_PLACEMENTS.placement_id"),
        comment="ID місця встановлення ОКЗ",
    )

    # Relationships
    irrad_container_sys: Mapped["ContainerSysTable"] = relationship(
        back_populates="coupon_loads",
    )
    irrad_placement: Mapped["PlacementTable"] = relationship(
        back_populates="coupon_loads",
    )

    def __repr__(self):
        return (
            f"Load {self.irrad_container_sys.name} -> {self.irrad_placement}"
            if self.irrad_container_sys and self.irrad_placement
            else f"Load {self.cpn_load_id}"
        )
