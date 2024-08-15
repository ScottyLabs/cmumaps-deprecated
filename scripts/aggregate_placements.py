import os
import json

placements = dict()

for root, dirs, files in os.walk("public/json/floor_plan"):
    building_code = root.split("/")[-1]

    if "floor_plan" in building_code:
        continue

    placements[building_code] = dict()
    for file in files:
        file_path = os.path.join(root, file)
        if "outline" in file_path:
            with open(file_path, "r") as file:
                floor_level = file_path.split("-")[1]
                search_rooms = []
                content = json.loads(file.read())
                if "placement" in content:
                    placements[building_code][floor_level] = content["placement"]

with open("public/json/placements.json", "w") as file:
    file.write(json.dumps(placements))
