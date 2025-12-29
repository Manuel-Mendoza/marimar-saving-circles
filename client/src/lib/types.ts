// Shared types for the application

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  correoElectronico: string;
  tipo: 'USUARIO' | 'ADMINISTRADOR';
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'SUSPENDIDO' | 'REACTIVADO';
  imagenCedula?: string;
  imagenPerfil?: string;
  fechaRegistro: string;
  ultimoAcceso?: string;
  aprobadoPor?: number;
  fechaAprobacion?: string;
  motivo?: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precioUsd: number;
  precioVes: number;
  tiempoDuracion: number;
  activo: boolean;
  imagen?: string;
  tags?: string[];
}

export interface Contribution {
  id: number;
  userId: number;
  groupId: number;
  monto: number;
  moneda: 'VES' | 'USD';
  fechaPago: string | null;
  periodo: string;
  metodoPago: string | null;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
  referenciaPago: string | null;
  user?: {
    nombre: string;
    apellido: string;
  };
}

export interface Delivery {
  id: number;
  userId: number;
  groupId: number;
  productName: string;
  productValue: number;
  fechaEntrega: string;
  mesEntrega: number;
  estado: 'PENDIENTE' | 'ENTREGADO';
  direccion?: string;
  notas?: string;
  user?: {
    nombre: string;
    apellido: string;
  };
}

export interface PaymentRequest {
  id: number;
  userId: number;
  groupId: number;
  periodo: string;
  monto: number;
  moneda: 'VES' | 'USD';
  metodoPago: string;
  referenciaPago?: string;
  comprobantePago?: string;
  requiereComprobante: boolean;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
  fechaSolicitud: string;
  fechaAprobacion?: string;
  aprobadoPor?: number;
  notasAdmin?: string;
  user?: {
    id: number;
    nombre: string;
    apellido: string;
    correoElectronico: string;
  };
  group?: {
    id: number;
    nombre: string;
  };
}

export interface ProductSelection {
  id: number;
  userId: number;
  productId: number;
  estado: 'PENDIENTE' | 'EN_GRUPO';
  fechaSeleccion: string;
  user?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  product?: {
    id: number;
    nombre: string;
    precioUsd: number;
    precioVes: number;
    tiempoDuracion: number;
    tags?: string[];
  };
}

export interface Grupo {
  id: number;
  nombre: string;
  duracionMeses: number;
  estado: 'SIN_COMPLETAR' | 'LLENO' | 'EN_MARCHA' | 'COMPLETADO';
  fechaInicio: string | null;
  fechaFinal: string | null;
  turnoActual: number;
  participantes?: number;
}

export interface UserGroup {
  id: number;
  userId: number;
  groupId: number;
  posicion: number | null;
  fechaUnion: string;
  productoSeleccionado: string;
  monedaPago: 'VES' | 'USD';
  group?: {
    id: number;
    nombre: string;
    duracionMeses: number;
    estado: string;
    fechaInicio: string | null;
    fechaFinal: string | null;
    turnoActual: number;
  };
  user?: {
    id: number;
    nombre: string;
    apellido: string;
    cedula: string;
    telefono: string;
    correoElectronico: string;
    estado: string;
  };
}

export interface GroupAdminDetails {
  group: Grupo;
  members: UserGroup[];
  contributions: Contribution[];
  deliveries: Delivery[];
  stats: {
    totalMembers: number;
    totalContributions: number;
    pendingContributions: number;
    confirmedContributions: number;
    totalDeliveries: number;
    completedDeliveries: number;
  };
}

export interface PaymentOption {
  id: number;
  tipo: 'movil' | 'banco';
  detalles: string; // JSON string
  activo: boolean;
  fechaCreacion: string;
}

export interface MobilePaymentData {
  numero: string;
  titular: string;
  cedula: string;
  cuentaBancaria: string; // Primeros 4 dígitos de la cuenta bancaria
}

export interface BankPaymentData {
  numeroCuenta: string;
  titular: string;
  tipoDocumento: 'V' | 'J' | 'E' | 'P'; // V=Venezolano, J=Jurídico, E=Extranjero, P=Pasaporte
  cedula: string;
  banco: string;
  tipoCuenta: 'corriente' | 'ahorros';
}
