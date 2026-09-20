import sistemas5Data from './cursos/sistemas_5_año.json';
import type { Curso } from '../types';

export const CURSOS_DISPONIBLES: Record<string, Curso[]> = {
  sistemas_5_año: sistemas5Data as unknown as Curso[],
};

export const TODOS_LOS_CURSOS: Curso[] = Object.values(CURSOS_DISPONIBLES).flat();

export const obtenerCursosPorIds = (ids: number[]): Curso[] => {
  return TODOS_LOS_CURSOS.filter((c) => ids.includes(c.id));
};