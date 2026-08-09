import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSistemaStorage } from './useSistemaStorage';
import { TODOS_LOS_CURSOS } from '../data/cursos';
import type { HorarioGenerado } from '../types';

export const useFavoritosPage = () => {
  const navigate = useNavigate();
  const [estado, setEstado] = useSistemaStorage();

  const [busqueda, setBusqueda] = useState<string>('');
  const [keyARenombrar, setKeyARenombrar] = useState<string | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState<string>('');
  const [keyAEliminar, setKeyAEliminar] = useState<string | null>(null);
  const [mostrarModalVaciar, setMostrarModalVaciar] = useState<boolean>(false);

  const totalCursosSeleccionados = Object.values(estado.cursos_seleccionados || {}).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  const favoritosMap = estado.horarios_guardados || {};
  const listaFavoritos = useMemo(() => {
    return Object.entries(favoritosMap).map(([nombre, horario]) => ({
      nombre,
      horario,
    }));
  }, [favoritosMap]);

  const favoritosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return listaFavoritos;
    const q = busqueda.toLowerCase().trim();

    return listaFavoritos.filter(({ nombre, horario }) => {
      if (nombre.toLowerCase().includes(q)) return true;

      return horario.secciones_elegidas.some((sec) => {
        const cursoObj = TODOS_LOS_CURSOS.find((c) => c.id === sec.curso_id);
        return cursoObj?.SIGLAS.toLowerCase().includes(q) || cursoObj?.nombre.toLowerCase().includes(q);
      });
    });
  }, [listaFavoritos, busqueda]);

  const totalFavoritos = listaFavoritos.length;
  const promedioHuecos = useMemo(() => {
    if (totalFavoritos === 0) return 0;
    const suma = listaFavoritos.reduce((acc, f) => acc + f.horario.horas_hueco, 0);
    return Math.round((suma / totalFavoritos) * 10) / 10;
  }, [listaFavoritos, totalFavoritos]);

  const handleActivarHorario = (horarioObj: HorarioGenerado) => {
    setEstado((prev) => ({
      ...prev,
      horario_seleccionado: horarioObj,
    }));
    navigate('/horario');
  };

  const handleAbrirRenombrar = (nombreActual: string) => {
    setKeyARenombrar(nombreActual);
    setNuevoNombre(nombreActual);
  };

  const handleConfirmarRenombrar = () => {
    if (!keyARenombrar || !nuevoNombre.trim() || keyARenombrar === nuevoNombre.trim()) {
      setKeyARenombrar(null);
      return;
    }

    setEstado((prev) => {
      const copia = { ...(prev.horarios_guardados || {}) };
      const data = copia[keyARenombrar];
      delete copia[keyARenombrar];
      copia[nuevoNombre.trim()] = data;

      return {
        ...prev,
        horarios_guardados: copia,
      };
    });

    setKeyARenombrar(null);
    setNuevoNombre('');
  };

  const handleConfirmarEliminar = () => {
    if (!keyAEliminar) return;

    setEstado((prev) => {
      const copia = { ...(prev.horarios_guardados || {}) };
      delete copia[keyAEliminar];
      return {
        ...prev,
        horarios_guardados: copia,
      };
    });

    setKeyAEliminar(null);
  };

  const handleVaciarTodos = () => {
    setEstado((prev) => ({
      ...prev,
      horarios_guardados: {},
    }));
    setMostrarModalVaciar(false);
  };

  return {
    estado,
    busqueda,
    setBusqueda,
    keyARenombrar,
    setKeyARenombrar,
    nuevoNombre,
    setNuevoNombre,
    keyAEliminar,
    setKeyAEliminar,
    mostrarModalVaciar,
    setMostrarModalVaciar,
    totalCursosSeleccionados,
    favoritosFiltrados,
    totalFavoritos,
    promedioHuecos,
    handleActivarHorario,
    handleAbrirRenombrar,
    handleConfirmarRenombrar,
    handleConfirmarEliminar,
    handleVaciarTodos,
  };
};