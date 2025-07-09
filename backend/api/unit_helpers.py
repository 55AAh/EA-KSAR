from typing import List, Union
from backend.tables import (
    PlacementTable,
    ContainerSysTable,
    CouponLoadTable,
    CouponExtractTable,
)


class PlacementWithHistory:
    """
    Helper class to track the history of loads and extracts for a placement.
    """

    def __init__(self, placement: PlacementTable):
        self.placement = placement
        self.history: List[Union[CouponLoadTable, CouponExtractTable]] = []

    def load(self, load: CouponLoadTable):
        """Add a load event to the history."""
        self.history.append(load)

    def extract(self, extract: CouponExtractTable):
        """Add an extract event to the history."""
        self.history.append(extract)


class ContainerSysWithHistory:
    """
    Helper class to track the history of loads and extracts for a container system.
    """

    def __init__(self, container_sys: ContainerSysTable):
        self.container_sys = container_sys
        self.history: List[Union[CouponLoadTable, CouponExtractTable]] = []

    def load(self, load: CouponLoadTable):
        """Add a load event to the history."""
        self.history.append(load)

    def extract(self, extract: CouponExtractTable):
        """Add an extract event to the history."""
        self.history.append(extract)


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
