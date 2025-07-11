from pydantic import BaseModel


class PlacementModel(BaseModel):
    placement_id: int
    sector_id: int
    num_in_sector: int
    name: str
