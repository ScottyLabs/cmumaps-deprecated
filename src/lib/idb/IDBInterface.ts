import { Buildings, Floor, FloorPlanMap } from '@/types';

let db: IDBDatabase;
let didDBLoad = false;
export class MapIDB {
  loadDB(floorPlans: FloorPlanMap, buildings: Buildings) {
    const DBOpenRequest = window.indexedDB.open('cmumaps', 1);

    // Initialize the database connection
    DBOpenRequest.onerror = function () {
      console.error('Error loading database. Subsequent queries will fail.');
    };
    DBOpenRequest.onsuccess = function () {
      db = DBOpenRequest.result;
    };

    DBOpenRequest.onupgradeneeded = function (event: any) {
      db = event.target.result;
      if (db === null) {
        return;
      }

      if (
        !db.objectStoreNames.contains('floorPlans') &&
        !db.objectStoreNames.contains('buildings')
      ) {
        const floorPlanStore = db.createObjectStore('floorPlans');
        db.createObjectStore('buildings');

        floorPlanStore.createIndex('floorStr', 'floorStr', { unique: false });

        floorPlanStore.transaction.onerror = (event: any) => {
          console.error(event);
        };

        // there is only one transaction for all the stores, so we just wait for it to complete and then start filling it.
        floorPlanStore.transaction.addEventListener('complete', () => {
          const floorPlanTransactStore = db
            .transaction('floorPlans', 'readwrite')
            .objectStore('floorPlans');
          buildFloorPlanStore(floorPlans, floorPlanTransactStore);

          const buildingsTransactStore = db
            .transaction('buildings', 'readwrite')
            .objectStore('buildings');
          buildBuildingsStore(buildings, buildingsTransactStore);
          didDBLoad = true;
        });
      }
    };
  }

  getFloorsRooms(floor: Floor) {
    if (!didDBLoad) {
      return;
    }
    const transaction = db.transaction(['floorPlans'], 'readonly');
    const objectStore = transaction.objectStore('floorPlans');
    const request = objectStore
      .index('floorStr')
      .getAll(`${floor.buildingCode}-${floor.level}`);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

function buildFloorPlanStore(
  floor_plan_map: FloorPlanMap,
  floorPlanTransactStore: IDBObjectStore,
) {
  for (const building_plan of Object.values(floor_plan_map)) {
    for (const floor_plan of Object.values(building_plan)) {
      for (const [room_id, room] of Object.entries(floor_plan)) {
        const floor = room['floor'];
        room['floorStr'] = `${floor.buildingCode}-${floor.level}`;
        const request = floorPlanTransactStore.add(room, room_id);
        if (request) {
          request.onerror = (event: any) => {
            console.error(event);
          };
        }
      }
    }
  }
}

function buildBuildingsStore(
  buildings: Buildings,
  buildingsTransactStore: IDBObjectStore,
) {
  for (const [building_code, building_object] of Object.entries(buildings)) {
    const request = buildingsTransactStore.add(building_object, building_code);
    if (request) {
      request.onerror = (event: any) => {
        console.error(event);
      };
    }
  }
}
