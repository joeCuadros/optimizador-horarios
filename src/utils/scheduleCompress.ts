import type { HorarioGenerado } from '../types';

export const comprimirHorario = (horario: HorarioGenerado): string => {
  try {
    const jsonString = JSON.stringify(horario);
    // encodeURIComponent previene problemas con caracteres especiales antes de btoa
    const base64 = btoa(encodeURIComponent(jsonString));
    return encodeURIComponent(base64);
  } catch (error) {
    console.error('Error al comprimir horario:', error);
    return '';
  }
};

export const descomprimirHorario = (dataComprimida: string): HorarioGenerado | null => {
  try {
    const base64 = decodeURIComponent(dataComprimida);
    const jsonString = decodeURIComponent(atob(base64));
    return JSON.parse(jsonString) as HorarioGenerado;
  } catch (error) {
    console.error('Error al descomprimir horario desde URL:', error);
    return null;
  }
};