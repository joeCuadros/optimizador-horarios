const DEBUG = false;

const logEspacioStorage = (accion: string, clave: string) => {
  if (!DEBUG) return;

  try {
    let bytesTotales = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        bytesTotales += key.length + value.length;
      }
    }

    const kbUsados = (bytesTotales / 1024).toFixed(2);
    console.log(
      `[Storage Debug] ('${accion}') | '${clave}' | Uso actual: ~${kbUsados} KB`
    );
  } catch (err) {
    console.error('[Storage Debug Error] No se pudo calcular el espacio:', err);
  }
};

export const guardarEnStorage = <T>(clave: string, valor: T): void => {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    logEspacioStorage('GUARDAR', clave);
  } catch (error) {
    console.error(`Error guardando '${clave}':`, error);
  }
};

export const obtenerDeStorage = <T>(clave: string, valorPorDefecto: T): T => {
  try {
    const item = localStorage.getItem(clave);
    logEspacioStorage('OBTENER', clave);
    return item ? (JSON.parse(item) as T) : valorPorDefecto;
  } catch (error) {
    console.error(`Error leyendo '${clave}':`, error);
    return valorPorDefecto;
  }
};

export const eliminarDeStorage = (clave: string): void => {
  try {
    localStorage.removeItem(clave);
    logEspacioStorage('ELIMINAR', clave);
  } catch (error) {
    console.error(`Error eliminando '${clave}':`, error);
  }
};