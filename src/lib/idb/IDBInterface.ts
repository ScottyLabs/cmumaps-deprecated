import { FloorPlanMap } from "@/types";

let db: IDBDatabase;

class MapIDB {
    floorPlanURL: string;
    buildingsURL: string;

    constructor(floorPlanURL: string, buildingsURL: string) {
        // Initialize the database connection
        const DBOpenRequest = window.indexedDB.open('cmumaps', 1);
        DBOpenRequest.onerror = function(event) {
            console.error('Error loading database. Subsequent queries will fail.');
        };
        DBOpenRequest.onsuccess = function(event) {
            db = DBOpenRequest.result;
        };

        DBOpenRequest.onupgradeneeded = async function(event) {
            db = DBOpenRequest.result;
            if (db === null) return;

            const floorPlans = await fetch(floorPlanURL).then(response => response.json())
            const floorPlanStore = db.createObjectStore('floorPlans', { keyPath: 'id' });
            ingestFloorPlan(floorPlans, floorPlanStore);

            const buildings = await fetch(buildingsURL).then(response => response.json())
            const buildingsStore = db.createObjectStore('buildings', { keyPath: 'id' });
            ingestBuildings(buildings, buildingsStore);

            db.createObjectStore('floorPlans', { keyPath: 'id' });
            db.createObjectStore('buildings', { keyPath: 'id' });
        }

        this.floorPlanURL = floorPlanURL;
        this.buildingsURL = buildingsURL;


    }
}

function ingestFloorPlan(data: FloorPlanMap, store: IDBObjectStore) {
    for (const [building_code, building_plan] of data.entries()) {
        for (const [floor_num, floor_plan] of building_plan.entries()) {
            for (const [room_id, room] of floor_plan.entries()) {
                store.add(room, building_code+"-"+floor_num+"-"+room_id);
            }
        }
    }
}

function ingestBuildings(data: any, store: IDBObjectStore) {
    for (const building of data) {
        store.add(building);
    }
}
