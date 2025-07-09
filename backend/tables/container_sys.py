from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, Identity, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.tables.base import BaseTable


if TYPE_CHECKING:
    from .coupon_complect import CouponComplectTable
    from .coupon_load import CouponLoadTable
    from .coupon_extract import CouponExtractTable


class ContainerSysTable(BaseTable):
    __tablename__ = "T_CPN_CONTAINER_SYS"
    __table_args__ = {
        "comment": "Контейнерна збірка ЗС",
    }

    container_sys_id: Mapped[int] = mapped_column(
        Integer,
        Identity(),
        primary_key=True,
        comment="ID контейнерної збірки",
    )
    coupon_complect_id: Mapped[int] = mapped_column(
        ForeignKey("T_COUPON_COMPLECTS.coupon_complect_id"),
        comment="ID комплекту зразків-свідків",
    )
    name: Mapped[str] = mapped_column(
        String(3),
        comment="Індекс контейнерної збірки",
    )

    # Relationships
    coupon_complect: Mapped["CouponComplectTable"] = relationship(
        back_populates="container_systems",
    )
    coupon_loads: Mapped[list["CouponLoadTable"]] = relationship(
        back_populates="irrad_container_sys",
        order_by="CouponLoadTable.load_date",
    )
    coupon_extracts: Mapped[list["CouponExtractTable"]] = relationship(
        back_populates="irrad_container_sys",
        order_by="CouponExtractTable.extract_date",
    )

    def __repr__(self):
        return f"{self.name}"
