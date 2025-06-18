from fastapi import APIRouter
from sqlalchemy.orm import joinedload

from backend.db import DbSessionDep
from backend.tables import NppTable

plants_units_router = APIRouter()


@plants_units_router.get("/plants_units", operation_id="get_plants_units")
def plants_units(db: DbSessionDep):
    """
    Get the list of plants and their units.
    """

    plants = db.query(NppTable).options(joinedload(NppTable.units)).all()

    result = []
    for plant in plants:
        plant_data = {
            "name": plant.name,
            "sh_name": plant.sh_name,
            "name_eng": plant.name_eng,
            "sh_name_eng": plant.sh_name_eng,
            "units": [
                {
                    "num": unit.num,
                    "name": unit.name,
                    "name_eng": unit.name_eng,
                    "design": unit.design,
                    "stage": unit.stage,
                    "power": unit.power,
                    "start_date": unit.start_date,
                }
                for unit in sorted(plant.units, key=lambda u: u.num)
            ],
        }
        result.append(plant_data)

    return result
