/**
 * Offline Storage Manager using IndexedDB
 * Provides local caching for Firestore data to enable offline functionality
 */

const DB_NAME = "taskflow-offline-db";
const DB_VERSION = 1;

// Store names for different data types
export const STORES = {
  TASKS: "tasks",
  NOTES: "notes",
  USER: "user",
  MEALS: "meals",
  WORKOUTS: "workouts",
  ANALYTICS: "analytics",
};

/**
 * Initialize the IndexedDB database
 */
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
    };
  });
}

/**
 * Save data to IndexedDB
 */
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
 * Get data from IndexedDB by key
 */
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

/**
 * Delete data from IndexedDB
 */
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

/**
 * Clear all data from a store
 */
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

/**
 * Check if data exists in offline storage
 */
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
 * Sync offline changes with server (to be called when back online)
 */
export interface PendingAction {
  id: string;
  type: "CREATE" | "UPDATE" | "DELETE";
  storeName: string;
  data: any;
  timestamp: number;
}

const PENDING_ACTIONS_STORE = "pending-actions";

export async function addPendingAction(action: PendingAction): Promise<void> {
  const db = await initDB();

  // Create pending actions store if it doesn't exist
  if (!db.objectStoreNames.contains(PENDING_ACTIONS_STORE)) {
    db.close();
    // Need to bump version to add new store
    return;
  }

  const transaction = db.transaction([PENDING_ACTIONS_STORE], "readwrite");
  const store = transaction.objectStore(PENDING_ACTIONS_STORE);
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

  if (!db.objectStoreNames.contains(PENDING_ACTIONS_STORE)) {
    db.close();
    return [];
  }

  const transaction = db.transaction([PENDING_ACTIONS_STORE], "readonly");
  const store = transaction.objectStore(PENDING_ACTIONS_STORE);
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

export async function clearPendingActions(): Promise<void> {
  return clearOfflineStorage(PENDING_ACTIONS_STORE);
}
