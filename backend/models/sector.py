from typing import TYPE_CHECKING, Optional
from pydantic import BaseModel, field_serializer

if TYPE_CHECKING:
    from .placement import PlacementModel


class ReactorVesselSectorModel(BaseModel):
    rpv_sector_id: int
    vessel_id: int
    sector_number: int
    placements: Optional[list["PlacementModel"]] = None

    @field_serializer("placements", mode="wrap")
    def serialize_placements(self, value, handler):
        if value is None:
            return None
        serialized = handler(value)
        return sorted(serialized, key=lambda p: p["num_in_sector"])
