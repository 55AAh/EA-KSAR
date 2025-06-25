from backend.db import DbSessionDep
from backend.tables import NppTable
from .base import search_router


@search_router.get("/plants/", operation_id="get_all_plants")
def get_all_plants(db: DbSessionDep):
    """
    Get the full list of all plants.
    """
    plants = db.query(NppTable).all()

    result = []
    for plant in plants:
        plant_data = {
            "plant_id": plant.plant_id,
            "name": plant.name,
            "sh_name": plant.sh_name,
            "name_eng": plant.name_eng,
            "sh_name_eng": plant.sh_name_eng,
        }
        result.append(plant_data)

    return result
