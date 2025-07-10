from typing import List, Union
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import joinedload, aliased, selectinload
from backend.db import DbSessionDep
from backend.tables import (
    NppUnitTable,
    PlacementTable,
    CouponLoadTable,
    CouponExtractTable,
    ContainerSysTable,
    ReactorVesselSectorTable,
    CouponComplectTable,
    ReactorVesselTable,
)

unit_router = APIRouter()


placements_coords = {
    1: {
        1: (5377, 2432),
        2: (5313, 2194),
        3: (5120, 1775),
        4: (4853, 1399),
        5: (4678, 1225),
    },
    2: {
        1: (3696, 658),
        2: (3459, 595),
        3: (2999, 552),
        4: (2539, 595),
        5: (2303, 658)
    },
    3: {
        1: (1320, 1225),
        2: (1146, 1399),
        3: (879, 1775),
        4: (687, 2194),
        5: (623, 2432),
    },
    4: {
        1: (623, 3566),
        2: (687, 3805),
        3: (879, 4223),
        4: (1146, 4599),
        5: (1320, 4773),
    },
    5: {
        1: (2303, 5341),
        2: (2539, 5404),
        3: (2999, 5448),
        4: (3459, 5404),
        5: (3696, 5341),
    },
    6: {
        1: (4678, 4773),
        2: (4853, 4599),
        3: (5120, 4223),
        4: (5313, 3805),
        5: (5377, 3566),
    },
}  # fmt: skip


placement_text_coords = {
    1: {
        1: (5712, 2376),
        2: (5642, 2114),
        3: (5431, 1653),
        4: (5137, 1240),
        5: (4946, 1048),
    },
    2: {
        1: (3810, 425),
        2: (3470, 355),
        3: (3015, 317),
        4: (2540, 355),
        5: (2210, 425)
    },
    3: {
        1: (1103, 1048),
        2: (912, 1240),
        3: (618, 1653),
        4: (407, 2114),
        5: (337, 2376),
    },
    4: {
        1: (337, 3623),
        2: (407, 3885),
        3: (618, 4346),
        4: (912, 4759),
        5: (1103, 4951),
    },
    5: {
        1: (2210, 5574),
        2: (2540, 5646),
        3: (3015, 5693),
        4: (3470, 5645),
        5: (3810, 5574),
    },
    6: {
        1: (4946, 4951),
        2: (5137, 4759),
        3: (5431, 4346),
        4: (5642, 3885),
        5: (5712, 3623),
    },
}  # fmt: skip


@unit_router.get("/unit2/{name_eng}", operation_id="get_unit2")
def unit_detail2(name_eng: str, db: DbSessionDep) -> dict:
    """
    Get specific unit by name_eng with complete placement and complects data.
    """

    print("loading unit:")

    unit = (
        db.query(NppUnitTable)
        .options(
            joinedload(NppUnitTable.reactor_vessel)
            .joinedload(ReactorVesselTable.sectors)
            .joinedload(ReactorVesselSectorTable.placements),
            joinedload(NppUnitTable.reactor_vessel)
            .joinedload(ReactorVesselTable.coupon_complects)
            .joinedload(CouponComplectTable.container_systems),
        )
        .filter(NppUnitTable.name_eng == name_eng)
        .first()
    )

    if unit is None:
        raise HTTPException(status_code=404, detail="Unit not found")

    print("loading loads:")

    loads = (
        db.query(CouponLoadTable)
        .options(joinedload(CouponLoadTable.coupon_extract))
        .join(CouponLoadTable.irrad_container_sys)
        .join(ContainerSysTable.coupon_complect)
        .join(CouponComplectTable.vessel)
        .order_by(
            CouponLoadTable.load_date, ContainerSysTable.container_sys_id
        )  # ordering is crucial for correct history calculation
        .filter(CouponComplectTable.vessel_id == unit.reactor_vessel.vessel_id)
        .all()
    )

    print("collecting data:")

    cs_load_ids: dict[int, list[int]] = {}
    p_load_ids: dict[int, list[int]] = {}

    for complect in unit.reactor_vessel.coupon_complects:
        for cs in complect.container_systems:
            cs_load_ids[cs.container_sys_id] = []

    for sector in unit.reactor_vessel.sectors:
        for placement in sector.placements:
            p_load_ids[placement.placement_id] = []

    for load in loads:
        if load.coupon_extract is not None:
            assert (
                load.coupon_extract.irrad_container_sys_id
                == load.irrad_container_sys_id
            ), "Coupon load and extract must refer to the same container system"

        assert load.irrad_container_sys_id in cs_load_ids, (
            f"Container system {load.irrad_container_sys_id} not found in complects for unit {unit.name_eng}"
        )

        cs_load_ids[load.irrad_container_sys_id].append(load.cpn_load_id)

        assert load.irrad_placement_id in p_load_ids, (
            f"Placement {load.irrad_placement_id} not found in unit {unit.name_eng}"
        )

        p_load_ids[load.irrad_placement_id].append(load.cpn_load_id)

    return {
        "unit": {
            "unit_id": unit.unit_id,
            "plant_id": unit.plant_id,
            "num": unit.num,
            "name": unit.name,
            "name_eng": unit.name_eng,
            "design": unit.design,
            "stage": unit.stage,
            "power": unit.power,
            "start_date": unit.start_date,
            "reactor_vessel": {
                "vessel_id": unit.reactor_vessel.vessel_id,
                "unit_id": unit.reactor_vessel.unit_id,
                "sectors": [
                    {
                        "rpv_sector_id": sector.rpv_sector_id,
                        "sector_number": sector.sector_number,
                        "placements": [
                            {
                                "placement_id": placement.placement_id,
                                "name": placement.name,
                                "num_in_sector": placement.num_in_sector,
                                "coords": placements_coords[sector.sector_number][
                                    placement.num_in_sector
                                ],
                                "coords_text": placement_text_coords[
                                    sector.sector_number
                                ][placement.num_in_sector],
                            }
                            for placement in sector.placements
                        ],
                    }
                    for sector in unit.reactor_vessel.sectors
                ],
            },
        },
        "cs_load_ids": cs_load_ids,
        "p_load_ids": p_load_ids,
    }


