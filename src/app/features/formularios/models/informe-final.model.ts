import { ModuloNombramiento, CalificacionEstudiante } from './informe-academico.model';

export interface InversionItem {
  concepto: string;
  monto: string;
}

export interface ParticipanteRegistro {
  nro: number;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  ci: string;
  lugar: string;
  registroMatricula: string;
}

export interface PagoParticipante {
  nro: number;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  ci: string;
  cuotaInicial: number;
  matricula: number;
  pagoMonografia: number;
  total: number;
}

export interface DescuentoParticipante {
  nro: number;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  ci: string;
  colegiatura: number;
  porcentajeDescuento: string;
}

export interface ResumenModulo {
  modulo: string;
  aprobados: number;
  reprobados: number;
}

export interface MonografiaPresentada {
  nro: number;
  nombreCompleto: string;
  tema: string;
}

export interface InformeFinalData {
  lugarFecha: string;
  destinatario: {
    tratamiento: string;
    nombre: string;
    cargo: string;
    institucion: string;
  };
  referencia: string;
  programa: string;
  mesInicio: string;
  mesFin: string;
  inversion: InversionItem[];
  nombramientos: ModuloNombramiento[];
  participantes: ParticipanteRegistro[];
  pagos: PagoParticipante[];
  descuentos: DescuentoParticipante[];
  resumenModulos: ResumenModulo[];
  calificaciones: CalificacionEstudiante[];
  monografias: MonografiaPresentada[];
  responsable: {
    nombre: string;
    cargo: string;
    programa: string;
    versionModalidad: string;
  };
}
