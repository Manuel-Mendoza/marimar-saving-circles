// Organisms - Grupos complejos de molecules y atoms
// Componentes de alto nivel que manejan lógica compleja

// Dashboards
export { default as AdminDashboard } from './AdminDashboard';
export { default as UserDashboard } from './UserDashboard';

// Formularios de autenticación
export { default as LoginForm } from './LoginForm';
export { default as RegistrationForm } from './RegistrationForm';
export { default as PendingApproval } from './PendingApproval';

// Componentes organizados por dominio
export * from './users';
export * from './products';
export * from './groups';
