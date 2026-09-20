import React from 'react';
import type { Hora } from '../../types';

interface AlmuerzoSelectorProps {
  horaAlmuerzo: number[];
  onChangeAlmuerzo: (horas: number[]) => void;
  horas: Hora[];
}

export const AlmuerzoSelector: React.FC<AlmuerzoSelectorProps> = ({
  horaAlmuerzo,
  onChangeAlmuerzo,
  horas,
}) => {
  const toggleBloque = (orden: number) => {
    const existe = horaAlmuerzo.includes(orden);
    if (existe) {
      onChangeAlmuerzo(horaAlmuerzo.filter((h) => h !== orden));
    } else {
      onChangeAlmuerzo([...horaAlmuerzo, orden].sort((a, b) => a - b));
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-1">2. Hora de Almuerzo</h2>
      <p className="text-xs text-slate-500 mb-4">
        Bloques libres preferidos para comer.
      </p>

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {horas.map((bloque) => {
          const isSelected = horaAlmuerzo.includes(bloque.orden);
          return (
            <button
              key={bloque.orden}
              type="button"
              onClick={() => toggleBloque(bloque.orden)}
              className={`p-2.5 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer touch-manipulation ${
                isSelected
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              🍔 {bloque.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
};