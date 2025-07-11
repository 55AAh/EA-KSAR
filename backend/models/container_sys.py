from pydantic import BaseModel


class ContainerSysModel(BaseModel):
    container_sys_id: int
    coupon_complect_id: int
    name: str
