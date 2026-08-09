// hooks/useSistemaStorage.ts
import { useState, useEffect } from 'react';
import { guardarEnStorage, obtenerDeStorage } from '../utils/storage';
import type { SistemaState } from '../types';

const CLAVE_STORAGE = 'sistema_state';

const estadoInicial: SistemaState = {
  cursos_seleccionados: {},
  horarios_posibles: [],
  horario_seleccionado: null,
  horarios_guardados: {},
  hora_almuerzo: [7, 8, 9], //"12:20 a 14:50"
  max_choques: 0,
  horas_bloqueadas: [],
};

export function useSistemaStorage() {
  const [estado, setEstado] = useState<SistemaState>(() =>
    obtenerDeStorage<SistemaState>(CLAVE_STORAGE, estadoInicial)
  );

  useEffect(() => {
    guardarEnStorage(CLAVE_STORAGE, estado);
  }, [estado]);

  return [estado, setEstado] as const;
}