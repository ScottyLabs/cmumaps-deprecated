import os
import json

search_map = dict()

for root, dirs, files in os.walk("public/json/floor_plan"):
    building_code = root.split("/")[-1]

    if "floor_plan" in building_code:
        continue

    search_map[building_code] = dict()
    for file in files:
        file_path = os.path.join(root, file)
        if "outline" in file_path:
            with open(file_path, "r") as file:
                floor_level = file_path.split("-")[1]
                search_rooms = []
                content = json.loads(file.read())
                if "placement" in content:
                    for room_id in content["rooms"]:
                        room = content["rooms"][room_id]
                        room["id"] = room_id

                        if len(room["aliases"]) > 0:
                            room["alias"] = room["aliases"][0]
                        else:
                            room["alias"] = ""

                        room["floor"] = dict()
                        room["floor"]["buildingCode"] = building_code
                        room["floor"]["level"] = floor_level
                        del room["polygon"]
                        search_rooms.append(room)

                search_map[building_code][floor_level] = search_rooms

with open("public/json/searchMap.json", "w") as file:
    file.write(json.dumps(search_map))
