# Eats all of the graphs in the folders and does the following:
# 1. Adds the lat/long coordinates to the nodes
# 2. Adds the geodist to the edges
# 3. Creates a high level floor plan json file (floor graph)
# 4. Creates one file with all the graphs (all graph)

import os
import json

from map_utils import get_floor_center, position_on_map, get_latlong_dist

with open("public/cmumaps-data/placements.json", "r") as file:
    placements = json.load(file)

floor_graph = {}
all_graph = {}

for root, dirs, files in os.walk("public/cmumaps-data/floor_plan"):
    building_code = root.split("/")[-1]

    if "floor_plan" in building_code:
        continue

    for file in files:
        file_path = os.path.join(root, file)
        if "graph" in file_path:
            floor = file_path.split("-")[1]
            if (
                building_code not in placements
                or str(floor) not in placements[building_code]
            ):
                continue
            placement = placements[building_code][str(floor)]
            with open(file_path, "r") as graph_file:
                with open(file_path.replace("graph", "outline"), "r") as outline_file:
                    graph = json.load(graph_file)
                    outline = json.load(outline_file)
                    if "TCS-A-graph" in file_path:
                        print('81f1202c-56c0-4a4d-96c5-60a8a9c0fd34' in graph.keys())
                    for nodeId in graph.keys():
                        node = graph[nodeId]
                        floor_center = placement["center"]
                        floor_center = get_floor_center(outline["rooms"])
                        node["coordinate"] = position_on_map(
                            node["pos"], placement, floor_center
                        )
                        node["floor"] = {"buildingCode": building_code, "level": floor}
                        node["id"] = nodeId
                        for neighbor in node["neighbors"].keys():
                            # node["neighbors"][neighbor]["dist"] /= placement["scale"]
                            if "toFloorInfo" in node["neighbors"][neighbor]:
                                stairs_info = node["neighbors"][neighbor]["toFloorInfo"]
                                new_floor = stairs_info["toFloor"]
                                if f"{building_code}-{floor}" not in floor_graph:
                                    floor_graph[f"{building_code}-{floor}"] = set()
                                floor_graph[f"{building_code}-{floor}"].add(
                                    (new_floor, stairs_info["type"])
                                )
                                if new_floor not in floor_graph:
                                    floor_graph[new_floor] = set()
                                floor_graph[new_floor].add(
                                    (f"{building_code}-{floor}", stairs_info["type"])
                                )

                    # with open(file_path, "w") as graph_file:
                    #     json.dump(graph, graph_file)
                    all_graph = {**all_graph, **graph}

                    print(f"Processed {file_path}")

for node in all_graph.keys():
    for neighbor in all_graph[node]["neighbors"].keys():
        if neighbor not in all_graph:
            continue
        if all_graph[node]["floor"]["buildingCode"] == all_graph[neighbor]["floor"]["buildingCode"] and \
          all_graph[node]["floor"]["level"] != all_graph[neighbor]["floor"]["level"]:
            all_graph[node]["neighbors"][neighbor]["dist"] == -1
        else:
            all_graph[node]["neighbors"][neighbor]["dist"] = get_latlong_dist(
                all_graph[node]["coordinate"], all_graph[neighbor]["coordinate"]
            )


with open("high_level_floor_plan.json", "w") as file:
    for key in floor_graph.keys():
        floor_graph[key] = list(floor_graph[key])
    json.dump(floor_graph, file)

with open("all_graph.json", "w") as file:
    file.write(json.dumps(all_graph)) # Json.dump sometimes fails to write the whole thing