/**
 * Offline Storage Manager using IndexedDB
 * Provides local caching for Firestore data to enable offline functionality
 */

const DB_NAME = "prioritron-offline-db";
const DB_VERSION = 1;

// Store names for different data types
export const STORES = {
  TASKS: "tasks",
  NOTES: "notes",
  USER: "user",
  MEALS: "meals",
  WORKOUTS: "workouts",
  ANALYTICS: "analytics",
  PENDING_ACTIONS: "pending-actions",
};

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        const taskStore = db.createObjectStore(STORES.TASKS, { keyPath: "id" });
        taskStore.createIndex("userId", "userId", { unique: false });
        taskStore.createIndex("status", "status", { unique: false });
        taskStore.createIndex("dueDate", "dueDate", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.NOTES)) {
        const noteStore = db.createObjectStore(STORES.NOTES, { keyPath: "id" });
        noteStore.createIndex("userId", "userId", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.USER)) {
        db.createObjectStore(STORES.USER, { keyPath: "uid" });
      }

      if (!db.objectStoreNames.contains(STORES.MEALS)) {
        const mealStore = db.createObjectStore(STORES.MEALS, { keyPath: "id" });
        mealStore.createIndex("userId", "userId", { unique: false });
        mealStore.createIndex("date", "date", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.WORKOUTS)) {
        const workoutStore = db.createObjectStore(STORES.WORKOUTS, {
          keyPath: "id",
        });
        workoutStore.createIndex("userId", "userId", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.ANALYTICS)) {
        const analyticsStore = db.createObjectStore(STORES.ANALYTICS, {
          keyPath: "userId",
        });
        analyticsStore.createIndex("timestamp", "timestamp", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.PENDING_ACTIONS)) {
        const pendingActionsStore = db.createObjectStore(
          STORES.PENDING_ACTIONS,
          {
            keyPath: "id",
          }
        );
        pendingActionsStore.createIndex("timestamp", "timestamp", {
          unique: false,
        });
        pendingActionsStore.createIndex("storeName", "storeName", {
          unique: false,
        });
      }
    };
  });
}

export async function saveToOfflineStorage<T>(
  storeName: string,
  data: T | T[]
): Promise<void> {
  const db = await initDB();
  const transaction = db.transaction([storeName], "readwrite");
  const store = transaction.objectStore(storeName);

  const items = Array.isArray(data) ? data : [data];

  for (const item of items) {
    store.put(item);
  }

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

/**
 * Replaces the whole contents of a store in a single transaction.
 * `saveToOfflineStorage` only puts, so deletions made on another device would
 * otherwise linger in the cache forever.
 */
export async function replaceOfflineStore<T>(
  storeName: string,
  data: T[]
): Promise<void> {
  const db = await initDB();
  const transaction = db.transaction([storeName], "readwrite");
  const store = transaction.objectStore(storeName);

  store.clear();
  for (const item of data) {
    store.put(item);
  }

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function getFromOfflineStorage<T>(
  storeName: string,
  key: string
): Promise<T | null> {
  const db = await initDB();
  const transaction = db.transaction([storeName], "readonly");
  const store = transaction.objectStore(storeName);
  const request = store.get(key);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      db.close();
      resolve(request.result || null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

/**
 * Get all data from a store, optionally filtered by index
 */
export async function getAllFromOfflineStorage<T>(
  storeName: string,
  indexName?: string,
  indexValue?: string
): Promise<T[]> {
  const db = await initDB();
  const transaction = db.transaction([storeName], "readonly");
  const store = transaction.objectStore(storeName);

  const request = indexName
    ? store.index(indexName).getAll(indexValue)
    : store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      db.close();
      resolve(request.result || []);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function deleteFromOfflineStorage(
  storeName: string,
  key: string
): Promise<void> {
  const db = await initDB();
  const transaction = db.transaction([storeName], "readwrite");
  const store = transaction.objectStore(storeName);
  store.delete(key);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function clearOfflineStorage(storeName: string): Promise<void> {
  const db = await initDB();
  const transaction = db.transaction([storeName], "readwrite");
  const store = transaction.objectStore(storeName);
  store.clear();

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function hasOfflineData(storeName: string): Promise<boolean> {
  const db = await initDB();
  const transaction = db.transaction([storeName], "readonly");
  const store = transaction.objectStore(storeName);
  const request = store.count();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      db.close();
      resolve(request.result > 0);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

/**
 * Queue of writes made while offline. Flushed by `app/_lib/offlineTaskQueue.ts` once the connection returns.
 */
export interface PendingAction {
  id: string;
  type: "CREATE" | "UPDATE" | "DELETE";
  storeName: string;
  data: unknown;
  timestamp: number;
}

export async function addPendingAction(action: PendingAction): Promise<void> {
  const db = await initDB();
  const transaction = db.transaction([STORES.PENDING_ACTIONS], "readwrite");
  const store = transaction.objectStore(STORES.PENDING_ACTIONS);
  store.put(action);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function getPendingActions(): Promise<PendingAction[]> {
  const db = await initDB();
  const transaction = db.transaction([STORES.PENDING_ACTIONS], "readonly");
  const store = transaction.objectStore(STORES.PENDING_ACTIONS);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      db.close();
      resolve(request.result || []);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function deletePendingAction(id: string): Promise<void> {
  return deleteFromOfflineStorage(STORES.PENDING_ACTIONS, id);
}

export async function countPendingActions(): Promise<number> {
  const db = await initDB();
  const transaction = db.transaction([STORES.PENDING_ACTIONS], "readonly");
  const request = transaction.objectStore(STORES.PENDING_ACTIONS).count();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      db.close();
      resolve(request.result);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function clearPendingActions(): Promise<void> {
  return clearOfflineStorage(STORES.PENDING_ACTIONS);
}
