import React from 'react';
import type { Curso } from '../../types';

interface CursosSelectorProps {
  cursosSeleccionados: Record<string, number[]>;
  onToggleCurso: (grupo: string, cursoId: number) => void;
  onLimpiarCursos: () => void;
  cursosDisponibles: Record<string, Curso[]>;
}

export const CursosSelector: React.FC<CursosSelectorProps> = ({
  cursosSeleccionados,
  onToggleCurso,
  onLimpiarCursos,
  cursosDisponibles,
}) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">1. Selecciona tus Cursos</h2>
          <p className="text-xs text-slate-500">Marca las asignaturas que llevarás este ciclo.</p>
        </div>
        <button
          type="button"
          onClick={onLimpiarCursos}
          className="w-full sm:w-auto text-center text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg border border-red-200 transition-colors cursor-pointer"
        >
          Limpiar Selección
        </button>
      </div>

      <div className="space-y-5">
        {Object.entries(cursosDisponibles).map(([grupo, cursos]) => {
          const seleccionadosEnGrupo = cursosSeleccionados[grupo] || [];

          return (
            <div key={grupo} className="border-t border-slate-100 pt-4">
              <h3 className="text-xs sm:text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">
                {grupo}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {cursos.map((curso) => {
                  const isSelected = seleccionadosEnGrupo.includes(curso.id);
                  return (
                    <label
                      key={curso.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer select-none transition-all touch-manipulation ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/60 text-indigo-950 font-medium'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleCurso(grupo, curso.id)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 shrink-0"
                        />
                        <span
                          className="text-[10px] font-bold text-white px-2 py-0.5 rounded shrink-0"
                          style={{ backgroundColor: curso.color }}
                        >
                          {curso.SIGLAS}
                        </span>
                        <span className="text-xs truncate">{curso.nombre}</span>
                      </div>
                      <a
                        href={`/cursos/${curso.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 underline ml-2 shrink-0 p-1"
                      >
                        Ver
                      </a>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};