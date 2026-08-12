import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { useSistemaStorage } from './useSistemaStorage';
import { TODOS_LOS_CURSOS } from '../data/cursos';
import { comprimirHorario, descomprimirHorario } from '../utils/scheduleCompress';
import type { HorarioGenerado, CeldaMatriz, Curso, Seccion } from '../types';

export interface ModalDetalleInfo {
  curso: Curso;
  seccionTeo?: Seccion;
  seccionLab?: Seccion;
  celdaOrigen?: CeldaMatriz;
}

export const useHorarioPage = () => {
  const [searchParams] = useSearchParams();
  const [estado, setEstado] = useSistemaStorage();

  const [copiado, setCopiado] = useState<boolean>(false);
  const [exportandoImg, setExportandoImg] = useState<boolean>(false);
  const [modalGuardar, setModalGuardar] = useState<boolean>(false);
  const [nombreFavorito, setNombreFavorito] = useState<string>('');
  const [modalInfo, setModalInfo] = useState<ModalDetalleInfo | null>(null);

  // Referencia al contenedor oculto diseñado exclusivamente para exportación HD
  const tablaExportRef = useRef<HTMLDivElement | null>(null);

  const dataParam = searchParams.get('data');

  const horarioURL = useMemo(() => {
    if (!dataParam) return null;
    return descomprimirHorario(dataParam);
  }, [dataParam]);

  const horarioActivo: HorarioGenerado | null = horarioURL || estado.horario_seleccionado || null;

  const totalCursosSeleccionados = Object.values(estado.cursos_seleccionados || {}).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  useEffect(() => {
    if (horarioURL && (!estado.horario_seleccionado || estado.horario_seleccionado.id !== horarioURL.id)) {
      setEstado((prev) => ({
        ...prev,
        horario_seleccionado: horarioURL,
      }));
    }
  }, [horarioURL]);

  const obtenerCurso = (cursoId: number): Curso | undefined => {
    return TODOS_LOS_CURSOS.find((c) => c.id === cursoId);
  };

  const handleAbrirDetalle = (cursoId: number, celda?: CeldaMatriz) => {
    const cursoObj = obtenerCurso(cursoId);
    if (!cursoObj) return;

    const seleccion = horarioActivo?.secciones_elegidas.find((s) => s.curso_id === cursoId);

    const seccionTeo = seleccion?.seccion_teo_id
      ? Object.values(cursoObj.seccion_teo || {}).find((s) => s.id === seleccion.seccion_teo_id)
      : undefined;

    const seccionLab = seleccion?.seccion_lab_id
      ? Object.values(cursoObj.seccion_lab || {}).find((s) => s.id === seleccion.seccion_lab_id)
      : undefined;

    setModalInfo({
      curso: cursoObj,
      seccionTeo,
      seccionLab,
      celdaOrigen: celda,
    });
  };

  const handleCopiarEnlace = () => {
    if (!horarioActivo) return;

    const compressed = comprimirHorario(horarioActivo);
    const shareUrl = `${window.location.origin}/horario?data=${compressed}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    });
  };

  const handleGuardarFavorito = () => {
    if (!horarioActivo || !nombreFavorito.trim()) return;

    setEstado((prev) => ({
      ...prev,
      horarios_guardados: {
        ...(prev.horarios_guardados || {}),
        [nombreFavorito.trim()]: horarioActivo,
      },
    }));

    setModalGuardar(false);
    setNombreFavorito('');
  };

  // Función para capturar el nodo HD oculto sin afectar la vista del usuario
  const handleDescargarImagen = async () => {
    if (!tablaExportRef.current || !horarioActivo) return;

    try {
      setExportandoImg(true);

      const dataUrl = await toPng(tablaExportRef.current, {
        cacheBust: true,
        quality: 1.0,
        pixelRatio: 2, // Calidad Retina/HD
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `Horario_${horarioActivo.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error al generar la imagen PNG del horario:', error);
    } finally {
      setExportandoImg(false);
    }
  };

  return {
    dataParam,
    horarioActivo,
    totalCursosSeleccionados,
    copiado,
    exportandoImg,
    modalGuardar,
    setModalGuardar,
    nombreFavorito,
    setNombreFavorito,
    modalInfo,
    setModalInfo,
    tablaExportRef,
    obtenerCurso,
    handleAbrirDetalle,
    handleCopiarEnlace,
    handleGuardarFavorito,
    handleDescargarImagen,
  };
};