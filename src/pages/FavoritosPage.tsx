import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useSistemaStorage } from '../hooks/useSistemaStorage';
import { TODOS_LOS_CURSOS } from '../data/cursos';
import type { HorarioGenerado } from '../types';

export const FavoritosPage: React.FC = () => {
  const navigate = useNavigate();
  const [estado, setEstado] = useSistemaStorage();

  // Estados de control local
  const [busqueda, setBusqueda] = useState<string>('');
  
  // Modal de Renombrar
  const [keyARenombrar, setKeyARenombrar] = useState<string | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState<string>('');

  // Modal de Eliminar
  const [keyAEliminar, setKeyAEliminar] = useState<string | null>(null);
  const [mostrarModalVaciar, setMostrarModalVaciar] = useState<boolean>(false);

  // Cursos seleccionados para el badge del Header
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

  // Filtrado por búsqueda
  const favoritosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return listaFavoritos;
    const q = busqueda.toLowerCase().trim();

    return listaFavoritos.filter(({ nombre, horario }) => {
      // Coincidencia por nombre del favorito
      if (nombre.toLowerCase().includes(q)) return true;

      // Coincidencia por sigla de curso incluido
      return horario.secciones_elegidas.some((sec) => {
        const cursoObj = TODOS_LOS_CURSOS.find((c) => c.id === sec.curso_id);
        return cursoObj?.SIGLAS.toLowerCase().includes(q) || cursoObj?.nombre.toLowerCase().includes(q);
      });
    });
  }, [listaFavoritos, busqueda]);

  // Métricas agregadas
  const totalFavoritos = listaFavoritos.length;
  const promedioHuecos = useMemo(() => {
    if (totalFavoritos === 0) return 0;
    const suma = listaFavoritos.reduce((acc, f) => acc + f.horario.horas_hueco, 0);
    return Math.round((suma / totalFavoritos) * 10) / 10;
  }, [listaFavoritos, totalFavoritos]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  // Seleccionar como activo e ir a la matriz
  const handleActivarHorario = (horarioObj: HorarioGenerado) => {
    setEstado((prev) => ({
      ...prev,
      horario_seleccionado: horarioObj,
    }));
    navigate('/horario');
  };

  // Abrir Modal Renombrar
  const handleAbrirRenombrar = (nombreActual: string) => {
    setKeyARenombrar(nombreActual);
    setNuevoNombre(nombreActual);
  };

  // Confirmar Renombrar
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

  // Confirmar Eliminar Uno
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

  // Confirmar Vaciar Todos
  const handleVaciarTodos = () => {
    setEstado((prev) => ({
      ...prev,
      horarios_guardados: {},
    }));
    setMostrarModalVaciar(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header totalCursosSeleccionados={totalCursosSeleccionados} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6">
        
        {/* ENCABEZADO Y MÉTRICAS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>⭐</span> Horarios Favoritos
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Guarda y compara las mejores combinaciones para tomar la decisión final.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-indigo-500 font-bold uppercase block">Guardados</span>
              <span className="text-lg font-black text-indigo-700">{totalFavoritos}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Prom. Huecos</span>
              <span className="text-lg font-black text-slate-700">{promedioHuecos} hrs</span>
            </div>

            {totalFavoritos > 0 && (
              <button
                onClick={() => setMostrarModalVaciar(true)}
                className="px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                title="Vaciar todos los favoritos"
              >
                🗑️ Vaciar
              </button>
            )}
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA / FILTRO */}
        {totalFavoritos > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">
                🔍
              </span>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre de favorito o curso (ej: MAT101)..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <span className="text-xs text-slate-400 font-medium">
              Mostrando {favoritosFiltrados.length} de {totalFavoritos} guardados
            </span>
          </div>
        )}

        {/* GRILLA DE FAVORITOS */}
        {favoritosFiltrados.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoritosFiltrados.map(({ nombre, horario }) => {
              const esActivo = estado.horario_seleccionado?.id === horario.id;

              return (
                <div
                  key={nombre}
                  className={`bg-white rounded-2xl border p-5 transition-all space-y-4 shadow-sm hover:shadow-md ${
                    esActivo
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Header de la tarjeta */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-black text-slate-900 tracking-tight">
                          {nombre}
                        </h2>
                        {esActivo && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300">
                            ✓ Activo en Matriz
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        ID: {horario.id != null ? String(horario.id).slice(0, 12) : 'N/A'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAbrirRenombrar(nombre)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs"
                        title="Renombrar favorito"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setKeyAEliminar(nombre)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs"
                        title="Eliminar de favoritos"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Chips de Métricas */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">Horas Hueco</span>
                      <span className="font-bold text-slate-800">{horario.horas_hueco} hrs</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">Cruces Almuerzo</span>
                      <span className="font-bold text-slate-800">{horario.horas_comida} hrs</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">Puntaje Profes</span>
                      <span className="font-bold text-slate-800">+{horario.puntaje_docente} pts</span>
                    </div>
                  </div>

                  {/* Cursos y Secciones asignadas */}
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Cursos Asignados ({horario.secciones_elegidas.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {horario.secciones_elegidas.map((sec) => {
                        const cursoObj = TODOS_LOS_CURSOS.find((c) => c.id === sec.curso_id);
                        if (!cursoObj) return null;

                        const teoNombre = sec.seccion_teo_id
                          ? cursoObj.seccion_teo?.[sec.seccion_teo_id]?.seccion
                          : null;
                        const labNombre = sec.seccion_lab_id
                          ? cursoObj.seccion_lab?.[sec.seccion_lab_id]?.seccion
                          : null;

                        return (
                          <span
                            key={sec.curso_id}
                            className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-700 flex items-center gap-1"
                          >
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: cursoObj.color }}
                            ></span>
                            {cursoObj.SIGLAS}: {teoNombre ? `T.${teoNombre}` : ''} {labNombre ? `L.${labNombre}` : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleActivarHorario(horario)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        esActivo
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <span>{esActivo ? '✓ Activo (Ir a Matriz)' : '🚀 Seleccionar y Ver en Matriz'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ESTADO VACÍO (Si no hay coincidencia con la búsqueda) */}
        {totalFavoritos > 0 && favoritosFiltrados.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="text-3xl">🔍</div>
            <h3 className="text-sm font-bold text-slate-800">No hay favoritos con esa búsqueda</h3>
            <p className="text-xs text-slate-500">
              Prueba buscar con otro nombre o sigla de curso.
            </p>
            <button
              onClick={() => setBusqueda('')}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* ESTADO VACÍO GLOBAL (Si no hay guardados) */}
        {totalFavoritos === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <div className="text-4xl">⭐</div>
            <h3 className="text-base font-bold text-slate-800">Aún no has guardado ningún horario</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ve a la sección de generación de horarios y presiona la estrella (⭐) en las opciones que más te gusten para guardarlas aquí.
            </p>
            <Link
              to="/generar"
              className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              🚀 Ir a Generar Horarios
            </Link>
          </div>
        )}

        {/* MODAL RENOMBRAR */}
        {keyARenombrar && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Renombrar Favorito</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Nuevo Nombre:
                </label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setKeyARenombrar(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarRenombrar}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ELIMINAR UNO */}
        {keyAEliminar && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 text-center">
              <div className="text-3xl">🗑️</div>
              <h3 className="text-base font-bold text-slate-900">¿Eliminar Favorito?</h3>
              <p className="text-xs text-slate-500">
                Se quitará <span className="font-bold text-slate-800">"{keyAEliminar}"</span> de tu lista de guardados.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setKeyAEliminar(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarEliminar}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-lg shadow-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL VACIAR TODOS */}
        {mostrarModalVaciar && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 text-center">
              <div className="text-3xl">⚠️</div>
              <h3 className="text-base font-bold text-slate-900">¿Vaciar todos los favoritos?</h3>
              <p className="text-xs text-slate-500">
                Esta acción eliminará los {totalFavoritos} horarios guardados. No se podrá deshacer.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setMostrarModalVaciar(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleVaciarTodos}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-lg shadow-sm"
                >
                  Sí, Vaciar Todo
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};