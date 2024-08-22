import math

# The number of meters in a degree.
# Values computed for the Pittsburgh region using https://stackoverflow.com/a/51765950/4652564
latitude_ratio = 111318.8450631976
longitude_ratio = 84719.3945182816


# region converted from ts to python using ChatGPT
def rotate(x: float, y: float, angle: float) -> list[float]:
    radians = (math.pi / 180) * angle
    cos = math.cos(radians)
    sin = math.sin(radians)
    nx = cos * x + sin * y
    ny = cos * y - sin * x
    return [nx, ny]


Position = tuple[float, float]


def get_floor_center(rooms: list[dict[str, any]]) -> Position:
    points: list[Position] = [
        coordinate
        for room_id in rooms
        for coordinates in rooms[room_id]["polygon"]["coordinates"]
        for coordinate in coordinates
    ]

    all_x = [p[0] for p in points]
    all_y = [p[1] for p in points]

    min_x = min(all_x)
    max_x = max(all_x)
    min_y = min(all_y)
    max_y = max(all_y)

    return (min_x + max_x) / 2, (min_y + max_y) / 2


def position_on_map(
    absolute: tuple[float, float],
    placement: dict[str, float],
    center: tuple[float, float],
) -> dict[str, float]:
    absolute_y, absolute_x = rotate(
        absolute["x"] - center[0], absolute["y"] - center[1], placement["angle"]
    )

    return {
        "latitude": absolute_y / latitude_ratio / placement["scale"]
        + placement["center"]["latitude"],
        "longitude": absolute_x / longitude_ratio / placement["scale"]
        + placement["center"]["longitude"],
    }

def get_latlong_dist(point1: dict, point2: dict):
    lat1, lon1 = point1.values()
    lat2, lon2 = point2.values()
    latdiffM = (lat2 - lat1) * latitude_ratio
    londiffM = (lon2 - lon1) * longitude_ratio
    return math.sqrt(latdiffM**2 + londiffM**2)