@unit_router.get("/unit/{name_eng}", operation_id="get_unit")
def unit_detail(name_eng: str, db: DbSessionDep):
    """
    Get specific unit by name_eng with complete placement and complects data.
    """

    # Get unit by name_eng with eager loading
    unit = (
        db.query(NppUnitTable)
        .options(
            joinedload(NppUnitTable.plant),
            joinedload(NppUnitTable.reactor_vessel)
            .joinedload(ReactorVesselTable.sectors)
            .joinedload(ReactorVesselSectorTable.placements),
            joinedload(NppUnitTable.reactor_vessel)
            .joinedload(ReactorVesselTable.coupon_complects)
            .joinedload(CouponComplectTable.container_systems),
        )
        .filter(NppUnitTable.name_eng == name_eng)
        .first()
    )

    if unit is None:
        raise HTTPException(status_code=404, detail="Unit not found")

    # Ensure plant is loaded
    if unit.plant is None:
        raise HTTPException(status_code=500, detail="Unit plant data is missing")

    # Ensure reactor vessel is loaded
    if unit.reactor_vessel is None:
        raise HTTPException(
            status_code=500, detail="Unit reactor vessel data is missing"
        )

    # Get all coupon loads related to this unit with eager loading
    ReactorVesselTableAliased = aliased(ReactorVesselTable)
    # loads = (
    #     db.query(CouponLoadTable)
    #     .join(
    #         PlacementTable,
    #         PlacementTable.placement_id == CouponLoadTable.irrad_placement_id,
    #     )
    #     .join(
    #         ReactorVesselSectorTable,
    #         ReactorVesselSectorTable.rpv_sector_id == PlacementTable.sector_id,
    #     )
    #     .join(
    #         ReactorVesselTable,
    #         ReactorVesselTable.vessel_id == ReactorVesselSectorTable.vessel_id,
    #     )
    #     .join(
    #         ContainerSysTable,
    #         ContainerSysTable.container_sys_id
    #         == CouponLoadTable.irrad_container_sys_id,
    #     )
    #     .join(
    #         CouponComplectTable,
    #         CouponComplectTable.coupon_complect_id
    #         == ContainerSysTable.coupon_complect_id,
    #     )
    #     .join(
    #         ReactorVesselTableAliased,
    #         ReactorVesselTableAliased.vessel_id == CouponComplectTable.vessel_id,
    #     )
    #     .filter(
    #         (ReactorVesselTable.vessel_id == unit.reactor_vessel.vessel_id)
    #         | (ReactorVesselTableAliased.vessel_id == unit.reactor_vessel.vessel_id)
    #     )
    #     .options(
    #         joinedload(CouponLoadTable.irrad_container_sys).joinedload(
    #             ContainerSysTable.coupon_complect
    #         ),
    #         joinedload(CouponLoadTable.irrad_placement).joinedload(
    #             PlacementTable.sector
    #         ),
    #         joinedload(CouponLoadTable.irrad_container_sys).joinedload(
    #             ContainerSysTable.coupon_extracts
    #         ),
    #     )
    #     .order_by(
    #         CouponLoadTable.load_date,
    #         ReactorVesselSectorTable.sector_number,
    #         PlacementTable.num_in_sector,
    #         CouponComplectTable.complect_number,
    #         ContainerSysTable.name,
    #     )
    #     .all()
    # )

    def process_placement(placement: PlacementTable):
        loads = []

        occupied = False
        last_sys_name = None
        for load in placement.coupon_loads:
            if occupied:
                raise ValueError("Placement already occupied")
            occupied = True
            last_sys_name = load.irrad_container_sys.name
            load_date = load.load_date
            extract_date = None

            extracts = load.irrad_container_sys.coupon_extracts
            if extracts:
                if len(extracts) > 1:
                    raise NotImplementedError(
                        "Container system cannot be extracted twice, they should be treated as a separate entities (one became another via modernization)"
                    )
                extract_date = extracts[0].extract_date
                occupied = False

            loads.append(
                {
                    "container_sys_name": load.irrad_container_sys.name,
                    "load_date": load_date,
                    "extract_date": extract_date,
                }
            )

        return {
            "placement_id": placement.placement_id,
            "sector_id": placement.sector_id,
            "num_in_sector": placement.num_in_sector,
            "name": placement.name,
            "loads": loads,
            "occupied": occupied,
            "last_sys_name": last_sys_name,
            "coords": placements_coords.get(placement.sector.sector_number, {}).get(
                placement.num_in_sector
            ),
            "text_coords": placement_text_coords.get(
                placement.sector.sector_number, {}
            ).get(placement.num_in_sector),
        }

    def process_container_sys(container_sys: ContainerSysTable):
        loads = container_sys.coupon_loads
        if len(loads) > 1:
            raise NotImplementedError(
                "Container system cannot be loaded twice, they should be treated as a separate entities (one became another via modernization)"
            )

        extracts = container_sys.coupon_extracts
        if len(extracts) > 1:
            raise NotImplementedError(
                "Container system cannot be extracted twice, they should be treated as a separate entities (one became another via modernization)"
            )

        load = loads[0] if loads else None
        extract = extracts[0] if extracts else None

        if load is not None:
            if load.irrad_placement.sector.vessel != unit.reactor_vessel:
                # non-native container systems should probably be shown alongside native
                raise NotImplementedError(
                    "Non-native container systems are not implemented yet"
                )

            load_status = {
                "cpn_load_id": load.cpn_load_id,
                "load_date": load.load_date,
                "irrad_placement": {
                    "placement_id": load.irrad_placement.placement_id,
                    "name": load.irrad_placement.name,
                },
                "extract": {
                    "cpn_extract_id": extract.cpn_extract_id,
                    "extract_date": extract.extract_date,
                }
                if extract
                else None,
            }
        else:
            if extract is not None:
                raise NotImplementedError(
                    "Container system cannot be extracted without being loaded first"
                )
            load_status = None

        return {
            "container_sys_id": container_sys.container_sys_id,
            "name": container_sys.name,
            "load_status": load_status,
        }

    # Return unit data with all necessary fields
    return {
        "unit_id": unit.unit_id,
        "plant_id": unit.plant_id,
        "num": unit.num,
        "name": unit.name,
        "name_eng": unit.name_eng,
        "design": unit.design,
        "stage": unit.stage,
        "power": unit.power,
        "start_date": unit.start_date,
        "plant": {
            "plant_id": unit.plant.plant_id,
            "name": unit.plant.name,
            "name_eng": unit.plant.name_eng,
            "sh_name": unit.plant.sh_name,
        },
        "reactor_vessel": {
            "vessel_id": unit.reactor_vessel.vessel_id,
            "unit_id": unit.reactor_vessel.unit_id,
            "sectors": [
                {
                    "rpv_sector_id": sector.rpv_sector_id,
                    "vessel_id": sector.vessel_id,
                    "sector_number": sector.sector_number,
                    "placements": [
                        process_placement(placement)
                        for placement in sorted(
                            sector.placements, key=lambda p: p.num_in_sector
                        )
                    ],
                }
                for sector in sorted(
                    unit.reactor_vessel.sectors, key=lambda s: s.sector_number
                )
            ],
            "coupon_complects": [
                {
                    "coupon_complect_id": complect.coupon_complect_id,
                    "name": complect.name,
                    "complect_number": complect.complect_number,
                    "is_additional": complect.is_additional,
                    "container_systems": [
                        process_container_sys(container_sys)
                        for container_sys in sorted(
                            complect.container_systems,
                            key=lambda cs: cs.name or "",
                        )
                    ],
                }
                for complect in sorted(
                    unit.reactor_vessel.coupon_complects,
                    key=lambda c: c.complect_number or 0,
                )
            ],
        },
    }
