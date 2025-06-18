from datetime import datetime

from sqlalchemy import Integer, Identity, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.tables.base import BaseTable


class CouponExtractTable(BaseTable):
    __tablename__ = "T_CPN_EXTRACTS"
    __table_args__ = {
        "comment": "Вивантаження ЗС",
    }

    cpn_extract_id: Mapped[int] = mapped_column(
        Integer, Identity(), primary_key=True, comment="ID вивантаження ЗС"
    )
    extract_date: Mapped[datetime | None] = mapped_column(
        Date, nullable=True, comment="Дата вивантаження"
    )
    irrad_container_sys_id: Mapped[int] = mapped_column(
        ForeignKey("T_CPN_CONTAINER_SYS.container_sys_id"),
        nullable=False,
        comment="ID опромінюваної КЗ",
    )

    # Relationships
    irrad_container_sys = relationship(
        "ContainerSysTable", back_populates="coupon_extracts"
    )

    def __repr__(self):
        return (
            f"{self.irrad_container_sys.name}"
            if self.irrad_container_sys
            else f"Extract {self.cpn_extract_id}"
        )
