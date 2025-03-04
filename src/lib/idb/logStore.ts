import { Document } from '@/types';

export function pushLog(query: string, doc: Document, context: any = {}) {
  const DBOpenRequest = window.indexedDB.open('cmumaps', 1);

  // Initialize the database connection
  DBOpenRequest.onerror = function () {
    console.error('Error loading database. Subsequent queries will fail.');
  };
  DBOpenRequest.onsuccess = function () {
    const db = DBOpenRequest.result;
    addLog(db, query, doc);
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
        addLog(db, query, doc, context);
      };
    }
  };
}

export function pullLogs(
  success: (logs: Document[]) => void,
  failure: (error: any) => void,
) {
  const DBOpenRequest = window.indexedDB.open('cmumaps', 3);

  // Initialize the database connection
  DBOpenRequest.onerror = function () {
    console.error('Error loading database. Subsequent queries will fail.');
  };
  DBOpenRequest.onsuccess = function () {
    const db = DBOpenRequest.result;
    const transaction = db.transaction(['logStore'], 'readonly');
    const logStore = transaction.objectStore('logStore');
    const request = logStore.getAll();
    request.onerror = failure;
    request.onsuccess = function () {
      const logs = request.result;
      const dup_docs = logs.map((log: any) => log.doc);
      const uniqueDocIds = {};
      for (let i = 0; i < dup_docs.length; i++) {
        uniqueDocIds[dup_docs[i].id] = dup_docs[i];
      }
      const docs = Object.values(uniqueDocIds)
        .reverse()
        .slice(0, 6) as Document[];
      console.log('docs: ', docs);
      success(docs);
    };
  };

  DBOpenRequest.onupgradeneeded = upgradeDB;
}

function upgradeDB(event: any) {
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
    };
  }
}

function addLog(
  db: IDBDatabase,
  query: string,
  doc: Document,
  context: any = {},
) {
  const transaction = db.transaction(['logStore'], 'readwrite');
  const logStore = transaction.objectStore('logStore');
  const request = logStore.add({
    query,
    doc,
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
