import json


with open("public/json/buildings.json", "r") as file:
    buildings = json.loads(file.read())
    for building_code in buildings:
        floors = buildings[building_code]["floors"]
        new_floors = []
        for floor in floors:
            new_floors.append(floor["level"])
        buildings[building_code]["floors"] = new_floors
    print(json.dumps(buildings))
