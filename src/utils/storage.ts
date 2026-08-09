// utils/storage.ts

export const guardarEnStorage = <T>(clave: string, valor: T): void => {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    console.error(`Error guardando '${clave}':`, error);
  }
};

export const obtenerDeStorage = <T>(clave: string, valorPorDefecto: T): T => {
  try {
    const item = localStorage.getItem(clave);
    return item ? (JSON.parse(item) as T) : valorPorDefecto;
  } catch (error) {
    console.error(`Error leyendo '${clave}':`, error);
    return valorPorDefecto;
  }
};

export const eliminarDeStorage = (clave: string): void => {
  try {
    localStorage.removeItem(clave);
  } catch (error) {
    console.error(`Error eliminando '${clave}':`, error);
  }
};