export interface DestinatarioDescuento {
  tratamiento: string;
  nombre: string;
  cargo: string;
  institucion: string;
}

export interface BeneficiarioDescuentoItem {
  nro: number;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  ci: string;
  colegiatura: number;
  porcentajeDescuento: string;
}

export interface ResponsableDescuento {
  nombre: string;
  cargo: string;
  programa: string;
  versionModalidad: string;
}

export interface InformeDescuentoData {
  lugarFecha: string;
  destinatario: DestinatarioDescuento;
  referencia: string;
  programa: string;
  version: string;
  modalidad: string;
  textoExplicativo: string;
  beneficiarios: BeneficiarioDescuentoItem[];
  responsable: ResponsableDescuento;
}
