import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSistemaStorage } from './useSistemaStorage';
import { recalcularMatrizYMetricas } from '../services/horarioService';
import { TODOS_LOS_CURSOS } from '../data/cursos';
import type { SeccionElegida } from '../services/horarioService';
import type { HorarioGenerado, MatrizHoras } from '../types';

export const useEditarHorario = () => {
  const navigate = useNavigate();
  const [estado, setEstado] = useSistemaStorage();

  const horarioInicial = estado.horario_seleccionado;

  const [seccionesEditables, setSeccionesEditables] = useState<SeccionElegida[]>(
    horarioInicial?.secciones_elegidas || []
  );

  const totalCursosSeleccionados = Object.values(estado.cursos_seleccionados || {}).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  const { matrizReconstruida, cruces, puntajeDocente, horasHueco, diasConComida } = useMemo(() => {
    return recalcularMatrizYMetricas(seccionesEditables, estado.hora_almuerzo);
  }, [seccionesEditables, estado.hora_almuerzo]);

  // Cambiar sección de teoría o laboratorio
  const handleCambiarSeccion = (
    cursoId: number,
    tipo: 'seccion_teo_id' | 'seccion_lab_id',
    nuevaSeccionId: number | undefined
  ) => {
    setSeccionesEditables((prev) =>
      prev.map((item) => {
        if (item.curso_id === cursoId) {
          return { ...item, [tipo]: nuevaSeccionId };
        }
        return item;
      })
    );
  };

  // Agregar un curso nuevo seleccionando por defecto su primera sección de teoría/lab
  const handleAgregarCurso = (cursoId: number) => {
    const yaExiste = seccionesEditables.some((s) => s.curso_id === cursoId);
    if (yaExiste) return;

    const curso = TODOS_LOS_CURSOS.find((c) => c.id === cursoId);
    if (!curso) return;

    const teos = Object.values(curso.seccion_teo || {});
    const labs = Object.values(curso.seccion_lab || {});

    const nuevaSeccion: SeccionElegida = {
      curso_id: cursoId,
      seccion_teo_id: teos.length > 0 ? teos[0].id : undefined,
      seccion_lab_id: labs.length > 0 ? labs[0].id : undefined,
    };

    setSeccionesEditables((prev) => [...prev, nuevaSeccion]);
  };

  // Quitar un curso del horario editable
  const handleQuitarCurso = (cursoId: number) => {
    setSeccionesEditables((prev) => prev.filter((item) => item.curso_id !== cursoId));
  };

  // Resetear cambios a la versión inicial del horario
  const handleResetearCambios = () => {
    if (horarioInicial) {
      setSeccionesEditables(horarioInicial.secciones_elegidas || []);
    }
  };

  // Guardar y consolidar la matriz final
  const handleGuardar = () => {
    if (!horarioInicial) return;

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

    const horarioActualizado: HorarioGenerado = {
      ...horarioInicial,
      secciones_elegidas: seccionesEditables,
      matriz_horas: matrizHorasFinal,
      horas_hueco: horasHueco,
      horas_comida: diasConComida,
      puntaje_docente: puntajeDocente,
      cantidad_choques: cruces.length,
    };

    setEstado((prev) => ({
      ...prev,
      horario_seleccionado: horarioActualizado,
    }));

    navigate('/horario');
  };

  return {
    horarioInicial,
    seccionesEditables,
    totalCursosSeleccionados,
    matrizReconstruida,
    cruces,
    puntajeDocente,
    horasHueco,
    diasConComida,
    handleCambiarSeccion,
    handleAgregarCurso,
    handleQuitarCurso,
    handleResetearCambios,
    handleGuardar,
    navigate,
  };
};