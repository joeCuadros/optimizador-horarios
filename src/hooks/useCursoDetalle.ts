import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSistemaStorage } from './useSistemaStorage';
import { TODOS_LOS_CURSOS } from '../data/cursos';
import type { Seccion } from '../types';

export interface CeldaPreview {
  tipo: 'TEO' | 'LAB';
  seccion: string;
  esSeleccionado: boolean;
}

export const useCursoDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const cursoId = Number(id);

  const [estado, setEstado] = useSistemaStorage();
  const [modoMatriz, setModoMatriz] = useState<'todos' | 'seleccion'>('todos');

  const curso = TODOS_LOS_CURSOS.find((c) => c.id === cursoId);

  const totalCursos = Object.values(estado.cursos_seleccionados || {}).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  const fijadosCurso = estado.secciones_fijadas?.[cursoId];
  const fijadaTeoId = fijadosCurso?.seccion_teo_id;
  const fijadaLabId = fijadosCurso?.seccion_lab_id;

  const seccionesTeoList: Seccion[] = curso?.seccion_teo ? Object.values(curso.seccion_teo) : [];
  const seccionesLabList: Seccion[] = curso?.seccion_lab ? Object.values(curso.seccion_lab) : [];

  const [selectedTeoId, setSelectedTeoId] = useState<number>(
    fijadaTeoId || seccionesTeoList[0]?.id || 0
  );
  const [selectedLabId, setSelectedLabId] = useState<number>(
    fijadaLabId || seccionesLabList[0]?.id || 0
  );

  const isTeoFijada = Boolean(fijadaTeoId && fijadaTeoId === selectedTeoId);
  const isLabFijada = Boolean(fijadaLabId && fijadaLabId === selectedLabId);

  const seccionTeoSeleccionada = seccionesTeoList.find((s) => s.id === selectedTeoId);
  const seccionLabSeleccionada = seccionesLabList.find((s) => s.id === selectedLabId);

  const matrizPreview = useMemo(() => {
    const mapa: Record<number, Record<number, CeldaPreview[]>> = {};

    const registrarBloque = (sec: Seccion, tipo: 'TEO' | 'LAB', esSeleccionado: boolean) => {
      if (!sec || !sec.lista_horas) return;
      sec.lista_horas.forEach((h) => {
        if (!mapa[h.dia_orden]) mapa[h.dia_orden] = {};
        if (!mapa[h.dia_orden][h.hora_orden]) mapa[h.dia_orden][h.hora_orden] = [];
        mapa[h.dia_orden][h.hora_orden].push({
          tipo,
          seccion: sec.seccion,
          esSeleccionado,
        });
      });
    };

    if (modoMatriz === 'seleccion') {
      if (seccionTeoSeleccionada) registrarBloque(seccionTeoSeleccionada, 'TEO', true);
      if (seccionLabSeleccionada) registrarBloque(seccionLabSeleccionada, 'LAB', true);
    } else {
      seccionesTeoList.forEach((sec) =>
        registrarBloque(sec, 'TEO', sec.id === selectedTeoId)
      );
      seccionesLabList.forEach((sec) =>
        registrarBloque(sec, 'LAB', sec.id === selectedLabId)
      );
    }

    return mapa;
  }, [
    modoMatriz,
    seccionTeoSeleccionada,
    seccionLabSeleccionada,
    seccionesTeoList,
    seccionesLabList,
    selectedTeoId,
    selectedLabId,
  ]);

  const handleToggleFijarTeo = () => {
    setEstado((prev) => {
      const prevFijadas = prev.secciones_fijadas || {};
      const actual = prevFijadas[cursoId] || {};
      return {
        ...prev,
        secciones_fijadas: {
          ...prevFijadas,
          [cursoId]: {
            ...actual,
            seccion_teo_id: isTeoFijada ? undefined : selectedTeoId,
          },
        },
      };
    });
  };

  const handleToggleFijarLab = () => {
    setEstado((prev) => {
      const prevFijadas = prev.secciones_fijadas || {};
      const actual = prevFijadas[cursoId] || {};
      return {
        ...prev,
        secciones_fijadas: {
          ...prevFijadas,
          [cursoId]: {
            ...actual,
            seccion_lab_id: isLabFijada ? undefined : selectedLabId,
          },
        },
      };
    });
  };

  return {
    curso,
    cursoId,
    totalCursos,
    modoMatriz,
    setModoMatriz,
    seccionesTeoList,
    seccionesLabList,
    selectedTeoId,
    setSelectedTeoId,
    selectedLabId,
    setSelectedLabId,
    isTeoFijada,
    isLabFijada,
    seccionTeoSeleccionada,
    seccionLabSeleccionada,
    matrizPreview,
    handleToggleFijarTeo,
    handleToggleFijarLab,
    fijadaTeoId,
    fijadaLabId,
  };
};