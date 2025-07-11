from datetime import date
from typing import TYPE_CHECKING, Optional
from pydantic import BaseModel


if TYPE_CHECKING:
    from .reactor_vessel import ReactorVesselModel


class UnitModel(BaseModel):
    unit_id: int
    plant_id: int
    num: int
    name: str
    name_eng: str
    design: str
    stage: str | None = None
    power: int
    start_date: date | None = None
    reactor_vessel: Optional["ReactorVesselModel"] = None
