import { useState, useEffect, useRef } from 'react';
import { useSistemaStorage } from './useSistemaStorage';
import { obtenerDeIDB } from '../utils/indexedDBStorage';
import type { HorarioGenerado } from '../types';

const IDB_KEY_HORARIOS = 'horarios_posibles_cache';

export const useGeneradorHorarios = () => {
  const [estado] = useSistemaStorage();
  const [horariosPosibles, setHorariosPosibles] = useState<HorarioGenerado[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [mensajeProgreso, setMensajeProgreso] = useState<string>('');
  const [porcentajeProgreso, setPorcentajeProgreso] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

  // Cargar datos en caché desde IndexedDB al montar el componente
  useEffect(() => {
    obtenerDeIDB<HorarioGenerado[]>(IDB_KEY_HORARIOS, []).then((horariosGuardados) => {
      setHorariosPosibles(horariosGuardados);
    });
  }, []);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/generator.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = async (event) => {
      const { type, message, progress, horarios } = event.data;

      if (message) setMensajeProgreso(message);
      if (progress !== undefined) setPorcentajeProgreso(progress);

      if (type === 'error') {
        setError(message || 'Ocurrió un error al procesar las combinaciones.');
        setCargando(false);
        return;
      }

      if (type === 'complete') {
        // Como el Worker ya guardó en IndexedDB, solo actualizamos el estado de la vista
        setHorariosPosibles(horarios || []);
        setError(null);
        setCargando(false);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const generarHorarios = async () => {
    if (!workerRef.current) return;

    setHorariosPosibles([]);
    setError(null);
    setCargando(true);
    setMensajeProgreso('Iniciando cálculo...');
    setPorcentajeProgreso(0);

    workerRef.current.postMessage({
      cursos_seleccionados: estado.cursos_seleccionados,
      secciones_fijadas: estado.secciones_fijadas,
      hora_almuerzo: estado.hora_almuerzo,
      max_choques: estado.max_choques,
      horas_bloqueadas: estado.horas_bloqueadas,
    });
  };

  return {
    cargando,
    mensajeProgreso,
    porcentajeProgreso,
    error,
    generarHorarios,
    horariosPosibles,
  };
};