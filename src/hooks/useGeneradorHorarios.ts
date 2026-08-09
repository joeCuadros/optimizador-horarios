import { useState, useCallback } from 'react';
import { useSistemaStorage } from './useSistemaStorage';
import { CURSOS_DISPONIBLES, DOCENTES } from '../data/cursos';
import type { 
  GeneratorWorkerInput, 
  GeneratorWorkerOutput 
} from '../workers/generator.worker';

export const useGeneradorHorarios = () => {
  const [estado, setEstado] = useSistemaStorage();
  const [generando, setGenerando] = useState(false);
  const [evaluados, setEvaluados] = useState(0);

  const generar = useCallback(() => {
    setGenerando(true);
    setEvaluados(0);

    // 1. Obtener cursos seleccionados completos
    const idsSeleccionados = Object.values(estado.cursos_seleccionados || {}).flat();
    const todosLosCursos = Object.values(CURSOS_DISPONIBLES).flat();
    const cursosAProcesar = todosLosCursos.filter((c) => idsSeleccionados.includes(c.id));

    if (cursosAProcesar.length === 0) {
      setEstado((prev) => ({ ...prev, horarios_posibles: [], horario_seleccionado: null }));
      setGenerando(false);
      return;
    }

    // 2. Instanciar Web Worker
    const worker = new Worker(
      new URL('../workers/generator.worker.ts', import.meta.url),
      { type: 'module' }
    );

    const payload: GeneratorWorkerInput = {
      cursosAProcesar,
      secciones_fijadas: estado.secciones_fijadas,
      horas_bloqueadas: estado.horas_bloqueadas || [],
      max_choques: estado.max_choques ?? 0,
      hora_almuerzo: estado.hora_almuerzo || [],
      docentes: DOCENTES,
    };

    worker.postMessage(payload);

    worker.onmessage = (e: MessageEvent<GeneratorWorkerOutput>) => {
      const data = e.data;

      if (data.tipo === 'PROGRESO') {
        setEvaluados(data.evaluados);
      } else if (data.tipo === 'EXITO') {
        setEstado((prev) => ({
          ...prev,
          horarios_posibles: data.horarios,
          horario_seleccionado: data.horarios[0] || null,
        }));
        setGenerando(false);
        worker.terminate();
      }
    };

    worker.onerror = (err) => {
      console.error('Error en el Web Worker de generación:', err);
      setGenerando(false);
      worker.terminate();
    };
  }, [estado, setEstado]);

  return {
    generar,
    generando,
    evaluados,
    totalHorarios: estado.horarios_posibles.length,
  };
};