import { useState, useEffect, useRef } from 'react';
import { useSistemaStorage } from './useSistemaStorage';

export const useGeneradorHorarios = () => {
  const [estado, setEstado] = useSistemaStorage();
  const [cargando, setCargando] = useState<boolean>(false);
  const [mensajeProgreso, setMensajeProgreso] = useState<string>('');
  const [porcentajeProgreso, setPorcentajeProgreso] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/generator.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (event) => {
      const { type, message, progress, horarios } = event.data;

      // Actualizar estado de progreso si viene en la respuesta
      if (message) setMensajeProgreso(message);
      if (progress !== undefined) setPorcentajeProgreso(progress);

      // Si ocurre un error capturado en el Worker
      if (type === 'error') {
        setError(message || 'Ocurrió un error al procesar las combinaciones.');
        setCargando(false);
        return;
      }

      // Si terminó la ejecución total exitosamente
      if (type === 'complete') {
        setEstado((prev) => ({
          ...prev,
          horarios_posibles: horarios || [],
        }));
        setError(null);
        setCargando(false);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [setEstado]);

  const generarHorarios = () => {
    if (!workerRef.current) return;

    setEstado((prev) => ({
      ...prev,
      horarios_posibles: [],
    }));
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
    horariosPosibles: estado.horarios_posibles,
  };
};