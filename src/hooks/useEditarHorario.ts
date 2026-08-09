import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSistemaStorage } from './useSistemaStorage';
import { recalcularMatrizYMetricas} from '../services/horarioService';
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
    handleGuardar,
    navigate,
  };
};