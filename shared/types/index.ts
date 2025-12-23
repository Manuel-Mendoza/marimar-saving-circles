
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
  imagenCedula?: string;
  fechaRegistro: Date;
  ultimoAcceso?: Date;
}

export interface Grupo {
  id: number;
  nombre: string;
  duracionMeses: number;
  estado: 'SIN_COMPLETAR' | 'LLENO' | 'EN_MARCHA' | 'COMPLETADO';
  fechaInicio?: Date;
  fechaFinal?: Date;
  turnoActual: number;
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
