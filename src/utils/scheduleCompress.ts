import type { HorarioGenerado, MatrizHoras } from '../types';
import { recalcularMatrizYMetricas } from '../services/horarioService';

export const comprimirHorario = (horario: HorarioGenerado): string => {
  try {
    if (!horario.secciones_elegidas || horario.secciones_elegidas.length === 0) {
      return '';
    }

    // Mapeamos solo los IDs esenciales: cursoId_teoId_labId
    const compactString = horario.secciones_elegidas
      .map((s) => `${s.curso_id}_${s.seccion_teo_id ?? 'x'}_${s.seccion_lab_id ?? 'x'}`)
      .join('-');

    // Convertimos la cadena ultracorta a Base64 URL Safe
    const base64 = btoa(compactString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return encodeURIComponent(base64);
  } catch (error) {
    console.error('Error al comprimir horario:', error);
    return '';
  }
};

export const descomprimirHorario = (dataComprimida: string): HorarioGenerado | null => {
  try {
    if (!dataComprimida) return null;

    // Decodificar Base64 URL Safe
    let base64 = decodeURIComponent(dataComprimida)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    while (base64.length % 4) base64 += '=';

    const compactString = atob(base64);
    if (!compactString) return null;

    // Parsear bloques
    const bloques = compactString.split('-');
    const secciones_elegidas = bloques.map((bloque) => {
      const [cursoIdStr, teoIdStr, labIdStr] = bloque.split('_');
      return {
        curso_id: Number(cursoIdStr),
        seccion_teo_id: teoIdStr !== 'x' ? Number(teoIdStr) : undefined,
        seccion_lab_id: labIdStr !== 'x' ? Number(labIdStr) : undefined,
      };
    });

    // Reconstruir automáticamente la matriz completa y métricas dinámicas
    const {
      matrizReconstruida,
      cruces,
      puntajeDocente,
      horasHueco,
      diasConComida,
    } = recalcularMatrizYMetricas(secciones_elegidas);

    // Limpiar campos auxiliares de la matriz reconstruida para cumplir exactamente con MatrizHoras
    const matrizHorasFinal: MatrizHoras = {};
    Object.keys(matrizReconstruida).forEach((diaStr) => {
      const dia = Number(diaStr);
      matrizHorasFinal[dia] = {};
      Object.keys(matrizReconstruida[dia]).forEach((horaStr) => {
        const hora = Number(horaStr);
        const { esCruce, ...celdaLimpia } = matrizReconstruida[dia][hora];
        matrizHorasFinal[dia][hora] = celdaLimpia;
      });
    });

    // Retorna la estructura intacta que espera tu app
    return {
      id: Date.now(),
      horas_hueco: horasHueco,
      horas_comida: diasConComida,
      puntaje_docente: puntajeDocente,
      cantidad_choques: cruces.length,
      matriz_horas: matrizHorasFinal,
      secciones_elegidas,
    };
  } catch (error) {
    console.error('Error al descomprimir horario desde URL:', error);
    return null;
  }
};