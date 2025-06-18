from datetime import datetime

from sqlalchemy import String, Integer, Identity, ForeignKey, Date
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
        String(2), nullable=False, comment="Позначення комплекту"
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


class CouponLoadTable(BaseTable):
    __tablename__ = "T_CPN_LOADS"
    __table_args__ = {
        "comment": "Завантаження ЗС",
    }

    cpn_load_id: Mapped[int] = mapped_column(
        Integer, Identity(), primary_key=True, comment="ID завантаження ЗС"
    )
    load_date: Mapped[datetime | None] = mapped_column(
        Date, nullable=True, comment="Дата завантаження"
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
