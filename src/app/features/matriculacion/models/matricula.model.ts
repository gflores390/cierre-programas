export type EstadoMatricula =
  | 'activo'
  | 'suspendido'
  | 'retirado'
  | 'egresado';

export type TipoPrograma =
  | 'diplomado'
  | 'especialidad'
  | 'maestria'
  | 'doctorado'
  | 'postdoctorado';

export type EstadoDeposito = 'comprobado' | 'pendiente' | 'rechazado';

export interface Deposito {
  id: number;
  fecha: string;
  nroDeposito: string;
  monto: number;
  tipoPago: string;
  metodoPago: string;
  estado: EstadoDeposito;
}

export interface Estudiante {
  nombres: string;
  apellidos: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  fechaNacimiento?: string;
  genero?: 'masculino' | 'femenino';
  nacionalidad?: string;
  avatar?: string;
}

export interface Tutor {
  nombre: string;
  parentesco: string;
}

export interface Contacto {
  telefono: string;
  celularReferencia?: string;
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
  estadoCivil?: string;
  domicilio?: string;
  depositos?: Deposito[];
  tipoPrograma?: TipoPrograma;  // ← aquí
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
  tipoPrograma?: TipoPrograma;
}

export interface SeleccionPrograma {
  version: string;
  gestion: string;
  sede: string;
  modalidad: string;
  programa: string;
}
export interface ConteoPorTipoPrograma {
  todos: number;
  diplomado: number;
  especialidad: number;
  maestria: number;
  doctorado: number;
  postdoctorado: number;
}