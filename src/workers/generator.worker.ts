import { TODOS_LOS_CURSOS, DOCENTES } from '../data/cursos';
import { DIAS, HORAS } from '../data/constantes';
import type { HorarioGenerado, MatrizHoras, HorarioSesion, Seccion, Curso } from '../types';


// Logs de depuracion
const DEBUG = true;
const log = (...args: unknown[]) => {
    if (DEBUG) {
        console.log('[generator.worker]:', ...args);
    }
};
// Clases
export interface SeccionPlana {
    tipo: 'teo' | 'lab';
    seccion: Seccion[];
}

// ---------------------------- Funciones ----------------------------
function obtenerCursosSeleccionadosPlanos(
    cursosSeleccionadosMap: Record<string, number[]>
): Curso[] {
    if (!cursosSeleccionadosMap) return [];
    const idsUnicas = Array.from(
        new Set(Object.values(cursosSeleccionadosMap).flat())
    );
    return idsUnicas
        .map((id) => TODOS_LOS_CURSOS.find((curso) => curso.id === id))
        .filter((curso): curso is Curso => curso !== undefined);
}

function desglosarSeccionesPlanas(
    cursos: Curso[],
    seccionesFijadas?: Record<number, { seccion_teo_id?: number; seccion_lab_id?: number }>
): SeccionPlana[] {
    const listaPlana: SeccionPlana[] = [];

    cursos.forEach((curso) => {
        const fijado = seccionesFijadas?.[curso.id];
        const teo_id = fijado?.seccion_teo_id;
        const lab_id = fijado?.seccion_lab_id;

        // 1. Procesar Secciones de Teoría
        if (curso.seccion_teo) {
            const teos = Object.values(curso.seccion_teo).filter(
                (sec) => teo_id === undefined || sec.id === teo_id
            );
            if (teos.length > 0) {
                listaPlana.push({ tipo: 'teo', seccion: teos });
            }
        }

        // 2. Procesar Secciones de Laboratorio
        if (curso.seccion_lab) {
            const labs = Object.values(curso.seccion_lab).filter(
                (sec) => lab_id === undefined || sec.id === lab_id
            );
            if (labs.length > 0) {
                listaPlana.push({ tipo: 'lab', seccion: labs });
            }
        }
    });
    return listaPlana;
}

function filtrarHorasBloqueadas(
    listaPlana: SeccionPlana[],
    horasBloqueadas: HorarioSesion[]
): SeccionPlana[] {
    if (!horasBloqueadas || horasBloqueadas.length === 0) {
        return [...listaPlana].sort((a, b) => a.seccion.length - b.seccion.length);
    }
    const resultado = listaPlana.map((item) => {
        const seccionesValidas = item.seccion.filter((sec) => {
            if (!sec.lista_horas || sec.lista_horas.length === 0) return true;
            const tieneChoque = sec.lista_horas.some((horaClase) =>
                horasBloqueadas.some(
                    (bloqueada) =>
                        bloqueada.dia_orden === horaClase.dia_orden &&
                        bloqueada.hora_orden === horaClase.hora_orden
                )
            );
            return !tieneChoque;
        });

        return {
            tipo: item.tipo,
            seccion: seccionesValidas,
        };
    });
    // Validar si algún tipo/sección se quedó sin opciones válidas
    const grupoImposible = resultado.find((item) => item.seccion.length === 0);
    if (grupoImposible) {
        throw new Error(
            'Horario imposible: Las horas bloqueadas eliminaron todas las secciones disponibles de al menos un curso.'
        );
    }
    return resultado.sort((a, b) => a.seccion.length - b.seccion.length);
}
// ---------------------------- Funciones para construir Horarios ----------------------------
function armarHorarioGenerado(
    id: number,
    secciones: Seccion[],
    cantidadChoques: number,
    horaAlmuerzo: number[]
): HorarioGenerado {
    const matriz_horas: MatrizHoras = {};
    let horas_hueco = 0;
    let diasConComida = 0;
    let puntaje_docente = 0;

    // 1. Inicializar la estructura con los días y horas exactos de constantes.ts
    DIAS.forEach((d) => {
        matriz_horas[d.orden] = {};
    });

    // 2. Poblar celdas y calcular puntaje docente
    secciones.forEach((sec) => {
        const curso = TODOS_LOS_CURSOS.find((c) => c.id === sec.id_curso);
        const esTeo = curso?.seccion_teo && Object.values(curso.seccion_teo).some((t) => t.id === sec.id);

        const doc = DOCENTES.find((d) => d.id === sec.id_docente);
        if (doc) puntaje_docente += doc.peso;

        sec.lista_horas?.forEach((h) => {
            if (matriz_horas[h.dia_orden]) {
                matriz_horas[h.dia_orden][h.hora_orden] = {
                    curso_id: sec.id_curso,
                    curso_nombre: curso?.nombre || '',
                    seccion_nombre: sec.seccion,
                    aula: 'Aula',
                    tipo: esTeo ? 'TEO' : 'LAB',
                };
            }
        });
    });

    // 3. Métricas dinámicas iterando los días importados
    DIAS.forEach((d) => {
        const diaOrden = d.orden;
        const horasOcupadas = Object.keys(matriz_horas[diaOrden])
            .map(Number)
            .filter((h) => matriz_horas[diaOrden][h] !== null)
            .sort((a, b) => a - b);

        // Conteo de horas hueco entre la primera y última clase ocupada
        if (horasOcupadas.length > 1) {
            const min = horasOcupadas[0];
            const max = horasOcupadas[horasOcupadas.length - 1];
            for (let h = min + 1; h < max; h++) {
                if (!matriz_horas[diaOrden][h]) horas_hueco++;
            }
        }

        // Verificar si tiene al menos una hora de almuerzo disponible
        if (horaAlmuerzo.some((h) => !matriz_horas[diaOrden][h])) {
            diasConComida++;
        }
    });

    // 4. Mapear secciones_elegidas agrupando por curso_id
    const mapaSecciones = new Map<number, { curso_id: number; seccion_teo_id?: number; seccion_lab_id?: number }>();

    secciones.forEach((sec) => {
        const curso = TODOS_LOS_CURSOS.find((c) => c.id === sec.id_curso);
        const esTeo = curso?.seccion_teo && Object.values(curso.seccion_teo).some((t) => t.id === sec.id);

        const actual = mapaSecciones.get(sec.id_curso) || { curso_id: sec.id_curso };
        if (esTeo) actual.seccion_teo_id = sec.id;
        else actual.seccion_lab_id = sec.id;

        mapaSecciones.set(sec.id_curso, actual);
    });

    return {
        id,
        horas_hueco,
        horas_comida: diasConComida,
        puntaje_docente,
        cantidad_choques: cantidadChoques,
        matriz_horas,
        secciones_elegidas: Array.from(mapaSecciones.values()),
    };
}

