import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useSistemaStorage } from '../hooks/useSistemaStorage';
import { useGeneradorHorarios } from '../hooks/useGeneradorHorarios';
import { TODOS_LOS_CURSOS } from '../data/cursos';
import type { HorarioGenerado } from '../types';

export const GenerarPage: React.FC = () => {
  const navigate = useNavigate();
  const [estado, setEstado] = useSistemaStorage();
  const { generar, generando, evaluados } = useGeneradorHorarios();

  // Pesos en % para el algoritmo de Ponderación Dinámica (SIEMPRE SUMAN 100%)
  const [pesoHueco, setPesoHueco] = useState<number>(100);
  const [pesoComida, setPesoComida] = useState<number>(0);
  const [pesoDocente, setPesoDocente] = useState<number>(0);

  // Toggle para mostrar/ocultar la fórmula matemática
  const [mostrarFormula, setMostrarFormula] = useState<boolean>(false);

  // Paginación (20 por página)
  const ELEMENTOS_POR_PAGINA = 20;
  const [paginaActual, setPaginaActual] = useState<number>(1);

  // Modal para guardar en favoritos
  const [nombreGuardar, setNombreGuardar] = useState<string>('');
  const [horarioAModalar, setHorarioAModalar] = useState<HorarioGenerado | null>(null);

  const totalCursosSeleccionados = Object.values(estado.cursos_seleccionados || {}).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  useEffect(() => {
    setPaginaActual(1);
  }, [pesoHueco, pesoComida, pesoDocente, estado.horarios_posibles]);

  // =========================================================================
  // CONTROLADORES DE SLIDERS PARA QUE LA SUMA SIEMPRE SEA 100%
  // =========================================================================
  const handleHuecoChange = (nuevoHueco: number) => {
    const restante = 100 - nuevoHueco;
    const sumaOtros = pesoComida + pesoDocente;

    if (sumaOtros === 0) {
      setPesoHueco(nuevoHueco);
      setPesoComida(Math.round(restante / 2));
      setPesoDocente(restante - Math.round(restante / 2));
    } else {
      const nuevaComida = Math.round((pesoComida / sumaOtros) * restante);
      const nuevoDocente = restante - nuevaComida;
      setPesoHueco(nuevoHueco);
      setPesoComida(nuevaComida);
      setPesoDocente(nuevoDocente);
    }
  };

  const handleComidaChange = (nuevaComida: number) => {
    const restante = 100 - nuevaComida;
    const sumaOtros = pesoHueco + pesoDocente;

    if (sumaOtros === 0) {
      setPesoComida(nuevaComida);
      setPesoHueco(Math.round(restante / 2));
      setPesoDocente(restante - Math.round(restante / 2));
    } else {
      const nuevoHueco = Math.round((pesoHueco / sumaOtros) * restante);
      const nuevoDocente = restante - nuevoHueco;
      setPesoComida(nuevaComida);
      setPesoHueco(nuevoHueco);
      setPesoDocente(nuevoDocente);
    }
  };

  const handleDocenteChange = (nuevoDocente: number) => {
    const restante = 100 - nuevoDocente;
    const sumaOtros = pesoHueco + pesoComida;

    if (sumaOtros === 0) {
      setPesoDocente(nuevoDocente);
      setPesoHueco(Math.round(restante / 2));
      setPesoComida(restante - Math.round(restante / 2));
    } else {
      const nuevoHueco = Math.round((pesoHueco / sumaOtros) * restante);
      const nuevaComida = restante - nuevoHueco;
      setPesoDocente(nuevoDocente);
      setPesoHueco(nuevoHueco);
      setPesoComida(nuevaComida);
    }
  };

  // =========================================================================
  // FÓRMULA DE MATCH SCORING Y ORDENAMIENTO EN TIEMPO REAL
  // =========================================================================
  const horariosRankeados = useMemo(() => {
    const lista = estado.horarios_posibles || [];
    if (lista.length === 0) return [];

    let minHueco = Infinity, maxHueco = -Infinity;
    let minComida = Infinity, maxComida = -Infinity;
    let minDocente = Infinity, maxDocente = -Infinity;

    lista.forEach((h) => {
      if (h.horas_hueco < minHueco) minHueco = h.horas_hueco;
      if (h.horas_hueco > maxHueco) maxHueco = h.horas_hueco;

      if (h.horas_comida < minComida) minComida = h.horas_comida;
      if (h.horas_comida > maxComida) maxComida = h.horas_comida;

      if (h.puntaje_docente < minDocente) minDocente = h.puntaje_docente;
      if (h.puntaje_docente > maxDocente) maxDocente = h.puntaje_docente;
    });

    const calculados = lista.map((h) => {
      const scoreHueco = maxHueco === minHueco
        ? 100
        : 100 * (1 - (h.horas_hueco - minHueco) / (maxHueco - minHueco));

      const scoreComida = maxComida === minComida
        ? 100
        : 100 * (1 - (h.horas_comida - minComida) / (maxComida - minComida));

      const scoreDocente = maxDocente === minDocente
        ? 100
        : 100 * ((h.puntaje_docente - minDocente) / (maxDocente - minDocente));

      const puntaje_final =
        ((pesoHueco / 100) * scoreHueco) +
        ((pesoComida / 100) * scoreComida) +
        ((pesoDocente / 100) * scoreDocente);

      return {
        horario: h,
        scoreTotal: Math.round(puntaje_final * 10) / 10,
        scoreHueco: Math.round(scoreHueco),
        scoreComida: Math.round(scoreComida),
        scoreDocente: Math.round(scoreDocente),
      };
    });

    return calculados.sort((a, b) => {
      if (a.horario.cantidad_choques !== b.horario.cantidad_choques) {
        return a.horario.cantidad_choques - b.horario.cantidad_choques;
      }
      return b.scoreTotal - a.scoreTotal;
    });
  }, [estado.horarios_posibles, pesoHueco, pesoComida, pesoDocente]);

  const totalPaginas = Math.ceil(horariosRankeados.length / ELEMENTOS_POR_PAGINA) || 1;
  const inicioIndice = (paginaActual - 1) * ELEMENTOS_POR_PAGINA;
  const finIndice = inicioIndice + ELEMENTOS_POR_PAGINA;

  const horariosPaginados = useMemo(() => {
    return horariosRankeados.slice(inicioIndice, finIndice);
  }, [horariosRankeados, inicioIndice, finIndice]);

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handleSeleccionarHorario = (horarioObj: HorarioGenerado) => {
    setEstado((prev) => ({ ...prev, horario_seleccionado: horarioObj }));
    navigate('/horario');
  };

  const handleConfirmarGuardar = () => {
    if (!horarioAModalar || !nombreGuardar.trim()) return;

    setEstado((prev) => ({
      ...prev,
      horarios_guardados: {
        ...(prev.horarios_guardados || {}),
        [nombreGuardar.trim()]: horarioAModalar,
      },
    }));

    setHorarioAModalar(null);
    setNombreGuardar('');
  };

  const sumaPesosActual = pesoHueco + pesoComida + pesoDocente;
  const tieneResultadosAnteriores = (estado.horarios_posibles || []).length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header totalCursosSeleccionados={totalCursosSeleccionados} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6">
        
        {/* HEADER Y GENERAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Generador de Horarios ⚡
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {totalCursosSeleccionados} cursos seleccionados • Max choques: {estado.max_choques ?? 0}
            </p>
          </div>

          <button
            onClick={generar}
            disabled={generando || totalCursosSeleccionados === 0}
            className={`px-6 py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 ${
              generando || totalCursosSeleccionados === 0
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {generando ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                <span>Procesando ({evaluados})...</span>
              </>
            ) : (
              <span>🚀 Generar Combinaciones</span>
            )}
          </button>
        </div>

        {/* INDICADOR FLOTANTE / BANNER DE PROCESAMIENTO (MANTIENE LA VISTA ANTERIOR) */}
        {generando && (
          <div className="bg-indigo-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-indigo-700 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-800 rounded-xl">
                <span className="animate-spin inline-block text-xl">⚙️</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-indigo-100">
                  {tieneResultadosAnteriores
                    ? 'Actualizando opciones de horarios...'
                    : 'Evaluando permutaciones con Backtracking...'}
                </h3>
                <p className="text-xs text-indigo-300">
                  Combinaciones analizadas: <span className="font-mono font-bold text-white">{evaluados}</span>
                </p>
              </div>
            </div>

            <div className="w-full sm:w-48 bg-indigo-950/80 rounded-full h-2 overflow-hidden border border-indigo-700">
              <div className="bg-gradient-to-r from-indigo-400 to-emerald-400 h-full w-full animate-subtle-shim"></div>
            </div>
          </div>
        )}

        {/* ESTADO INICIAL SIN RESULTADOS Y CARGANDO POR PRIMERA VEZ */}
        {generando && !tieneResultadosAnteriores && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
            <div className="inline-block p-4 bg-indigo-50 rounded-full text-indigo-600 animate-bounce">
              🧩
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Calculando tus mejores alternativas...
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Estamos filtrando cruces, optimizando tiempos muertos y clasificando según tus prioridades.
            </p>
          </div>
        )}

        {/* CONTENEDOR PRINCIPAL: CONTROLES + RESULTADOS */}
        {tieneResultadosAnteriores && (
          <div className={`space-y-6 transition-all duration-300 ${generando ? 'opacity-50 pointer-events-none select-none filter blur-[0.5px]' : 'opacity-100'}`}>
            
            {/* CONTROLES Y PRESETS */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <span>🎛️</span> Personalizar Preferencias de Prioridad
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Suma Total: {sumaPesosActual}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Los porcentajes siempre suman 100% automáticamente al mover los controles.
                  </p>
                </div>

                <button
                  onClick={() => setMostrarFormula(!mostrarFormula)}
                  className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                >
                  <span>📐</span> {mostrarFormula ? 'Ocultar Fórmula' : 'Ver Fórmula de Match'}
                </button>
              </div>

              {/* PRESETS EXACTOS AL 100% */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Presets Rápidos (Suma 100%):
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => { setPesoHueco(100); setPesoComida(0); setPesoDocente(0); }}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                      pesoHueco === 100 && pesoComida === 0 && pesoDocente === 0
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ⏳ Menos Huecos (100% / 0% / 0%)
                  </button>

                  <button
                    onClick={() => { setPesoHueco(0); setPesoComida(0); setPesoDocente(100); }}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                      pesoHueco === 0 && pesoComida === 0 && pesoDocente === 100
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    👨‍🏫 Mejores Profes (0% / 0% / 100%)
                  </button>

                  <button
                    onClick={() => { setPesoHueco(0); setPesoComida(100); setPesoDocente(0); }}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                      pesoHueco === 0 && pesoComida === 100 && pesoDocente === 0
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    🍱 Hora de Almuerzo (0% / 100% / 0%)
                  </button>

                  <button
                    onClick={() => { setPesoHueco(34); setPesoComida(33); setPesoDocente(33); }}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                      pesoHueco === 34 && pesoComida === 33 && pesoDocente === 33
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ⚖️ Equilibrado (34% / 33% / 33%)
                  </button>

                  <button
                    onClick={() => { setPesoHueco(50); setPesoComida(0); setPesoDocente(50); }}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                      pesoHueco === 50 && pesoComida === 0 && pesoDocente === 50
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    🔥 Profe + Sin Huecos (50% / 0% / 50%)
                  </button>

                  <button
                    onClick={() => { setPesoHueco(0); setPesoComida(50); setPesoDocente(50); }}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                      pesoHueco === 0 && pesoComida === 50 && pesoDocente === 50
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ⭐ Profe + Almuerzo (0% / 50% / 50%)
                  </button>

                  <button
                    onClick={() => { setPesoHueco(50); setPesoComida(50); setPesoDocente(0); }}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                      pesoHueco === 50 && pesoComida === 50 && pesoDocente === 0
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ☕ Modo Relax (50% / 50% / 0%)
                  </button>
                </div>
              </div>

              {/* SLIDERS QUE AUTO-BALANCEAN A 100% */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">⏳ Horas Hueco</span>
                    <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {pesoHueco}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={pesoHueco}
                    onChange={(e) => handleHuecoChange(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">🍱 Almuerzo Libre</span>
                    <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                      {pesoComida}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={pesoComida}
                    onChange={(e) => handleComidaChange(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">👨‍🏫 Nota Docente</span>
                    <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {pesoDocente}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={pesoDocente}
                    onChange={(e) => handleDocenteChange(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* SECCIÓN FÓRMULA DIRECTA */}
              {mostrarFormula && (
                <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-200 space-y-3 font-mono text-xs border border-slate-800 shadow-inner">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-amber-400 font-bold">
                      📐 Fórmula Directa del Puntaje Final (Match %)
                    </span>
                    <span className="text-[10px] bg-slate-800 text-emerald-400 font-bold px-2 py-0.5 rounded">
                      ∑ Pesos = 100%
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px] leading-relaxed text-slate-300">
                    <p>
                      Las variables se normalizan a escala 0 - 100 y luego se multiplica por su porcentaje:
                    </p>

                    <div className="bg-slate-950 p-3 rounded-lg text-emerald-300 font-bold border border-slate-800 text-xs text-center">
                      puntaje_final = ({pesoHueco}% × score_hueco) + ({pesoComida}% × score_comida) + ({pesoDocente}% × score_docente)
                    </div>

                    <p className="text-[10px] text-slate-400">
                      * Nota: score_hueco y score_comida valen 100 cuando la opción es perfecta (0 horas perdidas).
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* LISTADO DE RESULTADOS PAGINADO */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-600">
                  Mostrando <span className="font-bold text-slate-900">{inicioIndice + 1} - {Math.min(finIndice, horariosRankeados.length)}</span> de <span className="font-bold text-slate-900">{horariosRankeados.length}</span> opciones
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all disabled:opacity-40 bg-slate-50 text-slate-700"
                  >
                    ← Anterior
                  </button>

                  <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                    {paginaActual} / {totalPaginas}
                  </span>

                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all disabled:opacity-40 bg-slate-50 text-slate-700"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {horariosPaginados.map((item, index) => {
                  const h = item.horario;
                  const posicionGlobal = inicioIndice + index + 1;
                  const esSeleccionado = estado.horario_seleccionado?.id === h.id;

                  return (
                    <div
                      key={h.id || posicionGlobal}
                      className={`bg-white rounded-2xl border p-5 transition-all space-y-4 shadow-sm hover:shadow-md ${
                        esSeleccionado
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                            #{posicionGlobal}
                          </span>
                          {posicionGlobal === 1 && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-300">
                              🥇 Recomendado
                            </span>
                          )}
                          {h.cantidad_choques > 0 && (
                            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md border border-rose-300">
                              ⚠️ {h.cantidad_choques} choques
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-black text-indigo-600">
                            {item.scoreTotal}%
                          </div>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            Match General
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-slate-400 text-[10px] block">Horas Hueco</span>
                          <span className="font-bold text-slate-800">{h.horas_hueco} hrs</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-slate-400 text-[10px] block">Cruces Almuerzo</span>
                          <span className="font-bold text-slate-800">{h.horas_comida} hrs</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-slate-400 text-[10px] block">Puntaje Profes</span>
                          <span className="font-bold text-slate-800">+{h.puntaje_docente} pts</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 border-t border-slate-100 pt-3">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Secciones Asignadas:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {h.secciones_elegidas.map((sec) => {
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

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleSeleccionarHorario(h)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                            esSeleccionado
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          {esSeleccionado ? '✓ Horario Activo' : 'Ver en Matriz Tabla'}
                        </button>

                        <button
                          onClick={() => {
                            setHorarioAModalar(h);
                            setNombreGuardar(`Horario #${posicionGlobal} (${item.scoreTotal}%)`);
                          }}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                        >
                          ⭐
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* MODAL FAVORITOS */}
        {horarioAModalar && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Guardar Horario en Favoritos</h3>
              <div>
                <input
                  type="text"
                  value={nombreGuardar}
                  onChange={(e) => setNombreGuardar(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setHorarioAModalar(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarGuardar}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg"
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