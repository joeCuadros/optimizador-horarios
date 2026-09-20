import { useState, useMemo, useEffect } from 'react';

export const usePaginacion = <T>(lista: T[], elementosPorPagina: number = 10) => {
  const [paginaActual, setPaginaActual] = useState<number>(1);

  const totalPaginas = Math.ceil(lista.length / elementosPorPagina) || 1;

  // Reset a página 1 cuando la lista o sus elementos cambien
  useEffect(() => {
    setPaginaActual(1);
  }, [lista.length]);

  // Corta la lista para renderizar solo el fragmento visible
  const listaPaginada = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    const fin = inicio + elementosPorPagina;
    return lista.slice(inicio, fin);
  }, [lista, paginaActual, elementosPorPagina]);

  // Genera rango visible: [-2, -1, actual, +1, +2]
  const paginasVisibles = useMemo(() => {
    const paginas: number[] = [];
    const inicio = Math.max(1, paginaActual - 2);
    const fin = Math.min(totalPaginas, paginaActual + 2);

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }, [paginaActual, totalPaginas]);

  const irAPagina = (pagina: number) => {
    const num = Math.max(1, Math.min(pagina, totalPaginas));
    setPaginaActual(num);
  };

  const paginaSiguiente = () => irAPagina(paginaActual + 1);
  const paginaAnterior = () => irAPagina(paginaActual - 1);

  return {
    listaPaginada,
    paginaActual,
    totalPaginas,
    paginasVisibles,
    irAPagina,
    paginaSiguiente,
    paginaAnterior,
    setPaginaActual,
  };
};