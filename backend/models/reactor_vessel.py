from typing import TYPE_CHECKING, Optional
from pydantic import BaseModel, field_serializer

if TYPE_CHECKING:
    from .sector import ReactorVesselSectorModel
    from .coupon_complect import CouponComplectModel


class ReactorVesselModel(BaseModel):
    vessel_id: int
    unit_id: int
    sectors: Optional[list["ReactorVesselSectorModel"]] = None
    coupon_complects: Optional[list["CouponComplectModel"]] = None

    @field_serializer("sectors", mode="wrap")
    def serialize_sectors(self, value, handler):
        if value is None:
            return None
        serialized = handler(value)
        return sorted(serialized, key=lambda s: s["sector_number"])

    @field_serializer("coupon_complects", mode="wrap")
    def serialize_coupon_complects(self, value, handler):
        if value is None:
            return None
        serialized = handler(value)
        return sorted(serialized, key=lambda c: c.get("complect_number") or 0)
