import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { DIAS, HORAS } from '../data/constantes';
import { getDocenteInfoFormat } from '../services/docenteService';
import { useHorarioPage } from '../hooks/useHorarioPage';
import type { CeldaMatriz } from '../types';

export const HorarioPage: React.FC = () => {
  const {
    dataParam,
    horarioActivo,
    totalCursosSeleccionados,
    copiado,
    modalGuardar,
    setModalGuardar,
    nombreFavorito,
    setNombreFavorito,
    modalInfo,
    setModalInfo,
    obtenerCurso,
    handleAbrirDetalle,
    handleCopiarEnlace,
    handleGuardarFavorito,
  } = useHorarioPage();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header totalCursosSeleccionados={totalCursosSeleccionados} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Vista de Horario Semanal 📅
              </h1>
              {dataParam && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md">
                  🔗 Cargado desde Enlace
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {horarioActivo
                ? `${horarioActivo.secciones_elegidas.length} cursos • Huecos: ${horarioActivo.horas_hueco} hrs • Cruces comida: ${horarioActivo.horas_comida} hrs • Puntaje Profes: +${horarioActivo.puntaje_docente} pts`
                : 'No has seleccionado ningún horario todavía.'}
            </p>
          </div>

          {horarioActivo && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopiarEnlace}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm ${
                  copiado
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}
              >
                <span>{copiado ? '✓ ¡Enlace Copiado!' : '🔗 Compartir Horario'}</span>
              </button>

              <button
                onClick={() => {
                  setNombreFavorito(`Mi Horario #${horarioActivo.id} (${horarioActivo.horas_hueco}h hueco)`);
                  setModalGuardar(true);
                }}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>⭐ Guardar en Favoritos</span>
              </button>

              <Link
                to="/horario/editar"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>✏️ Editar Horario</span>
              </Link>
            </div>
          )}
        </div>

        {horarioActivo ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px] text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white border-b border-slate-800">
                      <th className="py-3 px-3 w-28 text-center font-bold border-r border-slate-800">
                        Bloque
                      </th>
                      {DIAS.map((dia) => (
                        <th key={dia.orden} className="py-3 px-2 text-center font-bold border-r border-slate-800/50">
                          {dia.nombre}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HORAS.map((hora) => (
                      <tr key={hora.orden} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2 px-2 text-center font-mono font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-200 text-[10px]">
                          <span className="block font-bold text-slate-700">#{hora.orden}</span>
                          <span>{hora.nombre}</span>
                        </td>

                        {DIAS.map((dia) => {
                          const celda: CeldaMatriz | null =
                            horarioActivo.matriz_horas?.[dia.orden]?.[hora.orden] || null;

                          const cursoObj = celda ? obtenerCurso(celda.curso_id) : null;
                          const siglas = cursoObj?.SIGLAS || celda?.curso_nombre || '';
                          const color = cursoObj?.color || '#4F46E5';

                          return (
                            <td
                              key={`${dia.orden}-${hora.orden}`}
                              className="p-1 border-r border-slate-100 align-top h-14"
                            >
                              {celda && (
                                <button
                                  type="button"
                                  onClick={() => handleAbrirDetalle(celda.curso_id, celda)}
                                  className="w-full text-left p-1.5 rounded-lg text-white font-sans text-[10px] leading-tight space-y-0.5 shadow-sm transition-all hover:scale-[1.03] hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900"
                                  style={{ backgroundColor: color }}
                                  title="Haz clic para ver más información"
                                >
                                  <div className="flex justify-between items-center font-black">
                                    <span className="truncate">{siglas}</span>
                                    <span className="text-[9px] bg-black/20 px-1 rounded ml-1 shrink-0">
                                      {celda.tipo} {celda.seccion_nombre}
                                    </span>
                                  </div>
                                  {celda.aula && (
                                    <div className="text-[9px] opacity-90 truncate font-mono">
                                      📍 {celda.aula}
                                    </div>
                                  )}
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>📚 Secciones Asignadas ({horarioActivo.secciones_elegidas.length})</span>
                <span className="text-[11px] font-normal text-slate-400">Haz clic en un curso para ver más detalle</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {horarioActivo.secciones_elegidas.map((sec) => {
                  const cursoObj = obtenerCurso(sec.curso_id);
                  if (!cursoObj) return null;

                  const teoObj = sec.seccion_teo_id
                    ? Object.values(cursoObj.seccion_teo || {}).find((s) => s.id === sec.seccion_teo_id)
                    : null;

                  const labObj = sec.seccion_lab_id
                    ? Object.values(cursoObj.seccion_lab || {}).find((s) => s.id === sec.seccion_lab_id)
                    : null;

                  const docenteTeo = getDocenteInfoFormat(teoObj?.id_docente);
                  const docenteLab = getDocenteInfoFormat(labObj?.id_docente);

                  return (
                    <div
                      key={sec.curso_id}
                      onClick={() => handleAbrirDetalle(sec.curso_id)}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: cursoObj.color }}
                          ></span>
                          <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {cursoObj.SIGLAS}
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {cursoObj.año_academico}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate pl-5 font-medium">
                        {cursoObj.nombre}
                      </p>

                      <div className="text-[11px] text-slate-600 space-y-1.5 pl-5 border-t border-slate-200/60 pt-2">
                        {teoObj && (
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <span className="font-bold text-slate-800">Teoría ({teoObj.seccion}):</span>
                              <div className="text-[10px] text-slate-600">{docenteTeo.nombre}</div>
                            </div>
                            <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded shrink-0">
                              {docenteTeo.etiqueta}
                            </span>
                          </div>
                        )}

                        {labObj && (
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <span className="font-bold text-slate-800">Lab ({labObj.seccion}):</span>
                              <div className="text-[10px] text-slate-600">{docenteLab.nombre}</div>
                            </div>
                            <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded shrink-0">
                              {docenteLab.etiqueta}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <div className="text-4xl">📅</div>
            <h3 className="text-base font-bold text-slate-800">No hay ningún horario activo en pantalla</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Primero debes generar combinaciones de horarios y seleccionar uno para visualizar su matriz semanal aquí.
            </p>
            <Link
              to="/generar"
              className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              🚀 Generar Horarios
            </Link>
          </div>
        )}

        {modalInfo && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: modalInfo.curso.color }}
                    ></span>
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-mono">
                      {modalInfo.curso.SIGLAS}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {modalInfo.curso.año_academico}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {modalInfo.curso.nombre}
                  </h3>
                </div>

                <button
                  onClick={() => setModalInfo(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-lg leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Horas Teoría</span>
                  <span className="font-black text-slate-800 text-sm">{modalInfo.curso.horas_teo} hrs</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Horas Laboratorio</span>
                  <span className="font-black text-slate-800 text-sm">{modalInfo.curso.horas_lab} hrs</span>
                </div>
              </div>

              {modalInfo.seccionTeo && (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-indigo-900">
                      📖 Sección Teoría: {modalInfo.seccionTeo.seccion}
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-md">
                      ID: {modalInfo.seccionTeo.id}
                    </span>
                  </div>

                  {(() => {
                    const doc = getDocenteInfoFormat(modalInfo.seccionTeo.id_docente);
                    return (
                      <div className="text-xs text-slate-700 space-y-1">
                        <p className="font-medium">{doc.nombre}</p>
                        <p className="text-[10px] text-slate-500">
                          Evaluación Docente: <span className="font-bold text-slate-800">{doc.etiqueta}</span>
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {modalInfo.seccionLab && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-emerald-900">
                      🧪 Sección Laboratorio: {modalInfo.seccionLab.seccion}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                      ID: {modalInfo.seccionLab.id}
                    </span>
                  </div>

                  {(() => {
                    const doc = getDocenteInfoFormat(modalInfo.seccionLab.id_docente);
                    return (
                      <div className="text-xs text-slate-700 space-y-1">
                        <p className="font-medium">{doc.nombre}</p>
                        <p className="text-[10px] text-slate-500">
                          Evaluación Docente: <span className="font-bold text-slate-800">{doc.etiqueta}</span>
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {modalInfo.celdaOrigen && (
                <div className="bg-slate-100 p-3 rounded-xl text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Bloque Seleccionado en Matriz
                  </span>
                  <p className="font-semibold text-slate-800">
                    Tipo: {modalInfo.celdaOrigen.tipo} | Sección: {modalInfo.celdaOrigen.seccion_nombre}
                  </p>
                  <p className="text-slate-600 font-mono text-[11px]">
                    📍 Aula: {modalInfo.celdaOrigen.aula || 'No especificada'}
                  </p>
                </div>
              )}

              <button
                onClick={() => setModalInfo(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {modalGuardar && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Guardar en Favoritos</h3>
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
                  onClick={handleGuardarFavorito}
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