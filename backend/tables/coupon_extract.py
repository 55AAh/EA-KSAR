from typing import TYPE_CHECKING
from sqlalchemy import Integer, Identity, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.tables.base import BaseTable


if TYPE_CHECKING:
    from .coupon_load import CouponLoadTable
    from .container_sys import ContainerSysTable


class CouponExtractTable(BaseTable):
    __tablename__ = "T_CPN_EXTRACTS"
    __table_args__ = {
        "comment": "Вивантаження ЗС",
    }

    cpn_extract_id: Mapped[int] = mapped_column(
        Integer,
        Identity(),
        primary_key=True,
        comment="ID вивантаження ЗС",
    )
    cpn_load_id: Mapped[int] = mapped_column(
        ForeignKey("T_CPN_LOADS.cpn_load_id"),
        comment="ID завантаження ЗС",
    )
    extract_date: Mapped[str] = mapped_column(
        String(15),
        nullable=True,
        comment="Дата вивантаження",
    )
    irrad_container_sys_id: Mapped[int] = mapped_column(
        ForeignKey("T_CPN_CONTAINER_SYS.container_sys_id"),
        comment="ID опромінюваної КЗ",
    )

    # Relationships
    coupon_load: Mapped["CouponLoadTable"] = relationship(
        back_populates="coupon_extract",
    )
    irrad_container_sys: Mapped["ContainerSysTable"] = relationship(
        back_populates="coupon_extracts",
    )

    def __repr__(self):
        return (
            f"Extraction of {self.irrad_container_sys.name}"
            if self.irrad_container_sys
            else f"Extraction {self.cpn_extract_id}"
        )
