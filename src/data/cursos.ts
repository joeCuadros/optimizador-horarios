import sistemas5Data from './sistemas 5 año.json';
import type { Curso, Docente } from '../types';

export const DOCENTES: Docente[] = (sistemas5Data.docentes || []) as unknown as Docente[];

export const CURSOS_DISPONIBLES: Record<string, Curso[]> = {
  "sistemas_5_año": sistemas5Data.cursos as unknown as Curso[],
};

export const TODOS_LOS_CURSOS: Curso[] = Object.values(CURSOS_DISPONIBLES).flat();

export const obtenerCursosPorIds = (ids: number[]): Curso[] => {
  return TODOS_LOS_CURSOS.filter((c) => ids.includes(c.id));
};