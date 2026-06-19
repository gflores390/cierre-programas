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
  tipoPrograma?: TipoPrograma; 
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
  cupos?: number;
  inscritos?: number;
  tipoPrograma?: TipoPrograma;
  matriculados?: number;
  preinscritos?: number;
  numeroModulos?: number;
  fechaInicio?: string | null;
  costosMatricula?: number;
  docente?: string;
  modulosAsignados?: number;
  fechaRegistro?: string | null;
  coordinador?: string;
  coordinadorWhatsapp?: string;
  habilitado?: boolean;
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
export interface ProgramaApi {
  id: number;
  gestion: number;
  grado_programa: string;
  programa: string;
  version: string;
  modalidad: string;
  sede: string;
  costosMatricula: number[];
  modulos: {
    cantidad: number;
    cantidadConNombramiento: number;
  };
  fechaInicio: string;
  nroParticipantes: {
    matriculados: number;
    preinscritos: number;
  };
}
export interface ProgramasApiResponse {
  status: string;
  message: string;
  data: ProgramaApi[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
  timestamp: string;
}

export interface ParticipanteApi {
  id_persona: string;
  ci: string;
  nombre_completo: string;
  celular: string | null;
  registroUniversitario: string;
  matriculas: Record<string, number>[];
}

export interface APIResponseParticipantes {
  status: string;
  message: string;
  data: ParticipanteApi[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
  timestamp: string;
}