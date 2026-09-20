import React from 'react';

interface MaxChoquesSelectorProps {
  maxChoques: number;
  onChangeMaxChoques: (val: number) => void;
}

export const MaxChoquesSelector: React.FC<MaxChoquesSelectorProps> = ({
  maxChoques,
  onChangeMaxChoques,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = parseInt(e.target.value, 10);
    onChangeMaxChoques(isNaN(valor) || valor < 0 ? 0 : valor);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-1">3. Límite de Choques</h2>
      <p className="text-xs text-slate-500 mb-4">
        Permitir cruces de horario (0 = Cruce cero).
      </p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="number"
            min={0}
            value={maxChoques}
            onChange={handleChange}
            className="w-full sm:w-28 p-2.5 text-center text-base font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-600">
          {maxChoques === 0 ? 'Generará solo horarios limpios' : `Permite hasta ${maxChoques} cruce(s)`}
        </span>
      </div>
    </div>
  );
};