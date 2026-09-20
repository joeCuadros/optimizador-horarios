import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CursosSelector } from '../components/config/CursosSelector';
import { AlmuerzoSelector } from '../components/config/AlmuerzoSelector';
import { MaxChoquesSelector } from '../components/config/MaxChoquesSelector';
import { HorasBloqueadasGrid } from '../components/config/HorasBloqueadasGrid';

import { DIAS, HORAS } from '../data/constantes';
import { CURSOS_DISPONIBLES } from '../data/cursos';
import { useConfigPage } from '../hooks/useConfigPage';

export const ConfigPage: React.FC = () => {
  const {
    estado,
    totalCursos,
    handleToggleCurso,
    handleLimpiarCursos,
    handleUpdateAlmuerzo,
    handleUpdateMaxChoques,
    handleUpdateHorasBloqueadas,
  } = useConfigPage();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header totalCursosSeleccionados={totalCursos} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Encabezado con Botón Principal */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Panel de Configuración</h1>
            <p className="text-xs text-slate-500">Selecciona asignaturas y define restricciones.</p>
          </div>
          <Link
            to="/generar"
            className="hidden sm:inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all text-center"
          >
            Generar Horarios →
          </Link>
        </div>

        {/* 1. Selector Cursos */}
        <CursosSelector
          cursosSeleccionados={estado.cursos_seleccionados}
          onToggleCurso={handleToggleCurso}
          onLimpiarCursos={handleLimpiarCursos}
          cursosDisponibles={CURSOS_DISPONIBLES}
        />

        {/* 2 y 3. Almuerzo y Choques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <AlmuerzoSelector
            horaAlmuerzo={estado.hora_almuerzo}
            onChangeAlmuerzo={handleUpdateAlmuerzo}
            horas={HORAS}
          />

          <MaxChoquesSelector
            maxChoques={estado.max_choques}
            onChangeMaxChoques={handleUpdateMaxChoques}
          />
        </div>

        {/* 4. Matriz de Horas Bloqueadas */}
        <HorasBloqueadasGrid
          horasBloqueadas={estado.horas_bloqueadas}
          onChangeHorasBloqueadas={handleUpdateHorasBloqueadas}
          dias={DIAS}
          horas={HORAS}
        />
      </main>

      {/* Botón flotante para móviles */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-md border-t border-slate-200 z-40">
        <Link
          to="/generar"
          className="block w-full bg-indigo-600 active:bg-indigo-700 text-white text-center font-bold text-sm py-3 rounded-xl shadow-lg shadow-indigo-200"
        >
          Generar Horarios ({totalCursos} cursos) →
        </Link>
      </div>

      <Footer />
    </div>
  );
};