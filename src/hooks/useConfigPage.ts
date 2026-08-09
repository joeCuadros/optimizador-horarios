import { useEffect } from 'react';
import { useSistemaStorage } from './useSistemaStorage';
import { CURSOS_DISPONIBLES } from '../data/cursos';
import type { HorarioSesion } from '../types';

export const useConfigPage = () => {
  const [estado, setEstado] = useSistemaStorage();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const presetParam = searchParams.get('preset');

    const estaVacio = Object.keys(estado.cursos_seleccionados).length === 0;

    if (estaVacio && presetParam && CURSOS_DISPONIBLES[presetParam]) {
      const ids = CURSOS_DISPONIBLES[presetParam].map((c) => c.id);
      setEstado((prev) => ({
        ...prev,
        cursos_seleccionados: { [presetParam]: ids },
      }));
    }
  }, []);

  const handleToggleCurso = (grupo: string, cursoId: number) => {
    setEstado((prev) => {
      const listaGrupo = prev.cursos_seleccionados[grupo] || [];
      const existe = listaGrupo.includes(cursoId);
      const nuevaLista = existe
        ? listaGrupo.filter((id) => id !== cursoId)
        : [...listaGrupo, cursoId];

      return {
        ...prev,
        cursos_seleccionados: {
          ...prev.cursos_seleccionados,
          [grupo]: nuevaLista,
        },
      };
    });
  };

  const handleLimpiarCursos = () => {
    setEstado((prev) => ({ ...prev, cursos_seleccionados: {}, secciones_fijadas: {} }));
  };

  const handleUpdateAlmuerzo = (hora_almuerzo: number[]) => {
    setEstado((prev) => ({ ...prev, hora_almuerzo }));
  };

  const handleUpdateMaxChoques = (max_choques: number) => {
    setEstado((prev) => ({ ...prev, max_choques }));
  };

  const handleUpdateHorasBloqueadas = (horas_bloqueadas: HorarioSesion[]) => {
    setEstado((prev) => ({ ...prev, horas_bloqueadas }));
  };

  const totalCursos = Object.values(estado.cursos_seleccionados).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  return {
    estado,
    totalCursos,
    handleToggleCurso,
    handleLimpiarCursos,
    handleUpdateAlmuerzo,
    handleUpdateMaxChoques,
    handleUpdateHorasBloqueadas,
  };
};