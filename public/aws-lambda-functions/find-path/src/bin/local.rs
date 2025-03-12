use find_path::http_handler::function_handler;
use find_path::graph_utils::types::{Graph, Buildings, Floor, Node, Coordinate, Edge};
use lambda_http::{Body, Request};
use std::collections::HashMap;
use http::request::Builder;
use tokio;

fn create_test_graph() -> Graph {
    let mut graph = HashMap::new();
    
    let floor = Floor {
        buildingCode: "test".to_string(),
        level: "1".to_string(),
    };

    // Node A
    let mut node_a = Node {
        id: "A".to_string(),
        roomId: "room1".to_string(),
        floor: floor.clone(),
        coordinate: Coordinate { latitude: 0.0, longitude: 0.0 },
        neighbors: HashMap::new(),
    };
    node_a.neighbors.insert("B".to_string(), Edge { dist: 100.0, toFloorInfo: None });

    // Node B
    let mut node_b = Node {
        id: "B".to_string(),
        roomId: "room2".to_string(),
        floor: floor.clone(),
        coordinate: Coordinate { latitude: 1.0, longitude: 0.0 },
        neighbors: HashMap::new(),
    };
    node_b.neighbors.insert("A".to_string(), Edge { dist: 100.0, toFloorInfo: None });

    graph.insert("A".to_string(), node_a);
    graph.insert("B".to_string(), node_b);

    graph
}

fn create_test_buildings() -> Buildings {
    let mut buildings = HashMap::new();
    buildings.insert("room1".to_string(), vec!["A".to_string()]);
    buildings.insert("room2".to_string(), vec!["B".to_string()]);
    buildings
}

#[tokio::main]
async fn main() {
    // Create test graph and buildings
    let graph = create_test_graph();
    let buildings = create_test_buildings();

    // Create a test request
    let request = Builder::new()
        .method("POST")
        .uri("/")
        .body(Body::Text(r#"{
            "waypoints": [
                {
                    "type": "room",
                    "value": "room1"
                },
                {
                    "type": "room",
                    "value": "room2"
                }
            ]
        }"#.to_string()))
        .unwrap();

    // Call the handler
    match function_handler(request, &graph, &buildings).await {
        Ok(response) => {
            println!("Status: {}", response.status());
            match response.body() {
                Body::Text(text) => println!("Response: {}", text),
                _ => println!("Non-text response"),
            }
        },
        Err(e) => println!("Error: {}", e),
    }
}
