
// Tipos principales de la aplicación
export interface User {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  correoElectronico: string;
  tipo: 'usuario' | 'administrador';
  grupos: string[];
}

export interface Grupo {
  id: string;
  nombre: string;
  estado: 'sin-completar' | 'lleno' | 'en-marcha';
  participantes: User[];
  fechaInicio?: Date;
  fechaFinal?: Date;
  valor: number;
  semana: number;
  mes: number;
  turnoActual?: string;
}

export interface Producto {
  id: string;
  nombre: string;
  valorMensual: number;
  valorQuincenal: number;
  tiempoDuracion: number;
  imagen?: string;
  descripcion: string;
}

export interface SorteoResult {
  grupoId: string;
  ganadorId: string;
  posicion: number;
  fecha: Date;
}

export interface PagoOption {
  tipo: 'movil' | 'binance';
  detalles: any;
}
