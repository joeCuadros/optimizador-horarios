import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  totalCursosSeleccionados: number;
}

export const Header: React.FC<HeaderProps> = ({ totalCursosSeleccionados }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
        
        {/* Logo / Título */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="bg-indigo-600 text-white px-2 py-1 rounded-lg font-bold text-base sm:text-xl">
            GH
          </span>
          <h1 className="font-bold text-sm sm:text-lg hidden xs:block">Generador</h1>
        </Link>

        {/* Navegación deslizable en móviles */}
        <nav className="flex items-center gap-1 sm:gap-6 text-xs sm:text-sm font-medium overflow-x-auto py-1 scrollbar-none">
          <Link
            to="/"
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              isActive('/')
                ? 'bg-indigo-600/20 text-indigo-400 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Config
          </Link>
          <Link
            to="/generar"
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              isActive('/generar')
                ? 'bg-indigo-600/20 text-indigo-400 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Generar
          </Link>
          <Link
            to="/horario"
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              isActive('/horario')
                ? 'bg-indigo-600/20 text-indigo-400 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Horario
          </Link>
          <Link
            to="/horario/fav"
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              isActive('/horario/fav')
                ? 'bg-indigo-600/20 text-indigo-400 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Favoritos
          </Link>
        </nav>

        {/* Badge contador */}
        <div className="shrink-0">
          <span className="bg-slate-800 text-indigo-300 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full border border-slate-700">
            {totalCursosSeleccionados} <span className="hidden sm:inline">cursos</span>
          </span>
        </div>

      </div>
    </header>
  );
};