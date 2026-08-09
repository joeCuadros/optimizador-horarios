import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigPage } from './pages/ConfigPage';
import { CursoDetallePage } from './pages/CursoDetallePage';

// Componentes temporales para evitar errores mientras creas las demás pantallas
const GenerarPage = () => <div className="p-8">Generando Horarios...</div>;
const HorarioPage = () => <div className="p-8">Vista de Horario</div>;
const FavoritosPage = () => <div className="p-8">Horarios Favoritos</div>;
const EditarHorarioPage = () => <div className="p-8">Editar Horario</div>;

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConfigPage />} />
        <Route path="/cursos/:id" element={<CursoDetallePage />} />
        <Route path="/generar" element={<GenerarPage />} />
        <Route path="/horario" element={<HorarioPage />} />
        <Route path="/horario/fav" element={<FavoritosPage />} />
        <Route path="/horario/editar" element={<EditarHorarioPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;