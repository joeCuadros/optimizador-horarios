import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useGeneradorHorarios } from '../hooks/useGeneradorHorarios';
import { useSistemaStorage } from '../hooks/useSistemaStorage';
import { TODOS_LOS_CURSOS } from '../data/cursos';
import type { HorarioGenerado } from '../types';

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

  const listaAmostrar: HorarioGenerado[] = horariosPosibles;

  const totalCursosSeleccionados = Object.values(
    estado.cursos_seleccionados || {}
  ).reduce((acc, arr) => acc + arr.length, 0);

  const handleSeleccionarHorario = (horario: HorarioGenerado) => {
    setEstado((prev) => ({
      ...prev,
      horario_seleccionado: horario,
    }));
    navigate('/horario');
  };

  const handleGuardarFavorito = (horario: HorarioGenerado, e: React.MouseEvent) => {
    e.stopPropagation();
    const nombre = `Horario #${horario.id} (${horario.horas_hueco}h hueco)`;
    setEstado((prev) => ({
      ...prev,
      horarios_guardados: {
        ...(prev.horarios_guardados || {}),
        [nombre]: horario,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header totalCursosSeleccionados={totalCursosSeleccionados} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6">
        
        {/* PANEL DE CONTROL SUPERIOR */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Generador de Horarios ⚙️
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {listaAmostrar.length} combinaciones disponibles encontradas.
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

        {/* ALERTA VISUAL DE ERROR (MUESTRA SI EL WORKER LANZA EXCEPCIÓN) */}
        {error && !cargando && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs space-y-1 text-rose-800 font-medium">
            <p className="font-black text-rose-900 flex items-center gap-1.5 text-sm">
              ⚠️ No se pudieron generar los horarios:
            </p>
            <p className="text-xs text-rose-700">{error}</p>
          </div>
        )}

        {/* BARRA DE PROGRESO (VISIBLE MIENTRAS PROCESA) */}
        {cargando && (
          <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-3 animate-fade-in">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></span>
                {mensajeProgreso || 'Ejecutando algoritmo en Web Worker...'}
              </span>
              <span className="font-mono text-indigo-600">{porcentajeProgreso || 0}%</span>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${porcentajeProgreso || 0}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* LISTADO DE HORARIOS GENERADOS */}
        {!cargando && listaAmostrar.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Combinaciones Resultantes ({listaAmostrar.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listaAmostrar.map((horario) => {
                const esSeleccionado = estado.horario_seleccionado?.id === horario.id;

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
                      </div>

                      <button
                        onClick={(e) => handleGuardarFavorito(horario, e)}
                        className="text-slate-400 hover:text-amber-500 p-1.5 rounded-lg hover:bg-amber-50 transition-colors text-sm"
                        title="Guardar en favoritos"
                      >
                        ⭐
                      </button>
                    </div>

                    {/* Métricas rápidas */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] block font-medium">Huecos</span>
                        <span className="font-bold text-slate-800">{horario.horas_hueco} hrs</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] block font-medium">Días Comida</span>
                        <span className="font-bold text-slate-800">{horario.horas_comida}/5</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] block font-medium">Docentes</span>
                        <span className="font-bold text-slate-800">+{horario.puntaje_docente} pts</span>
                      </div>
                    </div>

                    {/* Cursos asignados */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Secciones Seleccionadas:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {horario.secciones_elegidas.map((sec) => {
                          const cursoObj = TODOS_LOS_CURSOS.find((c) => c.id === sec.curso_id);
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
                        Ver Matriz Completa →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ESTADO VACÍO (Sin combinaciones calculadas todavía) */}
        {!cargando && listaAmostrar.length === 0 && !error && (
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

      </main>

      <Footer />
    </div>
  );
};