from backend.db import DbSessionDep
from backend.tables import PlacementTable
from .base import search_router


@search_router.get("/placements/", operation_id="get_all_placements")
def get_all_placements(db: DbSessionDep):
    """
    Get the full list of all placements.
    """
    placements = db.query(PlacementTable).order_by(PlacementTable.name).all()
    # Ensure the query uses valid column names for sorting and avoids referencing relationships.

    result = []
    for placement in placements:
        placement_data = {
            "placement_id": placement.placement_id,
            "sector": placement.sector,
            "sector_num": placement.sector_num,
            "name": placement.name,
            "unit_name": placement.unit.name if placement.unit else None,
            "unit_name_eng": placement.unit.name_eng if placement.unit else None,
        }
        result.append(placement_data)

    return result
