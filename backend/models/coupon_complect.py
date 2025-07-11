from typing import TYPE_CHECKING, Optional
from pydantic import BaseModel, field_serializer

if TYPE_CHECKING:
    from .container_sys import ContainerSysModel


class CouponComplectModel(BaseModel):
    coupon_complect_id: int
    vessel_id: int
    name: str
    complect_number: Optional[int] = None
    is_additional: bool
    container_systems: Optional[list["ContainerSysModel"]] = None

    @field_serializer("container_systems", mode="wrap")
    def serialize_container_systems(self, value, handler):
        if value is None:
            return None
        serialized = handler(value)
        return sorted(serialized, key=lambda cs: cs["name"])
