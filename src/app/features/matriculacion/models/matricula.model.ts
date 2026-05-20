export type EstadoMatricula =
  | 'activo'
  | 'suspendido'
  | 'retirado'
  | 'egresado';

export interface Estudiante {
  nombres: string;
  apellidos: string;
  avatar?: string;
}

export interface Tutor {
  nombre: string;
  parentesco: string;
}

export interface Contacto {
  telefono: string;
  email?: string;
}

export interface Matricula {
  id: number;
  codigo: string;
  ci: string;
  estudiante: Estudiante;
  rude: string;
  ru: number;
  curso: string;
  totalGrados: number;
  tieneFoto: boolean;
  tieneBoleta: boolean;
  tutor: Tutor;
  contacto: Contacto;
  estado: EstadoMatricula;
}

export interface MatriculaFiltro {
  busqueda: string;
  estado: EstadoMatricula | 'todos';
  gestion: string;
  periodo: string;
}

export interface Programa {
  id: number;
  nombre: string;
  turno: string;
  version: string;
  gestion: string;
  sede: string;
  modalidad: string;
  cupos: number;
  inscritos: number;
}

export interface SeleccionPrograma {
  version: string;
  gestion: string;
  sede: string;
  modalidad: string;
  programa: string;
}
