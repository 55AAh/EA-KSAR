from typing import TYPE_CHECKING, Optional
from pydantic import BaseModel

if TYPE_CHECKING:
    from .coupon_extract import CouponExtractModel


class CouponLoadModel(BaseModel):
    cpn_load_id: int
    load_date: str
    irrad_container_sys_id: int
    irrad_placement_id: int
    coupon_extract: Optional["CouponExtractModel"] = None