function explorarCombinaciones(
    grupos: SeccionPlana[],
    maxChoques: number,
    horaAlmuerzo: number[],
    index = 0,
    seccionesActuales: Seccion[] = [],
    choquesActuales = 0,
    // Matriz de marcas inicializada usando los límites dinámicos de DIAS y HORAS
    matrizOcupacion: Record<number, Record<number, number>> = DIAS.reduce((acc, d) => {
        acc[d.orden] = HORAS.reduce((hAcc, h) => {
            hAcc[h.orden] = 0;
            return hAcc;
        }, {} as Record<number, number>);
        return acc;
    }, {} as Record<number, Record<number, number>>),
    resultados: HorarioGenerado[] = []
): HorarioGenerado[] {
    // PODA: Si los choques acumulados exceden maxChoques
    if (choquesActuales > maxChoques) return resultados;
    // CASO BASE: Combinación completada
    if (index === grupos.length) {
        const id = resultados.length + 1;
        resultados.push(
            armarHorarioGenerado(id, seccionesActuales, choquesActuales, horaAlmuerzo)
        );
        return resultados;
    }
    const grupo = grupos[index];
    for (const sec of grupo.seccion) {
        let nuevosChoques = 0;
        if (sec.lista_horas) {
            for (const h of sec.lista_horas) {
                if (matrizOcupacion[h.dia_orden]?.[h.hora_orden] > 0) {
                    nuevosChoques++;
                }
            }
        }
        // Poda temprana antes de descender en el árbol
        if (choquesActuales + nuevosChoques <= maxChoques) {
            // Marcar sesión
            sec.lista_horas?.forEach((h) => {
                if (matrizOcupacion[h.dia_orden]) {
                    matrizOcupacion[h.dia_orden][h.hora_orden]++;
                }
            });
            seccionesActuales.push(sec);
            // Siguiente iteración recursiva
            explorarCombinaciones(
                grupos,
                maxChoques,
                horaAlmuerzo,
                index + 1,
                seccionesActuales,
                choquesActuales + nuevosChoques,
                matrizOcupacion,
                resultados
            );
            // Deshacer marcas (Backtrack)
            seccionesActuales.pop();
            sec.lista_horas?.forEach((h) => {
                if (matrizOcupacion[h.dia_orden]) {
                    matrizOcupacion[h.dia_orden][h.hora_orden]--;
                }
            });
        }
    }

    return resultados;
}

// Escuchar mensajes desde el hilo principal (useGeneradorHorarios)
self.onmessage = async (e: MessageEvent) => {
    log('Worker iniciado', e.data);

    try {
        // paso de buscar cursos
        self.postMessage({ type: 'progress', message: 'Buscando cursos seleccionados...', progress: 10 });
        const cursosAProcesar = obtenerCursosSeleccionadosPlanos(e.data.cursos_seleccionados);
        log(cursosAProcesar);

        // paso de desglosar secciones
        self.postMessage({ type: 'progress', message: 'Separando las secciones de teoría y laboratorio...', progress: 30 });
        const seccionesDesglosadas = desglosarSeccionesPlanas(cursosAProcesar, e.data.secciones_fijadas);
        log('Secciones desglosadas:', seccionesDesglosadas);

        // paso de aplicar restricciones
        self.postMessage({ type: 'progress', message: 'Filtrando secciones por horas bloqueadas...', progress: 50 });
        const seccionesFiltradas = filtrarHorasBloqueadas(seccionesDesglosadas, e.data.horas_bloqueadas);
        log('Secciones filtradas:', seccionesFiltradas);

        // paso de calcular combinaciones de horarios
        self.postMessage({ type: 'progress', message: 'Buscando combinaciones válidas...', progress: 75 });
        const horariosGenerados = explorarCombinaciones(
            seccionesFiltradas,
            e.data.max_choques,
            e.data.hora_almuerzo
        );
        log('Horarios generados:', horariosGenerados.length);
        if (horariosGenerados.length === 0) {
            throw new Error('No se encontraron combinaciones de horarios válidas dentro del límite de choques permitidos.');
        }
        // paso final
        self.postMessage({ type: 'progress', message: 'Guardando horarios generados...', progress: 100 });
        await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5 segundo de espera
        log('Worker finalizado');

        self.postMessage({
            type: 'complete',
            message: 'Proceso completado exitosamente',
            progress: 100,
            horarios: horariosGenerados,
        });
    } catch (error: any) {
        log('Error detectado:', error.message);
        self.postMessage({
            type: 'error',
            message: error.message || 'Error al generar los horarios',
            progress: 100,
            horarios: [],
        });
    }
};

export { };