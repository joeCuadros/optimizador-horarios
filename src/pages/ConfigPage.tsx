import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CursosSelector } from '../components/config/CursosSelector';
import { AlmuerzoSelector } from '../components/config/AlmuerzoSelector';
import { MaxChoquesSelector } from '../components/config/MaxChoquesSelector';
import { HorasBloqueadasGrid } from '../components/config/HorasBloqueadasGrid';

import { DIAS, HORAS } from '../data/constantes';
import sistemas5Data from '../data/sistemas 5 año.json';

import { useSistemaStorage } from '../hooks/useSistemaStorage';
import type { Curso } from '../types';

const CURSOS_DISPONIBLES: Record<string, Curso[]> = {
  "sistemas_5_año": sistemas5Data.cursos as unknown as Curso[]
};

export const ConfigPage: React.FC = () => {
  const [estado, setEstado] = useSistemaStorage();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const presetParam = searchParams.get('preset');

    const estaVacio = Object.keys(estado.cursos_seleccionados).length === 0;

    if (estaVacio) {
      if (presetParam && CURSOS_DISPONIBLES[presetParam]) {
        const ids = CURSOS_DISPONIBLES[presetParam].map((c) => c.id);
        setEstado((prev) => ({
          ...prev,
          cursos_seleccionados: { [presetParam]: ids },
        }));
      }
    }
  }, []);

  const handleToggleCurso = (grupo: string, cursoId: number) => {
    setEstado((prev) => {
      const listaGrupo = prev.cursos_seleccionados[grupo] || [];
      const existe = listaGrupo.includes(cursoId);
      const nuevaLista = existe
        ? listaGrupo.filter((id) => id !== cursoId)
        : [...listaGrupo, cursoId];

      return {
        ...prev,
        cursos_seleccionados: {
          ...prev.cursos_seleccionados,
          [grupo]: nuevaLista,
        },
      };
    });
  };

  const handleLimpiarCursos = () => {
    setEstado((prev) => ({ ...prev, cursos_seleccionados: {} }));
  };

  const totalCursos = Object.values(estado.cursos_seleccionados).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

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
            onChangeAlmuerzo={(hora_almuerzo) =>
              setEstado((prev) => ({ ...prev, hora_almuerzo }))
            }
            horas={HORAS}
          />

          <MaxChoquesSelector
            maxChoques={estado.max_choques}
            onChangeMaxChoques={(max_choques) =>
              setEstado((prev) => ({ ...prev, max_choques }))
            }
          />
        </div>

        {/* 4. Matriz de Horas Bloqueadas */}
        <HorasBloqueadasGrid
          horasBloqueadas={estado.horas_bloqueadas}
          onChangeHorasBloqueadas={(horas_bloqueadas) =>
            setEstado((prev) => ({ ...prev, horas_bloqueadas }))
          }
          dias={DIAS}
          horas={HORAS}
        />
      </main>

      {/* Botón flotante pegado al pie de pantalla (solo móvil) */}
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