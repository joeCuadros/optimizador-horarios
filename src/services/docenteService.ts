import { DOCENTES } from '../data/docentes';
import type { Docente } from '../types';

export const getDocenteById = (idDocente?: number): Docente | undefined => {
  if (!idDocente) return undefined;
  return DOCENTES.find((d) => d.id === idDocente);
};

export const getDocenteInfoFormat = (idDocente?: number) => {
  if (!idDocente) {
    return { nombre: '👨‍🏫 No conocido', etiqueta: 'Neutral (0)', peso: 0 };
  }

  const docente = getDocenteById(idDocente);
  if (!docente) {
    return { nombre: '👨‍🏫 No conocido', etiqueta: 'Neutral (0)', peso: 0 };
  }

  const pesoEtiquetas: Record<number, string> = {
    '-2': 'Muy malo (-2)',
    '-1': 'Malo (-1)',
    '0': 'Neutral (0)',
    '1': 'Bueno (+1)',
    '2': 'Muy bueno (+2)',
  };

  return {
    nombre: `👨‍🏫 ${docente.nombre}`,
    etiqueta: pesoEtiquetas[docente.peso] || `Neutral (${docente.peso})`,
    peso: docente.peso,
  };
};