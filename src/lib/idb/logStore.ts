export function pushLog(query: string, resultId: string, context: any = {}) {
  const DBOpenRequest = window.indexedDB.open('cmumaps', 1);

  // Initialize the database connection
  DBOpenRequest.onerror = function () {
    console.error('Error loading database. Subsequent queries will fail.');
  };
  DBOpenRequest.onsuccess = function () {
    const db = DBOpenRequest.result;
    addLog(db, query, resultId);
  };

  DBOpenRequest.onupgradeneeded = function (event: any) {
    const db = event.target.result;
    if (db === null) {
      return;
    }

    if (!db.objectStoreNames.contains('logStore')) {
      const logStore = db.createObjectStore('logStore', {
        autoIncrement: true,
      });

      logStore.transaction.onerror = () => {
        console.error('Error loading database. Subsequent queries will fail.');
      };
      logStore.transaction.oncomplete = () => {
        console.log('Successfully created logStore');
        addLog(db, query, resultId, context);
      };
    }
  };
}

function addLog(
  db: IDBDatabase,
  query: string,
  resultId: string,
  context: any = {},
) {
  const transaction = db.transaction(['logStore'], 'readwrite');
  const logStore = transaction.objectStore('logStore');
  const request = logStore.add({
    query,
    resultId,
    timestamp: Date.now(),
    context,
  });

  request.onerror = function () {
    console.error('Failed to add to logging database');
  };
  request.onsuccess = function () {
    console.log('Successfully logged query');
  };
}
