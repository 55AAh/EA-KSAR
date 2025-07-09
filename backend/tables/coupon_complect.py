from typing import TYPE_CHECKING
from sqlalchemy import Boolean, String, Integer, Identity, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.tables.base import BaseTable


if TYPE_CHECKING:
    from .reactor_vessel import ReactorVesselTable
    from .container_sys import ContainerSysTable


class CouponComplectTable(BaseTable):
    __tablename__ = "T_COUPON_COMPLECTS"
    __table_args__ = {
        "comment": "Комплект зразків-свідків",
    }

    coupon_complect_id: Mapped[int] = mapped_column(
        Integer,
        Identity(),
        primary_key=True,
        comment="ID комплекту",
    )
    vessel_id: Mapped[int] = mapped_column(
        ForeignKey("T_NPU_RCT_VESSELS.vessel_id"),
        comment="ID корпусу реактора",
    )
    name: Mapped[str] = mapped_column(
        String(3),
        comment="Позначення комплекту",
    )
    complect_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="Порядковий номер комплекту",
    )
    is_additional: Mapped[bool] = mapped_column(
        Boolean(create_constraint=True),
        default=True,
        server_default="0",
        comment="Чи є додатковим",
    )

    # Relationships
    vessel: Mapped["ReactorVesselTable"] = relationship(
        back_populates="coupon_complects",
    )
    container_systems: Mapped[list["ContainerSysTable"]] = relationship(
        back_populates="coupon_complect",
        order_by="ContainerSysTable.name",
    )

    def __repr__(self):
        return f"{self.name}"
