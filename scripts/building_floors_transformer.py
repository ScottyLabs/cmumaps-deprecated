import json


with open("public/json/buildings.json", "r") as file:
    buildings = json.loads(file.read())["buildings"]
    i = 0
    for building in buildings:
        newFloors = []
        for floor in building["floors"]:
            newFloor = dict()
            newFloor["buildingCode"] = building["code"]
            newFloor["level"] = floor["name"]
            newFloors.append(newFloor)
        buildings[i]["floors"] = newFloors
        i += 1

    print(json.dumps(buildings))
