import { useState } from 'react';
import { useSistemaStorage } from './useSistemaStorage';

export const useGeneradorHorarios = () => {
  const [estado, setEstado] = useSistemaStorage();
  const [cargando, setCargando] = useState<boolean>(false);

  // Mantenido vacío temporalmente como se especificó para desarrollo futuro
  const generarHorarios = async () => {
    setCargando(true);
    // Lógica futura de dispatch hacia worker
    setCargando(false);
  };

  return {
    cargando,
    generarHorarios,
    horariosPosibles: estado.horarios_posibles,
  };
};