from sqlalchemy import String, Integer, Identity
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.tables.base import BaseTable


class NppTable(BaseTable):
    __tablename__ = "T_NPPS"
    __table_args__ = {
        "comment": "Атомна електростанція",
    }

    plant_id: Mapped[int] = mapped_column(
        Integer, Identity(), primary_key=True, comment="ID АЕС"
    )
    sh_name: Mapped[str] = mapped_column(
        String(10), nullable=False, comment="Позначення АЕС"
    )
    name: Mapped[str] = mapped_column(
        String(50), nullable=False, comment="Найменування АЕС"
    )
    sh_name_eng: Mapped[str] = mapped_column(
        String(10), nullable=False, comment="Позначення АЕС (англ.)"
    )
    name_eng: Mapped[str] = mapped_column(
        String(50), nullable=False, comment="Найменування АЕС (англ.)"
    )

    # Relationships
    units = relationship(
        "NppUnitTable", back_populates="plant", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"{self.sh_name}"
