import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { DIAS, HORAS } from '../data/constantes';
import { TODOS_LOS_CURSOS, DOCENTES } from '../data/cursos';
import { useSistemaStorage } from '../hooks/useSistemaStorage';
import type { Seccion, Docente } from '../types';

export const CursoDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const cursoId = Number(id);

  const [estado, setEstado] = useSistemaStorage();

  const curso = TODOS_LOS_CURSOS.find((c) => c.id === cursoId);

  const totalCursos = Object.values(estado.cursos_seleccionados || {}).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

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

  const fijadosCurso = estado.secciones_fijadas?.[cursoId];
  const fijadaTeoId = fijadosCurso?.seccion_teo_id;
  const fijadaLabId = fijadosCurso?.seccion_lab_id;

  const seccionesTeoList: Seccion[] = curso.seccion_teo ? Object.values(curso.seccion_teo) : [];
  const seccionesLabList: Seccion[] = curso.seccion_lab ? Object.values(curso.seccion_lab) : [];

  const [selectedTeoId, setSelectedTeoId] = useState<number>(
    fijadaTeoId || seccionesTeoList[0]?.id || 0
  );
  const [selectedLabId, setSelectedLabId] = useState<number>(
    fijadaLabId || seccionesLabList[0]?.id || 0
  );

  const isTeoFijada = Boolean(fijadaTeoId && fijadaTeoId === selectedTeoId);
  const isLabFijada = Boolean(fijadaLabId && fijadaLabId === selectedLabId);

  const handleToggleFijarTeo = () => {
    setEstado((prev) => {
      const prevFijadas = prev.secciones_fijadas || {};
      const actual = prevFijadas[cursoId] || {};
      return {
        ...prev,
        secciones_fijadas: {
          ...prevFijadas,
          [cursoId]: {
            ...actual,
            seccion_teo_id: isTeoFijada ? undefined : selectedTeoId,
          },
        },
      };
    });
  };

  const handleToggleFijarLab = () => {
    setEstado((prev) => {
      const prevFijadas = prev.secciones_fijadas || {};
      const actual = prevFijadas[cursoId] || {};
      return {
        ...prev,
        secciones_fijadas: {
          ...prevFijadas,
          [cursoId]: {
            ...actual,
            seccion_lab_id: isLabFijada ? undefined : selectedLabId,
          },
        },
      };
    });
  };

  const getNombreDia = (orden: number) => DIAS.find((d) => d.orden === orden)?.nombre || `Día ${orden}`;
  const getNombreHora = (orden: number) => HORAS.find((h) => h.orden === orden)?.nombre || `Bloque ${orden}`;

  // Búsqueda del docente por ID en los datos exportados
  const getDocente = (idDocente: number): Docente | undefined => {
    return DOCENTES.find((d) => d.id === idDocente);
  };

  const renderDocenteBadge = (idDocente: number) => {
    const doc = getDocente(idDocente);
    if (!doc) return <span className="text-slate-400 text-xs italic">Sin docente asignado</span>;

    const configPeso: Record<number, { label: string; style: string }> = {
      2: { label: 'Muy bueno (+2)', style: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
      1: { label: 'Bueno (+1)', style: 'bg-green-100 text-green-800 border-green-300' },
      0: { label: 'Neutral (0)', style: 'bg-slate-100 text-slate-700 border-slate-300' },
      '-1': { label: 'Malo (-1)', style: 'bg-amber-100 text-amber-800 border-amber-300' },
      '-2': { label: 'Muy malo (-2)', style: 'bg-rose-100 text-rose-800 border-rose-300' },
    };

    const rating = configPeso[doc.peso] || configPeso[0];

    return (
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span className="font-semibold text-slate-800 text-xs">👨‍🏫 {doc.nombre}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-md border font-bold ${rating.style}`}>
          {rating.label}
        </span>
      </div>
    );
  };

  const renderListaHorarios = (seccionObj?: Seccion) => {
    if (!seccionObj || !seccionObj.lista_horas || seccionObj.lista_horas.length === 0) {
      return <p className="text-xs text-slate-400">Sin horarios asignados</p>;
    }

    return (
      <ul className="space-y-1.5 mt-2">
        {seccionObj.lista_horas.map((h, idx) => (
          <li key={idx} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-md flex justify-between items-center font-mono">
            <span className="font-bold text-slate-900">{getNombreDia(h.dia_orden)}</span>
            <span>{getNombreHora(h.hora_orden)}</span>
          </li>
        ))}
      </ul>
    );
  };

  const seccionTeoSeleccionada = seccionesTeoList.find((s) => s.id === selectedTeoId);
  const seccionLabSeleccionada = seccionesLabList.find((s) => s.id === selectedLabId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header totalCursosSeleccionados={totalCursos} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6">
        
        {/* ENCABEZADO */}
        <div>
          <Link to="/" className="text-xs text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 mb-3">
            ← Volver a Configuración
          </Link>
          
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <span
                className="text-white text-xs sm:text-sm font-black px-3 py-1.5 rounded-lg shrink-0 shadow-sm"
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

        {/* CONTROLES TEORÍA Y LABORATORIO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* TEORÍA */}
          <div className={`p-4 sm:p-6 rounded-xl border bg-white transition-all ${
            isTeoFijada ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                Sección de Teoría
              </h2>
              {seccionesTeoList.length > 0 && (
                <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={isTeoFijada}
                    onChange={handleToggleFijarTeo}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className={`text-xs font-bold ${isTeoFijada ? 'text-indigo-600' : 'text-slate-600'}`}>
                    {isTeoFijada ? '📌 Fijada' : 'Fijar esta sección'}
                  </span>
                </label>
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
                        Sección {sec.seccion} (ID: {sec.id})
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

          {/* LABORATORIO */}
          <div className={`p-4 sm:p-6 rounded-xl border bg-white transition-all ${
            isLabFijada ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                Sección de Laboratorio
              </h2>
              {seccionesLabList.length > 0 && (
                <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={isLabFijada}
                    onChange={handleToggleFijarLab}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className={`text-xs font-bold ${isLabFijada ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {isLabFijada ? '📌 Fijada' : 'Fijar esta sección'}
                  </span>
                </label>
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
                        Sección {sec.seccion} (ID: {sec.id})
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

        {/* CATÁLOGO COMPLETO CON PROFESORES Y CALIFICACIÓN */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">Catálogo Completo de Secciones</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lista Teoría */}
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

            {/* Lista Laboratorio */}
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