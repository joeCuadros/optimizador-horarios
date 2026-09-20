export interface Dia {
  orden: number; // 1 = Lunes
  nombre: string;
}

export interface Hora {
  orden: number; // 1 = 07:00-07:50
  nombre: string;
}

export interface Docente {
  id: number;
  nombre: string;
  peso: number; // -2: Muy malo, -1: Malo, 0: Neutral, 1: Bueno, 2: Muy bueno
}

export interface HorarioSesion {
  dia_orden: number;
  hora_orden: number;
}

export interface Seccion {
  id: number;
  seccion: string; // "A", "B", "C", etc.
  id_curso: number;
  id_docente: number;
  aula: string;
  lista_horas: HorarioSesion[];
}

export interface Curso {
  id: number;
  año_academico: string;
  nombre: string;
  SIGLAS: string;
  color: string;
  valido: boolean;
  horas_teo: number;
  horas_lab: number;
  seccion_teo: Record<string, Seccion>; // Dict<"seccion", Seccion>
  seccion_lab: Record<string, Seccion>;
}

export interface CeldaMatriz {
  curso_id: number;
  curso_nombre: string;
  seccion_nombre: string;
  aula: string;
  tipo: "TEO" | "LAB";
}

// matriz_horas[dia_orden][hora_orden]
export type MatrizHoras = Record<number, Record<number, CeldaMatriz | null>>;

export interface HorarioGenerado {
  id: number;
  horas_hueco: number;
  horas_comida: number;
  puntaje_docente: number;
  cantidad_choques: number;
  matriz_horas: MatrizHoras;
  secciones_elegidas: {
    curso_id: number;
    seccion_teo_id?: number;
    seccion_lab_id?: number;
  }[];
}

export interface SistemaState {
  cursos_seleccionados: Record<string, number[]>; // ej: { "sistemas 5 año": [101, 102] }
  secciones_fijadas?: Record<number, { seccion_teo_id?: number; seccion_lab_id?: number }>; // { curso_id: { seccion_teo_id: 10 } }
  horario_seleccionado: HorarioGenerado | null;
  horarios_guardados: Record<string, HorarioGenerado>; // ej: { "Horario Promedio": horarioObj, "Sin Mañanas": horarioObj }
  hora_almuerzo: number[]; // Bloques de hora_orden preferidos para comer (ej: [6, 7] = 12:00 a 14:00)
  max_choques: number; // Límite máximo de choques permitidos al generar (0 = cruces cero)
  horas_bloqueadas: HorarioSesion[]; // Bloques ocupados por trabajo/libre donde NO se deben meter clases
}