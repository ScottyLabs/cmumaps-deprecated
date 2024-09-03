import os
import json
from shapely import simplify  # type: ignore
from shapely.geometry import shape  # type: ignore
import copy
from map_utils import get_floor_center, position_on_map

floor_plan_map = dict()


def simplify_polygon(polygon):
    return simplify(shape(polygon), tolerance=5)


with open("public/cmumaps-data/placements.json", "r") as file:
    placements = json.loads(file.read())

for root, dirs, files in os.walk("public/cmumaps-data/floor_plan"):
    building_code = root.split("/")[-1]

    if "floor_plan" in building_code:
        continue

    floor_plan_map[building_code] = dict()
    for file in files:
        file_path = os.path.join(root, file)

        if "outline" in file_path:
            building_code = file.split("-")[0]
            floor_level = file.split("-")[1]

            with open(file_path, "r") as file:
                content = json.loads(file.read())
                if building_code not in placements:
                    print(building_code + " is missing!")
                    continue

                if floor_level not in placements[building_code]:
                    print(building_code + " " + floor_level + " is missing!")
                    continue

                placement = placements[building_code][floor_level]

                rooms = content["rooms"]
                floor_center = get_floor_center(rooms)

                for room_id in content["rooms"]:
                    room = content["rooms"][room_id]
                    room["id"] = room_id
                    room["labelPosition"] = position_on_map(
                        room["labelPosition"], placement, floor_center
                    )

                    room["floor"] = dict()
                    room["floor"]["buildingCode"] = building_code
                    room["floor"]["level"] = floor_level

                    if len(room["aliases"]) > 0:
                        room["alias"] = room["aliases"][0]
                    else:
                        room["alias"] = ""

                    # room["polygon"] = json.loads(
                    #     to_geojson(simplify_polygon(rooms[room_id]["polygon"]))
                    # )

                    new_coordinates = []
                    for ring in room["polygon"]["coordinates"]:
                        new_ring = []
                        for coordinate in ring:
                            new_ring.append(
                                position_on_map(
                                    {"x": coordinate[0], "y": coordinate[1]},
                                    placement,
                                    floor_center,
                                )
                            )
                        new_coordinates.append(new_ring)
                    room["coordinates"] = new_coordinates

                    del room["polygon"]

                floor_plan_map[building_code][floor_level] = content["rooms"]


# create searchMap
search_map = dict()

for building_code in floor_plan_map:
    search_map[building_code] = dict()

    for floor in floor_plan_map[building_code]:
        search_rooms = []

        rooms = floor_plan_map[building_code][floor]

        for room_id in rooms:
            # delete unneeded in searchMap
            room = copy.deepcopy(rooms[room_id])
            del room["coordinates"]
            search_rooms.append(room)

            # delete unneeded in floorPlanMap
            room = rooms[room_id]
            del room["aliases"]

        search_map[building_code][floor] = search_rooms


with open("public/cmumaps-data/floorPlanMap.json", "w") as file:
    file.write(json.dumps(floor_plan_map))

with open("public/cmumaps-data/searchMap.json", "w") as file:
    file.write(json.dumps(search_map))
