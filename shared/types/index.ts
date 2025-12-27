
// Tipos principales de la aplicación
export interface User {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  correoElectronico: string;
  tipo: 'USUARIO' | 'ADMINISTRADOR';
  estado?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'SUSPENDIDO' | 'REACTIVADO';
  imagenCedula?: string;
  fechaRegistro: Date;
  ultimoAcceso?: Date;
  fechaAprobacion?: Date;
}

export interface Grupo {
  id: number;
  nombre: string;
  duracionMeses: number;
  estado: 'SIN_COMPLETAR' | 'LLENO' | 'EN_MARCHA' | 'COMPLETADO';
  fechaInicio?: Date;
  fechaFinal?: Date;
  turnoActual: number;
  participantes?: number;
  productoNombre?: string;
}

export interface UserGroup {
  id: number;
  userId: number;
  groupId: number;
  posicion: number;
  fechaUnion: Date;
  user?: User;
  group?: Grupo;
}

export interface Producto {
  id: number;
  nombre: string;
  precioUsd: number;
  precioVes: number;
  tiempoDuracion: number;
  imagen?: string;
  descripcion: string;
  activo: boolean;
  tags?: string[];
}

export interface Contribution {
  id: number;
  userId: number;
  groupId: number;
  monto: number;
  moneda: 'USD' | 'VES';
  fechaPago: Date;
  periodo: string;
  metodoPago?: string;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
  referenciaPago?: string;
}

export interface Delivery {
  id: number;
  userId: number;
  groupId: number;
  productName: string;
  productValue: string;
  fechaEntrega: Date;
  mesEntrega: string;
  estado: 'PENDIENTE' | 'ENTREGADO';
  notas?: string;
}

export interface PaymentOption {
  id: number;
  nombre: string;
  tipo: string;
  detalles: Record<string, any>;
  activo: boolean;
}

export interface Notification {
  id: number;
  userId: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fechaCreacion: Date;
}

export interface PaymentRequest {
  id: number;
  userId: number;
  groupId: number;
  periodo: string;
  monto: number;
  moneda: 'USD' | 'VES';
  metodoPago: string;
  referenciaPago?: string;
  comprobantePago?: string;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
  notasAdmin?: string;
  fechaCreacion: Date;
  user?: User;
  group?: Grupo;
  fechaSolicitud?: string;
  fechaAprobacion?: string | null;
}

export interface ProductSelection {
  id: number;
  userId: number;
  productId: number;
  fechaSeleccion: Date;
  product?: Producto;
}
