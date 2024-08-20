import os
import json

from map_utils import get_floor_center, position_on_map

with open("public/json/placements.json", "r") as file:
    placements = json.load(file)

big_graph = {}

for root, dirs, files in os.walk("public/json/floor_plan"):
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
                    for nodeId in graph.keys():
                        node = graph[nodeId]
                        floor_center = placement["center"]
                        floor_center = get_floor_center(outline["rooms"])
                        node["coordinate"] = position_on_map(
                            node["pos"], placement, floor_center
                        )
                        for neighbor in node["neighbors"].keys():
                            node["neighbors"][neighbor]["dist"] *= placement["scale"]
                            if "toFloorInfo" in node["neighbors"][neighbor]:
                                stairs_info = node["neighbors"][neighbor]["toFloorInfo"]
                                new_floor = stairs_info["toFloor"]
                                if f"{building_code}-{floor}" not in big_graph:
                                    big_graph[f"{building_code}-{floor}"] = set()
                                big_graph[f"{building_code}-{floor}"].add(
                                    (new_floor, stairs_info["type"])
                                )
                                if new_floor not in big_graph:
                                    big_graph[new_floor] = set()
                                big_graph[new_floor].add(
                                    (f"{building_code}-{floor}", stairs_info["type"])
                                )
                    if "GHC-5-graph" not in file_path:
                        with open(file_path, "w") as graph_file:
                            json.dump(graph, graph_file)

                    print(f"Processed {file_path}")

with open("high_level_floor_plan.json", "w") as file:
    for key in big_graph.keys():
        big_graph[key] = list(big_graph[key])
    json.dump(big_graph, file)
