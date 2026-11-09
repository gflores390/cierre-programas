export interface DestinatarioEconomico {
  tratamiento: string;
  nombre: string;
  cargo: string;
  institucion: string;
}

export interface PagoEconomicoItem {
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

export interface DescuentoEconomicoItem {
  nro: number;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  ci: string;
  colegiatura: number;
  porcentajeDescuento: string;
}

export interface ResponsableEconomico {
  nombre: string;
  cargo: string;
  programa: string;
  versionModalidad: string;
}

export interface InformeEconomicoData {
  lugarFecha: string;
  destinatario: DestinatarioEconomico;
  referencia: string;
  programa: string;
  version: string;
  modalidad: string;
  pagos: PagoEconomicoItem[];
  descuentos: DescuentoEconomicoItem[];
  responsable: ResponsableEconomico;
}
