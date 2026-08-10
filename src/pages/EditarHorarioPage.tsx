import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TODOS_LOS_CURSOS } from '../data/cursos';
import { getDocenteInfoFormat } from '../services/docenteService';
import { DIAS, HORAS } from '../data/constantes';
import { useEditarHorario } from '../hooks/useEditarHorario';

export const EditarHorarioPage: React.FC = () => {
  const {
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
  } = useEditarHorario();

  if (!horarioInicial) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans justify-between">
        <Header totalCursosSeleccionados={totalCursosSeleccionados} />
        <main className="max-w-md mx-auto p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm my-12">
          <p className="text-sm font-bold text-slate-800">No hay ningún horario seleccionado para editar.</p>
          <Link
            to="/generar"
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
          >
            Ir a Generar Horarios
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header totalCursosSeleccionados={totalCursosSeleccionados} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Editor de Horario Manual ✏️
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Modifica las secciones asignadas y observa la matriz actualizarse en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/horario')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={cruces.length > 0}
              className={`px-5 py-2.5 font-bold text-xs rounded-xl transition-all shadow-sm ${cruces.length > 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
            >
              💾 Guardar Cambios
            </button>
          </div>
        </div>

        {cruces.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs space-y-1 text-rose-800 font-medium">
            <p className="font-black text-rose-900 flex items-center gap-1">
              ⚠️ Se detectaron cruces de horario ({cruces.length}):
            </p>
            <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px]">
              {cruces.map((cruce, idx) => (
                <li key={idx}>{cruce}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                ⚙️ Ajuste de Secciones
              </h2>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {seccionesEditables.map((sec) => {
                  const curso = TODOS_LOS_CURSOS.find((c) => c.id === sec.curso_id);
                  if (!curso) return null;

                  const opcionesTeo = Object.values(curso.seccion_teo || {});
                  const opcionesLab = Object.values(curso.seccion_lab || {});

                  return (
                    <div
                      key={sec.curso_id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: curso.color }}
                        ></span>
                        <h3 className="text-xs font-black text-slate-800">
                          {curso.SIGLAS} - <span className="font-normal text-slate-600">{curso.nombre}</span>
                        </h3>
                      </div>

                      {opcionesTeo.length > 0 && (
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">
                            Teoría:
                          </label>
                          <select
                            value={sec.seccion_teo_id || ''}
                            onChange={(e) =>
                              handleCambiarSeccion(
                                sec.curso_id,
                                'seccion_teo_id',
                                e.target.value ? Number(e.target.value) : undefined
                              )
                            }
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          >
                            {opcionesTeo.map((t) => {
                              const docInfo = getDocenteInfoFormat(t.id_docente);
                              return (
                                <option key={t.id} value={t.id}>
                                  Sección {t.seccion} ({docInfo.nombre})
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}

                      {opcionesLab.length > 0 && (
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">
                            Laboratorio / Práctica:
                          </label>
                          <select
                            value={sec.seccion_lab_id || ''}
                            onChange={(e) =>
                              handleCambiarSeccion(
                                sec.curso_id,
                                'seccion_lab_id',
                                e.target.value ? Number(e.target.value) : undefined
                              )
                            }
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          >
                            {opcionesLab.map((l) => {
                              const docInfo = getDocenteInfoFormat(l.id_docente);
                              return (
                                <option key={l.id} value={l.id}>
                                  Grupo {l.seccion} ({docInfo.nombre})
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">Vista Previa Dinámica</span>
                <div className="flex gap-3 text-slate-500 font-medium">
                  <span>Huecos: <strong className="text-slate-800">{horasHueco}h</strong></span>
                  <span>Días Comida: <strong className="text-slate-800">{diasConComida}/5</strong></span>
                  <span>Puntaje Profes: <strong className="text-slate-800">+{puntajeDocente}</strong></span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[600px] text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white border-b border-slate-800">
                      <th className="py-2.5 px-2 w-20 text-center font-bold border-r border-slate-800">
                        Bloque
                      </th>
                      {DIAS.map((dia) => (
                        <th key={dia.orden} className="py-2.5 px-2 text-center font-bold border-r border-slate-800/50">
                          {dia.nombre}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HORAS.map((hora) => (
                      <tr key={hora.orden} className="border-b border-slate-100">
                        <td className="py-1.5 px-2 text-center font-mono font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-200 text-[10px]">
                          #{hora.orden}
                        </td>

                        {DIAS.map((dia) => {
                          const celda = matrizReconstruida?.[dia.orden]?.[hora.orden];
                          const cursoObj = celda ? TODOS_LOS_CURSOS.find((c) => c.id === celda.curso_id) : null;

                          return (
                            <td key={`${dia.orden}-${hora.orden}`} className="p-1 border-r border-slate-100 align-top h-12">
                              {celda && (
                                <div
                                  className={`p-1.5 rounded-lg text-white font-sans text-[10px] leading-tight space-y-0.5 shadow-sm ${celda.esCruce ? 'bg-rose-600 animate-pulse' : ''
                                    }`}
                                  style={{ backgroundColor: celda.esCruce ? undefined : cursoObj?.color || '#4F46E5' }}
                                >
                                  <div className="flex justify-between items-center font-black">
                                    <span className="truncate">{celda.curso_nombre}</span>
                                    <span className="text-[9px] bg-black/20 px-1 rounded ml-1 shrink-0">
                                      {celda.tipo} {celda.seccion_nombre}
                                    </span>
                                  </div>
                                </div>
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};