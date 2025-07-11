# Import all models from their individual files
from .unit import UnitModel
from .reactor_vessel import ReactorVesselModel
from .sector import ReactorVesselSectorModel
from .placement import PlacementModel
from .coupon_complect import CouponComplectModel
from .container_sys import ContainerSysModel
from .coupon_load import CouponLoadModel
from .coupon_extract import CouponExtractModel

__all__ = [
    "UnitModel",
    "ReactorVesselModel",
    "ReactorVesselSectorModel",
    "PlacementModel",
    "CouponComplectModel",
    "ContainerSysModel",
    "CouponLoadModel",
    "CouponExtractModel",
]

# Rebuild models to resolve forward references after all imports
UnitModel.model_rebuild()
ReactorVesselModel.model_rebuild()
ReactorVesselSectorModel.model_rebuild()
CouponComplectModel.model_rebuild()
CouponLoadModel.model_rebuild()
