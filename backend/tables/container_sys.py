from sqlalchemy import String, Integer, Identity, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.tables.base import BaseTable


class ContainerSysTable(BaseTable):
    __tablename__ = "T_CPN_CONTAINER_SYS"
    __table_args__ = {
        "comment": "Контейнерна збірка ЗС",
    }

    container_sys_id: Mapped[int] = mapped_column(
        Integer, Identity(), primary_key=True, comment="ID контейнерної збірки"
    )
    coupon_complect_id: Mapped[int | None] = mapped_column(
        ForeignKey("T_COUPON_COMPLECTS.coupon_complect_id"),
        nullable=True,
        comment="ID комплекту зразків-свідків",
    )
    name: Mapped[str] = mapped_column(
        String(3), nullable=False, comment="Індекс контейнерної збірки"
    )

    # Relationships
    coupon_complect = relationship(
        "CouponComplectTable", back_populates="container_systems"
    )
    coupon_loads = relationship("CouponLoadTable", back_populates="irrad_container_sys")
    coupon_extracts = relationship(
        "CouponExtractTable", back_populates="irrad_container_sys"
    )

    def __repr__(self):
        return f"{self.name}"
