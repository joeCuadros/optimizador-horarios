import React, { useState, useMemo, useTransition } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useGeneradorHorarios } from '../hooks/useGeneradorHorarios';
import { usePaginacion } from '../hooks/usePaginacion';
import { useSistemaStorage } from '../hooks/useSistemaStorage';
import { TODOS_LOS_CURSOS } from '../data/cursos';
import type { HorarioGenerado } from '../types';

export type CriterioOrden =
  | 'cantidad_choques'
  | 'horas_hueco'
  | 'horas_comida'
  | 'puntaje_docente';

interface CriterioMeta {
  id: CriterioOrden;
  nombre: string;
  icono: string;
}

const CRITERIOS_INFO: Record<CriterioOrden, CriterioMeta> = {
  cantidad_choques: { id: 'cantidad_choques', nombre: 'Menos Choques', icono: '⚡' },
  horas_hueco: { id: 'horas_hueco', nombre: 'Menos Huecos', icono: '⏱️' },
  puntaje_docente: { id: 'puntaje_docente', nombre: 'Mejor Docente', icono: '⭐' },
  horas_comida: { id: 'horas_comida', nombre: 'Más Días Comida', icono: '🍲' },
};

export const GenerarPage: React.FC = () => {
  const navigate = useNavigate();
  const [estado, setEstado] = useSistemaStorage();

  const {
    cargando,
    mensajeProgreso,
    porcentajeProgreso,
    error,
    generarHorarios,
    horariosPosibles,
  } = useGeneradorHorarios();

  // Estados para el Modal de Guardar Favorito
  const [modalGuardar, setModalGuardar] = useState<boolean>(false);
  const [nombreFavorito, setNombreFavorito] = useState<string>('');
  const [horarioAFavorito, setHorarioAFavorito] = useState<HorarioGenerado | null>(null);

  // Transición asíncrona para no congelar la vista al reordenar listas masivas
  const [isPending, startTransition] = useTransition();

  // Prioridades de desempate por defecto
  const [prioridades, setPrioridades] = useState<CriterioOrden[]>([
    'cantidad_choques',
    'horas_hueco',
    'horas_comida',
    'puntaje_docente',
  ]);

  // Algoritmo de ordenamiento multinivel encadenado
  const horariosOrdenados = useMemo(() => {
    if (!horariosPosibles || horariosPosibles.length === 0) return [];

    return [...horariosPosibles].sort((a, b) => {
      for (const criterio of prioridades) {
        let diff = 0;

        switch (criterio) {
          case 'cantidad_choques':
            diff = a.cantidad_choques - b.cantidad_choques;
            break;

          case 'horas_hueco':
            diff = a.horas_hueco - b.horas_hueco;
            break;

          case 'horas_comida':
            diff = b.horas_comida - a.horas_comida;
            break;

          case 'puntaje_docente':
            diff = b.puntaje_docente - a.puntaje_docente;
            break;
        }

        if (diff !== 0) return diff;
      }
      return 0;
    });
  }, [horariosPosibles, prioridades]);

  // Hook de paginación (10 elementos por página)
  const {
    listaPaginada,
    paginaActual,
    totalPaginas,
    paginasVisibles,
    paginaSiguiente,
    paginaAnterior,
    irAPagina,
    setPaginaActual,
  } = usePaginacion(horariosOrdenados, 10);

  const totalCursosSeleccionados = Object.values(
    estado.cursos_seleccionados || {}
  ).reduce((acc, arr) => acc + arr.length, 0);

  const handleMoverPrioridad = (index: number, direccion: 'subir' | 'bajar') => {
    const nuevoOrden = [...prioridades];
    const targetIndex = direccion === 'subir' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= nuevoOrden.length) return;

    const temp = nuevoOrden[index];
    nuevoOrden[index] = nuevoOrden[targetIndex];
    nuevoOrden[targetIndex] = temp;

    startTransition(() => {
      setPrioridades(nuevoOrden);
      setPaginaActual(1); // Regresa a la primera página tras reordenar
    });
  };

  const handleSeleccionarHorario = (horario: HorarioGenerado) => {
    setEstado((prev) => ({
      ...prev,
      horario_seleccionado: horario,
    }));
    navigate('/horario');
  };

  // Abrir Modal de Guardado
  const handleAbrirModalGuardar = (horario: HorarioGenerado, e: React.MouseEvent) => {
    e.stopPropagation();
    setHorarioAFavorito(horario);
    setNombreFavorito(`Mi Horario #${horario.id} (${horario.horas_hueco}h hueco)`);
    setModalGuardar(true);
  };

  // Confirmar Guardado en Favoritos
  const handleConfirmarGuardarFavorito = () => {
    if (!horarioAFavorito) return;
    const nombre = nombreFavorito.trim() || `Horario #${horarioAFavorito.id}`;

    setEstado((prev) => ({
      ...prev,
      horarios_guardados: {
        ...(prev.horarios_guardados || {}),
        [nombre]: horarioAFavorito,
      },
    }));

    setModalGuardar(false);
    setHorarioAFavorito(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header totalCursosSeleccionados={totalCursosSeleccionados} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6">
        {/* PANEL SUPERIOR */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Generador de Horarios ⚙️
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {horariosPosibles.length.toLocaleString()} combinaciones disponibles encontradas.
            </p>
          </div>

          <button
            onClick={generarHorarios}
            disabled={cargando}
            className={`w-full sm:w-auto px-6 py-3 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
              cargando
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
            }`}
          >
            {cargando ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                <span>Procesando...</span>
              </>
            ) : (
              <span>🚀 Generar Combinaciones</span>
            )}
          </button>
        </div>

        {/* ALERTA DE ERROR */}
        {error && !cargando && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs space-y-1 text-rose-800 font-medium">
            <p className="font-black text-rose-900 flex items-center gap-1.5 text-sm">
              ⚠️ No se pudieron generar los horarios:
            </p>
            <p className="text-xs text-rose-700">{error}</p>
          </div>
        )}

        {/* BARRA DE PROGRESO */}
        {cargando && (
          <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-3 animate-fade-in">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></span>
                {mensajeProgreso || 'Ejecutando algoritmo en Web Worker...'}
              </span>
              <span className="font-mono text-indigo-600">
                {porcentajeProgreso || 0}%
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${porcentajeProgreso || 0}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* CONTROLES DE DESEMPATE Y FILTRADO */}
        {!cargando && horariosPosibles.length > 0 && (
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎯 Criterios de Ordenamiento y Desempate:</span>
              </h3>
              {isPending && (
                <span className="text-xs font-bold text-indigo-600 animate-pulse flex items-center gap-1">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></span>
                  Reordenando combinaciones...
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {prioridades.map((criterioId, index) => {
                const item = CRITERIOS_INFO[criterioId];
                return (
                  <div
                    key={criterioId}
                    className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
                  >
                    <span className="text-indigo-600 font-mono text-[11px]">
                      #{index + 1}
                    </span>
                    <span>
                      {item.icono} {item.nombre}
                    </span>

                    <div className="flex items-center ml-1 border-l border-slate-300 pl-1.5 gap-0.5">
                      <button
                        onClick={() => handleMoverPrioridad(index, 'subir')}
                        disabled={index === 0 || isPending}
                        className="hover:bg-slate-200 p-0.5 rounded text-[10px] disabled:opacity-30"
                        title="Subir prioridad"
                      >
                        ◀
                      </button>
                      <button
                        onClick={() => handleMoverPrioridad(index, 'bajar')}
                        disabled={index === prioridades.length - 1 || isPending}
                        className="hover:bg-slate-200 p-0.5 rounded text-[10px] disabled:opacity-30"
                        title="Bajar prioridad"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FEEDBACK MIENTRAS REORDENA */}
        {isPending && (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-700">
              Aplicando nuevo orden de desempate...
            </p>
          </div>
        )}

        {/* LISTADO RESULTANTE */}
        {!cargando && !isPending && horariosOrdenados.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Combinaciones Resultantes ({horariosOrdenados.length.toLocaleString()})
              </h2>
              <span className="text-xs font-bold text-slate-500 font-mono">
                Página {paginaActual.toLocaleString()} de {totalPaginas.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listaPaginada.map((horario) => {
                const esSeleccionado =
                  estado.horario_seleccionado?.id === horario.id;

                return (
                  <div
                    key={horario.id}
                    onClick={() => handleSeleccionarHorario(horario)}
                    className={`bg-white rounded-2xl border p-5 transition-all space-y-4 shadow-sm hover:shadow-md cursor-pointer ${
                      esSeleccionado
                        ? 'border-indigo-600 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {/* Header Tarjeta */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-mono">
                          Horario #{horario.id}
                        </span>
                        {esSeleccionado && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md">
                            ✓ Activo
                          </span>
                        )}
                        {horario.cantidad_choques > 0 && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md">
                            ⚠️ {horario.cantidad_choques} choque(s)
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleAbrirModalGuardar(horario, e)}
                        className="text-slate-400 hover:text-amber-500 p-1.5 rounded-lg hover:bg-amber-50 transition-colors text-sm"
                        title="Guardar en favoritos"
                      >
                        ⭐
                      </button>
                    </div>

                    {/* Métricas rápidas */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] block font-medium">
                          Huecos
                        </span>
                        <span className="font-bold text-slate-800">
                          {horario.horas_hueco} hrs
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] block font-medium">
                          Días Comida
                        </span>
                        <span className="font-bold text-slate-800">
                          {horario.horas_comida}/5
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] block font-medium">
                          Docentes
                        </span>
                        <span className="font-bold text-slate-800">
                          +{horario.puntaje_docente} pts
                        </span>
                      </div>
                    </div>

                    {/* Cursos asignados */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Secciones Seleccionadas:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {horario.secciones_elegidas.map((sec) => {
                          const cursoObj = TODOS_LOS_CURSOS.find(
                            (c) => c.id === sec.curso_id
                          );
                          if (!cursoObj) return null;

                          return (
                            <span
                              key={sec.curso_id}
                              className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-700 flex items-center gap-1"
                            >
                              <span
                                className="w-2 h-2 rounded-full inline-block"
                                style={{ backgroundColor: cursoObj.color }}
                              ></span>
                              {cursoObj.SIGLAS}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-1">
                      <button className="w-full py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl transition-all">
                        Ver Horario →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BARRA DE PAGINACIÓN COMPACTA (-2, -1, ACTUAL, +1, +2) */}
            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-1.5 pt-6">
                <button
                  onClick={() => irAPagina(1)}
                  disabled={paginaActual === 1}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                  title="Primera página"
                >
                  «
                </button>
                <button
                  onClick={paginaAnterior}
                  disabled={paginaActual === 1}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                >
                  ← Anterior
                </button>

                {/* Páginas cercanas */}
                <div className="flex gap-1 px-1">
                  {paginasVisibles.map((num) => (
                    <button
                      key={num}
                      onClick={() => irAPagina(num)}
                      className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all ${
                        paginaActual === num
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  onClick={paginaSiguiente}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                >
                  Siguiente →
                </button>
                <button
                  onClick={() => irAPagina(totalPaginas)}
                  disabled={paginaActual === totalPaginas}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                  title="Última página"
                >
                  »
                </button>
              </div>
            )}
          </div>
        )}

        {/* ESTADO VACÍO */}
        {!cargando && horariosOrdenados.length === 0 && !error && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <div className="text-4xl">🧩</div>
            <h3 className="text-base font-bold text-slate-800">
              No hay combinaciones calculadas
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Presiona el botón de arriba para iniciar la simulación del cálculo en segundo plano.
            </p>
            <Link
              to="/"
              className="inline-block text-xs font-bold text-indigo-600 hover:underline"
            >
              ← Revisar Cursos en Configuración
            </Link>
          </div>
        )}

        {/* MODAL DE GUARDAR FAVORITO */}
        {modalGuardar && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Guardar en Favoritos
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Nombre para identificarlo:
                </label>
                <input
                  type="text"
                  value={nombreFavorito}
                  onChange={(e) => setNombreFavorito(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setModalGuardar(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarGuardarFavorito}
                  className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm"
                >
                  Guardar
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