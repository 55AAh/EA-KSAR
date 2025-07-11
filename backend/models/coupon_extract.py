from pydantic import BaseModel


class CouponExtractModel(BaseModel):
    cpn_extract_id: int
    cpn_load_id: int
    extract_date: str
    irrad_container_sys_id: int
