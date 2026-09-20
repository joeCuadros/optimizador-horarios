const DB_NAME = 'SistemaHorariosDB';
const STORE_NAME = 'horarios_store';
const DB_VERSION = 1;

const abrirDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const guardarEnIDB = async <T>(clave: string, valor: T): Promise<void> => {
  try {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(valor, clave);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`Error guardando en IndexedDB '${clave}':`, error);
  }
};

export const obtenerDeIDB = async <T>(clave: string, valorPorDefecto: T): Promise<T> => {
  try {
    const db = await abrirDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(clave);

      request.onsuccess = () => {
        resolve(request.result !== undefined ? (request.result as T) : valorPorDefecto);
      };
      request.onerror = () => resolve(valorPorDefecto);
    });
  } catch (error) {
    console.error(`Error leyendo de IndexedDB '${clave}':`, error);
    return valorPorDefecto;
  }
};

export const eliminarDeIDB = async (clave: string): Promise<void> => {
  try {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(clave);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`Error eliminando de IndexedDB '${clave}':`, error);
  }
};