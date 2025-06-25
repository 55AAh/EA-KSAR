from backend.db import DbSessionDep
from backend.tables import NppUnitTable, NppTable
from .base import search_router


@search_router.get("/units/", operation_id="get_all_units")
def get_all_units(db: DbSessionDep):
    """
    Get the full list of all units with their plant information.
    """
    # Query units with their associated plant data
    units = (
        db.query(NppUnitTable)
        .join(NppTable, NppUnitTable.plant_id == NppTable.plant_id)
        .all()
    )

    result = []
    for unit in units:
        unit_data = {
            "num": unit.num,
            "name": unit.name,
            "name_eng": unit.name_eng,
            "design": unit.design,
            "stage": unit.stage,
            "power": unit.power,
            "start_date": unit.start_date.isoformat() if unit.start_date else None,
            # Plant information
            "plant_name": unit.plant.name,
            "plant_sh_name": unit.plant.sh_name,
            "plant_name_eng": unit.plant.name_eng,
            "plant_sh_name_eng": unit.plant.sh_name_eng,
        }
        result.append(unit_data)

    return result
