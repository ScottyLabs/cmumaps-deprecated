import os
import json

floor_plan_map = dict()

for root, dirs, files in os.walk("public/cmumaps-data/floor_plan"):
    building_code = root.split("/")[-1]

    if "floor_plan" in building_code:
        continue

    floor_plan_map[building_code] = dict()
    for file in files:
        file_path = os.path.join(root, file)

        # building_code = file.split("-")[0]
        # floor_level = file.split("-")[1]

        with open(file_path, "r+") as file:
            content = json.loads(file.read())  # Read the existing JSON content
            file.seek(0)  # Move the cursor to the start of the file
            file.write(json.dumps(content, indent=4))  # Write the formatted JSON back
            file.truncate()  # Remove any leftover data if new content is shorter
