import type { 
  Curso, 
  Seccion, 
  Docente, 
  HorarioSesion, 
  MatrizHoras, 
  HorarioGenerado
} from '../types';

export interface GeneratorWorkerInput {
  cursosAProcesar: Curso[];
  secciones_fijadas?: Record<number, { seccion_teo_id?: number; seccion_lab_id?: number }>;
  horas_bloqueadas: HorarioSesion[];
  max_choques: number;
  hora_almuerzo: number[];
  docentes: Docente[];
}

export interface GeneratorWorkerProgress {
  tipo: 'PROGRESO';
  porcentaje: number;
  evaluados: number;
}

export interface GeneratorWorkerSuccess {
  tipo: 'EXITO';
  horarios: HorarioGenerado[];
}

export type GeneratorWorkerOutput = GeneratorWorkerProgress | GeneratorWorkerSuccess;

interface ComboSecciones {
  teo?: Seccion;
  lab?: Seccion;
}

const ctx: Worker = self as unknown as Worker;

ctx.addEventListener('message', (e: MessageEvent<GeneratorWorkerInput>) => {
  const {
    cursosAProcesar,
    secciones_fijadas = {},
    horas_bloqueadas,
    max_choques,
    hora_almuerzo,
    docentes
  } = e.data;

  // 1. Mapeo rápido de pesos de docentes por ID
  const docentesMap = new Map<number, number>();
  docentes.forEach((d) => docentesMap.set(d.id, d.peso));

  // 2. Pre-construcción de parejas de secciones válidas por curso
  const opcionesPorCurso: ComboSecciones[][] = cursosAProcesar.map((curso) => {
    const fijado = secciones_fijadas[curso.id];
    const teoList = curso.seccion_teo ? Object.values(curso.seccion_teo) : [];
    const labList = curso.seccion_lab ? Object.values(curso.seccion_lab) : [];

    // Filtrar teoría si hay fijación
    const teosFiltradas = fijado?.seccion_teo_id
      ? teoList.filter((s) => s.id === fijado.seccion_teo_id)
      : teoList;

    // Filtrar lab si hay fijación
    const labsFiltradas = fijado?.seccion_lab_id
      ? labList.filter((s) => s.id === fijado.seccion_lab_id)
      : labList;

    const combos: ComboSecciones[] = [];

    if (teosFiltradas.length > 0 && labsFiltradas.length > 0) {
      // Curso requiere Teoría + Lab
      for (const teo of teosFiltradas) {
        for (const lab of labsFiltradas) {
          combos.push({ teo, lab });
        }
      }
    } else if (teosFiltradas.length > 0) {
      // Curso solo con Teoría
      for (const teo of teosFiltradas) {
        combos.push({ teo, lab: undefined });
      }
    } else if (labsFiltradas.length > 0) {
      // Curso solo con Lab
      for (const lab of labsFiltradas) {
        combos.push({ teo: undefined, lab });
      }
    }

    return combos;
  });

  // Si algún curso no tiene ninguna combinación válida disponible, es imposible generar
  if (opcionesPorCurso.some((opts) => opts.length === 0)) {
    ctx.postMessage({ tipo: 'EXITO', horarios: [] } as GeneratorWorkerSuccess);
    return;
  }

  // Pre-computar máscara/set de horas bloqueadas por el usuario
  const bloqueadosSet = new Set<string>();
  horas_bloqueadas.forEach((hb) => bloqueadosSet.add(`${hb.dia_orden}-${hb.hora_orden}`));

  const totalCursos = cursosAProcesar.length;
  const resultados: HorarioGenerado[] = [];
  let contadorEvaluados = 0;
  let ultimoReporte = 0;

  // Matriz de ocupación durante backtracking: ocupadoMap[dia_orden][hora_orden] = count
  const ocupadoMap: Record<number, Record<number, number>> = {};

  const incrementalChoques = (dia: number, hora: number): number => {
    if (!ocupadoMap[dia]) ocupadoMap[dia] = {};
    const actual = ocupadoMap[dia][hora] || 0;
    ocupadoMap[dia][hora] = actual + 1;
    
    // Si ya había una clase o es una hora bloqueada, esta adición cuenta como choque extra
    let choque = 0;
    if (actual > 0) choque += 1;
    if (actual === 0 && bloqueadosSet.has(`${dia}-${hora}`)) choque += 1;
    return choque;
  };

  const decrementalChoques = (dia: number, hora: number) => {
    if (ocupadoMap[dia] && ocupadoMap[dia][hora]) {
      ocupadoMap[dia][hora] -= 1;
    }
  };

  // MOTOR EXACTO DE BACKTRACKING
  function backtrack(
    indexCurso: number,
    choquesAcumulados: number,
    seleccionActual: { curso_id: number; seccion_teo_id?: number; seccion_lab_id?: number; combo: ComboSecciones }[]
  ) {
    if (choquesAcumulados > max_choques) {
      return; // PODA TEMPRANA EXACTA
    }

    // CASO BASE: Todos los cursos han sido asignados
    if (indexCurso === totalCursos) {
      contadorEvaluados++;

      // Reportar progreso periódicamente al hilo principal
      if (contadorEvaluados - ultimoReporte >= 500) {
        ultimoReporte = contadorEvaluados;
        ctx.postMessage({
          tipo: 'PROGRESO',
          porcentaje: 0,
          evaluados: contadorEvaluados,
        } as GeneratorWorkerProgress);
      }

      // CONSTRUCCIÓN Y EVALUACIÓN POSTPROCESAMIENTO
      const matrizHoras: MatrizHoras = {};
      let sumaPuntajeDocente = 0;

      seleccionActual.forEach(({ combo }) => {
        const cursoInfo = cursosAProcesar.find((c) => 
          (combo.teo && c.id === combo.teo.id_curso) || (combo.lab && c.id === combo.lab.id_curso)
        );

        if (!cursoInfo) return;

        if (combo.teo) {
          const pesoDocente = docentesMap.get(combo.teo.id_docente) ?? 0;
          sumaPuntajeDocente += pesoDocente;

          combo.teo.lista_horas.forEach((h) => {
            if (!matrizHoras[h.dia_orden]) matrizHoras[h.dia_orden] = {};
            matrizHoras[h.dia_orden][h.hora_orden] = {
              curso_id: cursoInfo.id,
              curso_nombre: cursoInfo.nombre,
              seccion_nombre: combo.teo!.seccion,
              aula: '',
              tipo: 'TEO',
            };
          });
        }

        if (combo.lab) {
          const pesoDocente = docentesMap.get(combo.lab.id_docente) ?? 0;
          sumaPuntajeDocente += pesoDocente;

          combo.lab.lista_horas.forEach((h) => {
            if (!matrizHoras[h.dia_orden]) matrizHoras[h.dia_orden] = {};
            matrizHoras[h.dia_orden][h.hora_orden] = {
              curso_id: cursoInfo.id,
              curso_nombre: cursoInfo.nombre,
              seccion_nombre: combo.lab!.seccion,
              aula: '',
              tipo: 'LAB',
            };
          });
        }
      });

      // Cálculo de Horas Hueco
      let horasHueco = 0;
      Object.keys(matrizHoras).forEach((diaStr) => {
        const dia = Number(diaStr);
        const horasOcupadas = Object.keys(matrizHoras[dia]).map(Number).sort((a, b) => a - b);
        if (horasOcupadas.length > 1) {
          const minHora = horasOcupadas[0];
          const maxHora = horasOcupadas[horasOcupadas.length - 1];
          for (let h = minHora + 1; h < maxHora; h++) {
            if (!matrizHoras[dia][h]) {
              horasHueco++;
            }
          }
        }
      });

      // Cálculo de Horas de Comida Afectadas (Bloques de almuerzo ocupados por clase)
      let horasComidaOcupadas = 0;
      hora_almuerzo.forEach((bloqueHora) => {
        Object.keys(matrizHoras).forEach((diaStr) => {
          const dia = Number(diaStr);
          if (matrizHoras[dia] && matrizHoras[dia][bloqueHora]) {
            horasComidaOcupadas++;
          }
        });
      });

      resultados.push({
        id: resultados.length + 1,
        horas_hueco: horasHueco,
        horas_comida: horasComidaOcupadas,
        puntaje_docente: sumaPuntajeDocente,
        cantidad_choques: choquesAcumulados,
        matriz_horas: matrizHoras,
        secciones_elegidas: seleccionActual.map((s) => ({
          curso_id: s.curso_id,
          seccion_teo_id: s.seccion_teo_id,
          seccion_lab_id: s.seccion_lab_id,
        })),
      });

      return;
    }

    const cursoActual = cursosAProcesar[indexCurso];
    const opciones = opcionesPorCurso[indexCurso];

    for (const combo of opciones) {
      let choquesGeneradosEnPaso = 0;
      const horasAplicadas: HorarioSesion[] = [];

      // Aplicar horas de teoría
      if (combo.teo) {
        for (const h of combo.teo.lista_horas) {
          choquesGeneradosEnPaso += incrementalChoques(h.dia_orden, h.hora_orden);
          horasAplicadas.push(h);
        }
      }

      // Aplicar horas de laboratorio
      if (combo.lab) {
        for (const h of combo.lab.lista_horas) {
          choquesGeneradosEnPaso += incrementalChoques(h.dia_orden, h.hora_orden);
          horasAplicadas.push(h);
        }
      }

      const nuevoTotalChoques = choquesAcumulados + choquesGeneradosEnPaso;

      // Explorar profundidad sólo si sigue estando dentro del límite
      if (nuevoTotalChoques <= max_choques) {
        seleccionActual.push({
          curso_id: cursoActual.id,
          seccion_teo_id: combo.teo?.id,
          seccion_lab_id: combo.lab?.id,
          combo,
        });

        backtrack(indexCurso + 1, nuevoTotalChoques, seleccionActual);

        seleccionActual.pop();
      }

      // Deshacer marcas (Backtrack)
      for (const h of horasAplicadas) {
        decrementalChoques(h.dia_orden, h.hora_orden);
      }
    }
  }

  // Ejecutar búsqueda exacta
  backtrack(0, 0, []);

  // Ordenar resultados por los mejores criterios
  resultados.sort((a, b) => {
    if (a.cantidad_choques !== b.cantidad_choques) {
      return a.cantidad_choques - b.cantidad_choques; // 1. Menos choques primero
    }
    if (b.puntaje_docente !== a.puntaje_docente) {
      return b.puntaje_docente - a.puntaje_docente; // 2. Mayor puntaje docente primero
    }
    return a.horas_hueco - b.horas_hueco; // 3. Menos horas hueco primero
  });

  // Re-asignar IDs limpios en orden de ranking
  resultados.forEach((res, i) => (res.id = i + 1));

  // Retornar máximo los mejores 500 horarios
  ctx.postMessage({
    tipo: 'EXITO',
    horarios: resultados.slice(0, 500),
  } as GeneratorWorkerSuccess);
});