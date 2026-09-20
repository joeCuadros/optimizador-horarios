import docentesSistemas from './docentes/sistemas.json';
import type { Docente } from '../types';

export const DOCENTES: Docente[] = [
  ...(docentesSistemas as unknown as Docente[])
];