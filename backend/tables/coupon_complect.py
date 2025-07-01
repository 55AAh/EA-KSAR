from sqlalchemy import Boolean, String, Integer, Identity, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.tables.base import BaseTable


class CouponComplectTable(BaseTable):
    __tablename__ = "T_COUPON_COMPLECTS"
    __table_args__ = {
        "comment": "Комплект зразків-свідків",
    }

    coupon_complect_id: Mapped[int] = mapped_column(
        Integer, Identity(), primary_key=True, comment="ID комплекту"
    )
    unit_id: Mapped[int] = mapped_column(
        ForeignKey("T_NPP_UNITS.unit_id"), nullable=False, comment="ID блоку"
    )
    name: Mapped[str] = mapped_column(
        String(3), nullable=False, comment="Позначення комплекту"
    )
    is_additional: Mapped[bool] = mapped_column(
        Boolean(create_constraint=True),
        default=True,
        server_default="0",
        comment="Чи є додатковим",
    )

    # Relationships
    unit = relationship("NppUnitTable", back_populates="coupon_complects")
    container_systems = relationship(
        "ContainerSysTable",
        back_populates="coupon_complect",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"{self.name}"
