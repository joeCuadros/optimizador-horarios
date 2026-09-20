import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 mt-12 pb-20 sm:pb-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs">
        <p>© {new Date().getFullYear()} Generador de Horarios Universitarios</p>
      </div>
    </footer>
  );
};