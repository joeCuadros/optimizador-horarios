import React from 'react';
import type { Dia, Hora, HorarioSesion } from '../../types';

interface HorasBloqueadasGridProps {
  horasBloqueadas: HorarioSesion[];
  onChangeHorasBloqueadas: (horas: HorarioSesion[]) => void;
  dias: Dia[];
  horas: Hora[];
}

export const HorasBloqueadasGrid: React.FC<HorasBloqueadasGridProps> = ({
  horasBloqueadas,
  onChangeHorasBloqueadas,
  dias,
  horas,
}) => {
  const isBloqueado = (dia_orden: number, hora_orden: number) => {
    return horasBloqueadas.some(
      (hb) => hb.dia_orden === dia_orden && hb.hora_orden === hora_orden
    );
  };

  const toggleBloqueo = (dia_orden: number, hora_orden: number) => {
    if (isBloqueado(dia_orden, hora_orden)) {
      onChangeHorasBloqueadas(
        horasBloqueadas.filter(
          (hb) => !(hb.dia_orden === dia_orden && hb.hora_orden === hora_orden)
        )
      );
    } else {
      onChangeHorasBloqueadas([...horasBloqueadas, { dia_orden, hora_orden }]);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">4. Bloquear Horarios Imposibles</h2>
          <p className="text-xs text-slate-500">Toca las celdas para marcar horas ocupadas/no disponibles.</p>
        </div>
        {horasBloqueadas.length > 0 && (
          <button
            type="button"
            onClick={() => onChangeHorasBloqueadas([])}
            className="text-xs text-red-600 hover:text-red-700 underline font-medium cursor-pointer"
          >
            Desbloquear todo ({horasBloqueadas.length})
          </button>
        )}
      </div>

      <p className="text-[11px] text-amber-600 font-medium sm:hidden mb-2">
        ← Desliza horizontalmente la tabla para ver todos los días →
      </p>

      {/* Contenedor con Scroll Horizontal y 1ra Columna Pegajosa (Sticky) */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-center border-collapse min-w-[580px]">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-2 border-b border-r border-slate-200 text-[11px] font-bold text-slate-500 sticky left-0 bg-slate-100 z-10 w-28">
                Bloque
              </th>
              {dias.map((d) => (
                <th key={d.orden} className="p-2 border-b border-slate-200 text-xs font-bold text-slate-700">
                  {d.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horas.map((bloque) => (
              <tr key={bloque.orden} className="hover:bg-slate-50/50">
                {/* Hora fija a la izquierda al hacer scroll */}
                <td className="p-1.5 border-b border-r border-slate-200 text-[10px] font-mono font-bold text-slate-600 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  {bloque.nombre}
                </td>
                {dias.map((dia) => {
                  const bloqueado = isBloqueado(dia.orden, bloque.orden);
                  return (
                    <td key={dia.orden} className="p-1 border-b border-slate-100">
                      <button
                        type="button"
                        onClick={() => toggleBloqueo(dia.orden, bloque.orden)}
                        className={`w-full h-9 rounded text-[10px] font-bold transition-all cursor-pointer touch-manipulation ${
                          bloqueado
                            ? 'bg-red-500 text-white shadow-inner'
                            : 'bg-slate-100 text-transparent hover:bg-slate-200'
                        }`}
                      >
                        {bloqueado ? 'OCUPADO' : ''}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};