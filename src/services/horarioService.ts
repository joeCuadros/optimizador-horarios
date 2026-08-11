import { TODOS_LOS_CURSOS } from '../data/cursos';
import { DIAS } from '../data/constantes';
import { getDocenteById } from './docenteService';
import type { HorarioGenerado, CeldaMatriz, Seccion } from '../types';

export type SeccionElegida = HorarioGenerado['secciones_elegidas'][number];
export type CeldaConConflicto = CeldaMatriz & { esCruce?: boolean };

export const recalcularMatrizYMetricas = (
  seccionesEditables: SeccionElegida[],
  horaAlmuerzoConfig?: number[]
) => {
  const matriz: Record<number, Record<number, CeldaConConflicto>> = {};
  const conflictos: string[] = [];
  let puntaje = 0;

  seccionesEditables.forEach((seleccion) => {
    const curso = TODOS_LOS_CURSOS.find((c) => c.id === seleccion.curso_id);
    if (!curso) return;

    const teo = seleccion.seccion_teo_id
      ? Object.values(curso.seccion_teo || {}).find((s) => s.id === seleccion.seccion_teo_id)
      : undefined;

    const lab = seleccion.seccion_lab_id
      ? Object.values(curso.seccion_lab || {}).find((s) => s.id === seleccion.seccion_lab_id)
      : undefined;

    if (teo?.id_docente) {
      const doc = getDocenteById(teo.id_docente);
      if (doc) puntaje += doc.peso;
    }
    if (lab?.id_docente) {
      const doc = getDocenteById(lab.id_docente);
      if (doc) puntaje += doc.peso;
    }

    const procesarSeccion = (sec: Seccion, tipo: 'TEO' | 'LAB') => {
      sec.lista_horas?.forEach((sesion) => {
        const dia = sesion.dia_orden;
        const hora = sesion.hora_orden;

        if (!matriz[dia]) matriz[dia] = {};

        if (matriz[dia][hora]) {
          matriz[dia][hora].esCruce = true;
          conflictos.push(
            `Cruce el día ${DIAS.find((d) => d.orden === dia)?.nombre || dia} a la hora #${hora} entre ${matriz[dia][hora].curso_nombre} y ${curso.SIGLAS}`
          );
        } else {
          matriz[dia][hora] = {
            curso_id: curso.id,
            curso_nombre: curso.SIGLAS,
            seccion_nombre: sec.seccion,
            aula: sec.aula || 'No especificada',
            tipo,
          };
        }
      });
    };

    if (teo) procesarSeccion(teo, 'TEO');
    if (lab) procesarSeccion(lab, 'LAB');
  });

  let huecos = 0;
  Object.keys(matriz).forEach((diaStr) => {
    const dia = Number(diaStr);
    const horasOcupadas = Object.keys(matriz[dia]).map(Number).sort((a, b) => a - b);
    if (horasOcupadas.length > 1) {
      const min = horasOcupadas[0];
      const max = horasOcupadas[horasOcupadas.length - 1];
      for (let h = min; h <= max; h++) {
        if (!matriz[dia][h]) huecos++;
      }
    }
  });

  const bloquesComida = horaAlmuerzoConfig && horaAlmuerzoConfig.length > 0 ? horaAlmuerzoConfig : [6, 7];
  let diasComidaCount = 0;
  Object.keys(matriz).forEach((diaStr) => {
    const dia = Number(diaStr);
    const tieneHoraLibre = bloquesComida.some((bloque) => !matriz[dia]?.[bloque]);
    if (tieneHoraLibre) diasComidaCount++;
  });

  return {
    matrizReconstruida: matriz,
    cruces: conflictos,
    puntajeDocente: puntaje,
    horasHueco: huecos,
    diasConComida: diasComidaCount,
  };
};