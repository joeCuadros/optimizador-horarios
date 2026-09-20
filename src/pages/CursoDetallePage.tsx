import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { DIAS, HORAS } from '../data/constantes';
import { getDocenteInfoFormat } from '../services/docenteService';
import { useCursoDetalle } from '../hooks/useCursoDetalle';
import type { Seccion } from '../types';

export const CursoDetallePage: React.FC = () => {
  const {
    curso,
    totalCursos,
    modoMatriz,
    setModoMatriz,
    seccionesTeoList,
    seccionesLabList,
    selectedTeoId,
    setSelectedTeoId,
    selectedLabId,
    setSelectedLabId,
    isTeoFijada,
    isLabFijada,
    seccionTeoSeleccionada,
    seccionLabSeleccionada,
    matrizPreview,
    handleToggleFijarTeo,
    handleToggleFijarLab,
    fijadaTeoId,
    fijadaLabId,
  } = useCursoDetalle();

  if (!curso) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header totalCursosSeleccionados={totalCursos} />
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 text-center">
          <h2 className="text-xl font-bold text-slate-800">Curso no encontrado</h2>
          <Link to="/" className="text-indigo-600 underline text-sm mt-4 inline-block font-bold">
            ← Volver a Configuración
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const getNombreDia = (orden: number) => DIAS.find((d) => d.orden === orden)?.nombre || `Día ${orden}`;
  const getNombreHora = (orden: number) => HORAS.find((h) => h.orden === orden)?.nombre || `Bloque ${orden}`;

  const renderDocenteBadge = (idDocente: number) => {
    const docInfo = getDocenteInfoFormat(idDocente);

    const configStyle: Record<number, string> = {
      2: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      1: 'bg-green-100 text-green-800 border-green-300',
      0: 'bg-slate-100 text-slate-700 border-slate-300',
      '-1': 'bg-amber-100 text-amber-800 border-amber-300',
      '-2': 'bg-rose-100 text-rose-800 border-rose-300',
    };

    const style = configStyle[docInfo.peso] || configStyle[0];

    return (
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span className="font-semibold text-slate-800 text-xs">{docInfo.nombre}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-md border font-bold ${style}`}>
          {docInfo.etiqueta}
        </span>
      </div>
    );
  };

  const renderListaHorarios = (seccionObj?: Seccion) => {
    if (!seccionObj || !seccionObj.lista_horas || seccionObj.lista_horas.length === 0) {
      return <p className="text-xs text-slate-400">Sin horarios asignados</p>;
    }

    return (
      <div className="space-y-2 mt-2">
        {seccionObj.aula && (
          <div className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md inline-block">
            📍 Aula: {seccionObj.aula}
          </div>
        )}
        <ul className="space-y-1.5">
          {seccionObj.lista_horas.map((h, idx) => (
            <li key={idx} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-md flex justify-between items-center font-mono">
              <span className="font-bold text-slate-900">{getNombreDia(h.dia_orden)}</span>
              <span>{getNombreHora(h.hora_orden)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header totalCursosSeleccionados={totalCursos} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6">
        <div>
          <Link to="/" className="text-xs text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 mb-3">
            ← Volver a Configuración
          </Link>
          
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <span
                className="text-white text-xs sm:text-sm font-black px-3 py-1.5 rounded-lg shrink-0 shadow-sm font-mono"
                style={{ backgroundColor: curso.color }}
              >
                {curso.SIGLAS}
              </span>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-slate-900">{curso.nombre}</h1>
                <p className="text-xs text-slate-500">
                  {curso.año_academico} • ID: {curso.id}
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
              <span className="flex-1 sm:flex-none text-center bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-100">
                Teoría: {curso.horas_teo} hrs
              </span>
              <span className="flex-1 sm:flex-none text-center bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-100">
                Lab: {curso.horas_lab} hrs
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                🗓️ Vista Previa Gráfica Completa
              </h2>
              <p className="text-xs text-slate-500">
                Compara fácilmente los bloques asignados contra la imagen o silabo oficial.
              </p>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold w-full sm:w-auto">
              <button
                onClick={() => setModoMatriz('todos')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-all ${
                  modoMatriz === 'todos'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas las Secciones ({seccionesTeoList.length + seccionesLabList.length})
              </button>
              <button
                onClick={() => setModoMatriz('seleccion')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-all ${
                  modoMatriz === 'seleccion'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Solo Selección Actual
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="flex items-center gap-1.5 text-indigo-800">
              <span className="w-3 h-3 rounded bg-indigo-600 inline-block"></span>
              Secciones Teoría (TEO)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-3 h-3 rounded bg-emerald-600 inline-block"></span>
              Secciones Laboratorio (LAB)
            </span>
            <span className="text-slate-400 font-normal text-[11px] ml-auto">
              💡 Las secciones resaltadas con borde grueso corresponden a tu selección actual.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px] text-xs">
              <thead>
                <tr className="bg-slate-900 text-white border-b border-slate-800">
                  <th className="py-2.5 px-2 w-28 text-center font-bold border-r border-slate-800">
                    Bloque / Hora
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
                  <tr key={hora.orden} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-1.5 px-2 text-center font-mono font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-200 text-[12px]">
                      <span className="block font-bold text-slate-800">{hora.nombre}</span>
                    </td>

                    {DIAS.map((dia) => {
                      const items = matrizPreview[dia.orden]?.[hora.orden] || [];

                      return (
                        <td
                          key={`${dia.orden}-${hora.orden}`}
                          className="p-1 border-r border-slate-100 align-top min-h-[50px]"
                        >
                          {items.length > 0 && (
                            <div className="flex flex-col gap-1">
                              {items.map((it, idx) => {
                                const esTeo = it.tipo === 'TEO';
                                return (
                                  <div
                                    key={idx}
                                    className={`px-1.5 py-1 rounded text-white font-mono text-[10px] font-bold text-center shadow-sm border ${
                                      esTeo
                                        ? it.esSeleccionado
                                          ? 'bg-indigo-600 border-indigo-900 ring-2 ring-indigo-400'
                                          : 'bg-indigo-500/85 border-indigo-600'
                                        : it.esSeleccionado
                                        ? 'bg-emerald-600 border-emerald-900 ring-2 ring-emerald-400'
                                        : 'bg-emerald-500/85 border-emerald-600'
                                    }`}
                                  >
                                    <div>{it.tipo} {it.seccion}</div>
                                    {it.aula && (
                                      <div className="text-[9px] opacity-90 truncate font-normal">
                                        📍 {it.aula}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-4 sm:p-6 rounded-xl border bg-white transition-all ${
            isTeoFijada ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                Sección de Teoría
              </h2>
              {seccionesTeoList.length > 0 && (
                <button
                  onClick={handleToggleFijarTeo}
                  className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${
                    isTeoFijada 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isTeoFijada ? '📌 Fijada' : '📌 Fijar esta sección'}
                </button>
              )}
            </div>

            {seccionesTeoList.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Seleccionar sección:
                  </label>
                  <select
                    value={selectedTeoId}
                    onChange={(e) => setSelectedTeoId(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {seccionesTeoList.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        Sección {sec.seccion} (ID: {sec.id}) {sec.aula ? `- 📍 ${sec.aula}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {seccionTeoSeleccionada && (
                  <div className="border-t border-slate-100 pt-3">
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-slate-500 block mb-1">
                        Profesor Asignado:
                      </span>
                      {renderDocenteBadge(seccionTeoSeleccionada.id_docente)}
                    </div>
                    <h3 className="text-xs font-semibold text-slate-500 mt-3">
                      Horarios de Sección {seccionTeoSeleccionada.seccion}:
                    </h3>
                    {renderListaHorarios(seccionTeoSeleccionada)}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Sin secciones teóricas asignadas.</p>
            )}
          </div>

          <div className={`p-4 sm:p-6 rounded-xl border bg-white transition-all ${
            isLabFijada ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                Sección de Laboratorio
              </h2>
              {seccionesLabList.length > 0 && (
                <button
                  onClick={handleToggleFijarLab}
                  className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${
                    isLabFijada 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isLabFijada ? '📌 Fijada' : '📌 Fijar esta sección'}
                </button>
              )}
            </div>

            {seccionesLabList.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Seleccionar sección:
                  </label>
                  <select
                    value={selectedLabId}
                    onChange={(e) => setSelectedLabId(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {seccionesLabList.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        Sección {sec.seccion} (ID: {sec.id}) {sec.aula ? `- 📍 ${sec.aula}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {seccionLabSeleccionada && (
                  <div className="border-t border-slate-100 pt-3">
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-slate-500 block mb-1">
                        Profesor Asignado:
                      </span>
                      {renderDocenteBadge(seccionLabSeleccionada.id_docente)}
                    </div>
                    <h3 className="text-xs font-semibold text-slate-500 mt-3">
                      Horarios de Sección {seccionLabSeleccionada.seccion}:
                    </h3>
                    {renderListaHorarios(seccionLabSeleccionada)}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Sin secciones de laboratorio asignadas.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">Catálogo Completo de Secciones</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Teoría</h3>
              <div className="space-y-2">
                {seccionesTeoList.map((sec) => {
                  const esFijada = sec.id === fijadaTeoId;
                  return (
                    <div
                      key={sec.id}
                      className={`p-3 rounded-lg border text-xs space-y-2 ${
                        esFijada ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">
                          Sección {sec.seccion} <span className="text-slate-400 font-normal">(ID: {sec.id})</span>
                        </span>
                        {esFijada && (
                          <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded">
                            FIJADA
                          </span>
                        )}
                      </div>
                      
                      {renderDocenteBadge(sec.id_docente)}
                      {renderListaHorarios(sec)}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Laboratorio</h3>
              <div className="space-y-2">
                {seccionesLabList.map((sec) => {
                  const esFijada = sec.id === fijadaLabId;
                  return (
                    <div
                      key={sec.id}
                      className={`p-3 rounded-lg border text-xs space-y-2 ${
                        esFijada ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">
                          Sección {sec.seccion} <span className="text-slate-400 font-normal">(ID: {sec.id})</span>
                        </span>
                        {esFijada && (
                          <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
                            FIJADA
                          </span>
                        )}
                      </div>

                      {renderDocenteBadge(sec.id_docente)}
                      {renderListaHorarios(sec)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};