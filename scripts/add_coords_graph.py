import math
import os
import json
from shapely import simplify, to_geojson  # type: ignore
from shapely.geometry import shape  # type: ignore

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


# endregion

floor_plan_map = dict()


def simplify_polygon(polygon):
    return simplify(shape(polygon), tolerance=5)


placement_center_map = {}

for root, dirs, files in os.walk("public/cmumaps-data/floor_plan"):
    building_code = root.split("/")[-1]

    if "floor_plan" in building_code:
        continue

    floor_plan_map[building_code] = dict()
    for file in files:
        file_path = os.path.join(root, file)
        if "outline" in file_path:
            with open(file_path, "r") as file:
                floor_level = file_path.split("-")[1]
                content = json.loads(file.read())
                if "placement" in content:
                    placement = content["placement"]

                    rooms = content["rooms"]
                    floor_center = get_floor_center(rooms)
                    placement_center_map[building_code + "-" + floor_level] = {"center": floor_center, "placement": placement}
        

for root, dirs, files in os.walk("public/cmumaps-data/floor_plan"):
    building_code = root.split("/")[-1]

    if "floor_plan" in building_code:
        continue

    floor_plan_map[building_code] = dict()
    for file in files:
        file_path = os.path.join(root, file)
        if "graph" in file_path:
            with open(file_path, "r") as file:
                floor_level = file_path.split("-")[1]
                content = json.loads(file.read())
                convert_to_global = lambda x: position_on_map(x, placement_center_map[building_code + "-" + floor_level])
                for node_key in content.keys():
                    content[node_key]["coordinate"] = convert_to_global(content[node_key]["pos"])
                    for neigh_key in content[node_key]["neighbors"]:
                        content[node_key]["neighbors"][neigh_key]["distance"] *= placement_center_map[building_code + "-" + floor_level]["placement"]["scale"] 


with open("public/cmumaps-data/floorPlanMap.json", "w") as file:
    file.write(json.dumps(floor_plan_map))
