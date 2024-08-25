import requests  # type: ignore
import os
import json


eatery_names = []

url = "https://dining.apis.scottylabs.org/locations"
response = requests.get(url)
for eatery in response.json()["locations"]:
    eatery_names.append(eatery["name"])

for root, dirs, files in os.walk("public/cmumaps-data/floor_plan"):
    for file in files:
        file_path = os.path.join(root, file)
        if "outline" in file_path:
            with open(file_path, "r") as file:
                content = json.loads(file.read())
                if "placement" in content:
                    print(file_path)
                    for room_id in content["rooms"]:
                        room = content["rooms"][room_id]
                        for alias in room["aliases"]:
                            if alias.upper() in eatery_names:
                                room["type"] = "food"

            with open(file_path, "w") as f:
                json.dump(content, f)
