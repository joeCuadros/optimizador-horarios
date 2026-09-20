# Optimizador de Horarios

Aplicación web para generar horarios de cursado óptimos a partir de las asignaturas disponibles, restricciones de horario (bloques de almuerzo, horas bloqueadas) y máximo de choques permitidos entre materias. Calcula todas las combinaciones posibles en un Web Worker (sin bloquear la UI), permite revisar, favoritear y editar manualmente el horario elegido.

## Características

- **Selección de cursos**: elegí las asignaturas disponibles para el período a cursar.
- **Restricciones configurables**:
  - Bloque horario de almuerzo.
  - Horas bloqueadas por día (matriz día/hora).
  - Máximo de choques (superposiciones) permitidos entre cursos.
- **Generación de horarios**: combinación de todas las opciones válidas ejecutada en un Web Worker (`src/workers/generator.worker.ts`) para no congelar la interfaz.
- **Caché local**: los horarios generados se guardan en IndexedDB para no tener que recalcularlos en cada visita.
- **Favoritos**: marcá los horarios generados que más te convengan.
- **Edición manual**: ajustá a mano el horario final antes de exportarlo.
- **Exportación como imagen**: gracias a `html-to-image`, podés descargar el horario final como PNG.

## Stack técnico

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) como bundler y dev server
- [React Router](https://reactrouter.com/) para el ruteo
- [Tailwind CSS v4](https://tailwindcss.com/) para estilos
- [ESLint](https://eslint.org/) para linting
- Web Workers para el cálculo de combinaciones
- IndexedDB para persistencia local (sin backend)

## Requisitos previos

- [Node.js](https://nodejs.org/) 20 o superior (recomendado LTS)
- npm 10+ (incluido con Node.js)

## Instalación

```bash
git clone https://github.com/joeCuadros/optimizador-horarios.git
cd optimizador-horarios
npm install
```

## Uso — modo desarrollo

Levantá el servidor de desarrollo con recarga en caliente:

```bash
npm run dev
```

Por defecto Vite queda disponible en `http://localhost:5173`. Abrí esa URL en el navegador.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con HMR. |
| `npm run build` | Compila TypeScript (`tsc -b`) y genera el build de producción en `dist/`. |
| `npm run preview` | Sirve localmente el build generado en `dist/` para previsualizarlo. |
| `npm run lint` | Corre ESLint sobre todo el proyecto. |

## Build de producción

```bash
npm run build
npm run preview
```

El resultado del build queda en la carpeta `dist/`, lista para desplegar en cualquier hosting de archivos estáticos (Vercel, Netlify, GitHub Pages, etc.). El repositorio incluye `vercel.json` con el rewrite necesario para que el ruteo del lado del cliente (React Router) funcione correctamente en Vercel.

## Flujo de uso de la aplicación

1. **Configuración** (`/`): seleccioná las materias disponibles, definí el bloque de almuerzo, las horas bloqueadas y el máximo de choques permitidos.
2. **Generar** (`/generar`): dispará el cálculo de combinaciones posibles. El progreso se muestra mientras el Web Worker procesa las opciones.
3. **Horario** (`/horario`): revisá los horarios generados y elegí el que más te convenga.
4. **Favoritos** (`/horario/fav`): consultá los horarios que marcaste como favoritos.
5. **Editar** (`/horario/editar`): ajustá manualmente el horario final antes de exportarlo o guardarlo.
6. **Detalle de curso** (`/cursos/:id`): mirá la información detallada de una asignatura puntual.

## Estructura del proyecto

```
src/
├── components/        # Componentes de UI reutilizables (Header, Footer, selectores de configuración)
├── data/               # Datos de cursos, docentes y constantes (días/horas)
├── hooks/              # Lógica de estado por página (useConfigPage, useGeneradorHorarios, etc.)
├── pages/              # Páginas/rutas de la aplicación
├── services/           # Acceso a datos de cursos y docentes
├── utils/              # Utilidades (IndexedDB, storage, compresión de horarios)
├── workers/            # Web Worker que calcula las combinaciones de horarios
└── types.ts            # Tipos compartidos de TypeScript
```

## Datos de cursos y docentes

Las asignaturas y docentes disponibles se definen en `src/data/cursos.ts`, `src/data/docentes.ts` y los archivos JSON dentro de `src/data/cursos/` y `src/data/docentes/`. Para agregar o modificar la oferta académica, editá esos archivos siguiendo la estructura existente.

## Licencia

Sin licencia especificada.
