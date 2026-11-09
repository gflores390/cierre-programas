export interface DestinatarioInforme {
  tratamiento: string; // "Señor:"
  nombre: string;      // "Dr. Richard Jorge Torrez Juaniquina Ph.D"
  cargo: string;       // "DIRECTOR DE POSTGRADO"
  institucion: string; // "UNIVERSIDAD PÚBLICA DE EL ALTO"
}

export interface ModuloNombramiento {
  nro: number;
  modulo: string;
  docente: string;
  gestion: string;
  fechaNombramiento: string;
}

export interface CalificacionEstudiante {
  nro: number;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  ci: string;
  m1: number;
  m2: number;
  m3: number;
  m4: number;
  notaMonografia: number;
}

export interface ResponsablePrograma {
  nombre: string;
  cargo: string;
  programa: string;
  versionModalidad: string;
}

export interface InformeAcademicoData {
  lugarFecha: string;
  destinatario: DestinatarioInforme;
  referencia: string;
  mesInicio: string;
  mesFin: string;
  nombramientos: ModuloNombramiento[];
  calificaciones: CalificacionEstudiante[];
  responsable: ResponsablePrograma;
}
