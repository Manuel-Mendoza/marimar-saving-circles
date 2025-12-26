// Sistema de Componentes - Atomic Design para San Marimar
// Este archivo centraliza todas las exportaciones siguiendo la jerarquía atómica

// 🧬 Atoms - Componentes base indivisibles
export * from './atoms';

// 🧬🧬 Molecules - Combinaciones de atoms
export * from './molecules';

// 🧬🧬🧬 Organisms - Grupos complejos
export * from './organisms';

// 📄 Templates - Estructuras de página
export * from './templates';

// 📄📄 Pages - Instancias específicas
export * from './pages';

// Re-exportar componentes críticos que se usan frecuentemente
export { default as ErrorBoundary } from './ErrorBoundary';
