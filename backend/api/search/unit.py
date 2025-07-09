from backend.db import DbSessionDep
from backend.tables import NppUnitTable, NppTable
from .base import search_router
from typing import Optional
from fastapi import Query


@search_router.get(
    "/units/",
    operation_id="get_all_units",
    summary="Get all units",
    description="Retrieve the full list of all nuclear power plant units, optionally filtered by plant",
)
def get_all_units(
    db: DbSessionDep,
    plant_sh_name: Optional[str] = Query(
        None, description="Filter units by plant short name (e.g., 'ЗАЕС')"
    ),
):
    """
    Get the full list of all units, optionally filtered by plant short name.
    """
    # Base query
    query = db.query(NppUnitTable)

    # Add plant filter if provided
    if plant_sh_name:
        query = query.join(NppTable, NppUnitTable.plant_id == NppTable.plant_id).filter(
            NppTable.sh_name == plant_sh_name
        )

    # Order by plant number and unit number
    query = query.join(NppTable, NppUnitTable.plant_id == NppTable.plant_id).order_by(
        NppTable.num, NppUnitTable.num
    )

    units = query.all()

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
        }
        result.append(unit_data)

    return result
