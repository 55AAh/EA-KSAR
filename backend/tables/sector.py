from typing import TYPE_CHECKING
from sqlalchemy import Integer, Identity, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.tables.base import BaseTable


if TYPE_CHECKING:
    from .reactor_vessel import ReactorVesselTable
    from .placement import PlacementTable


class ReactorVesselSectorTable(BaseTable):
    __tablename__ = "T_RCT_VESSEL_SECTORS"
    __table_args__ = {
        "comment": "Сектор КР",
    }

    rpv_sector_id: Mapped[int] = mapped_column(
        Integer,
        Identity(),
        primary_key=True,
        comment="ID сектора",
    )
    vessel_id: Mapped[int] = mapped_column(
        ForeignKey("T_NPU_RCT_VESSELS.vessel_id"),
        comment="ID корпусу реактора",
    )
    sector_number: Mapped[int] = mapped_column(
        Integer,
        comment="№ сектору",
    )

    # Relationships
    vessel: Mapped["ReactorVesselTable"] = relationship(
        back_populates="sectors",
    )
    placements: Mapped[list["PlacementTable"]] = relationship(
        back_populates="sector",
        order_by="PlacementTable.num_in_sector",
    )

    def __repr__(self):
        return f"Sector {self.sector_number} (ID: {self.rpv_sector_id})"
