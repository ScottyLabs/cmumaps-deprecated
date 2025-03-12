pub mod graph_utils;
pub mod http_handler;

#[cfg(test)]
mod tests {
    use crate::graph_utils::{
        self, find_path, types::{Coordinate, Edge, Floor, Graph, Node, PathPreference, PathingOptions}
    };
    use std::collections::HashMap;

    fn create_test_graph() -> Graph {
        let mut graph = HashMap::new();
        
        // Create a simple test graph with indoor and outdoor paths
        let floor_indoor = Floor {
            buildingCode: "building".to_string(),
            level: "1".to_string(),
        };

        let floor_outdoor = Floor {
            buildingCode: "outside".to_string(),
            level: "ground".to_string(),
        };

        // Node A (indoor)
        let mut node_a = Node {
            id: "A".to_string(),
            roomId: "room1".to_string(),
            floor: floor_indoor.clone(),
            coordinate: Coordinate { latitude: 0.0, longitude: 0.0 },
            neighbors: HashMap::new(),
        };
        node_a.neighbors.insert("B".to_string(), Edge { dist: 100.0, toFloorInfo: None });

        // Node B (outdoor)
        let mut node_b = Node {
            id: "B".to_string(),
            roomId: "outside1".to_string(),
            floor: floor_outdoor.clone(),
            coordinate: Coordinate { latitude: 1.0, longitude: 0.0 },
            neighbors: HashMap::new(),
        };
        node_b.neighbors.insert("A".to_string(), Edge { dist: 100.0, toFloorInfo: None });
        node_b.neighbors.insert("C".to_string(), Edge { dist: 100.0, toFloorInfo: None });

        // Node C (indoor)
        let mut node_c = Node {
            id: "C".to_string(),
            roomId: "room2".to_string(),
            floor: floor_indoor.clone(),
            coordinate: Coordinate { latitude: 2.0, longitude: 0.0 },
            neighbors: HashMap::new(),
        };
        node_c.neighbors.insert("B".to_string(), Edge { dist: 100.0, toFloorInfo: None });

        graph.insert("A".to_string(), node_a);
        graph.insert("B".to_string(), node_b);
        graph.insert("C".to_string(), node_c);

        graph
    }

    #[test]
    fn test_basic_path_finding() {
        let graph = create_test_graph();
        let start_nodes = vec!["A".to_string()];
        let end_nodes = vec!["C".to_string()];

        let options = PathingOptions {
            preference: PathPreference::Balanced,
            weather_info: None,
        };

        let route = find_path(&start_nodes, &end_nodes, &graph, options).unwrap();
        assert_eq!(route.path.path, vec!["A", "B", "C"]);
    }

    #[test]
    fn test_weather_aware_path_finding() {
        let graph = create_test_graph();
        let start_nodes = vec!["A".to_string()];
        let end_nodes = vec!["C".to_string()];

        // Test with bad weather
        let bad_weather = graph_utils::weather_service::WeatherInfo {
            temperature: 32.0,  // Very cold
            feels_like: 25.0,
            condition: "Snow".to_string(),
        };

        let options = PathingOptions {
            preference: PathPreference::Weather,
            weather_info: Some(bad_weather),
        };

        let route = find_path(&start_nodes, &end_nodes, &graph, options).unwrap();
        
        // In bad weather, the path should try to minimize outdoor exposure
        // However, in this case, we must go through B since it's the only way
        assert_eq!(route.path.path, vec!["A", "B", "C"]);
    }
}
