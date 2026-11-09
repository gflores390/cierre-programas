import { InformeFinalData } from '../models/informe-final.model';
import { INFORME_ACADEMICO_MOCK } from './informe-academico.mock';

export const INFORME_FINAL_MOCK: InformeFinalData = {
  lugarFecha: 'El Alto, julio de 2026',
  destinatario: {
    tratamiento: 'Señor:',
    nombre: 'Dr. Richard Jorge Torrez Juaniquina Ph.D',
    cargo: 'DIRECTOR DE POSTGRADO',
    institucion: 'UNIVERSIDAD PÚBLICA DE EL ALTO',
  },
  referencia: 'INFORME DE CIERRE DE PROGRAMA DEL DIPLOMADO EN ADMINISTRACIÓN DE SERVIDORES GNU/LINUX VERSIÓN II MODALIDAD VIRTUAL.',
  programa: 'DIPLOMADO EN ADMINISTRACIÓN DE SERVIDORES GNU/LINUX VERSIÓN II, MODALIDAD VIRTUAL',
  mesInicio: 'FEBRERO del 2026',
  mesFin: 'JUNIO de 2026',

  inversion: [
    { concepto: 'COLEGIATURA', monto: '2800 BS' },
    { concepto: 'MATRICULA', monto: '200 BS' },
  ],

  nombramientos: INFORME_ACADEMICO_MOCK.nombramientos,

  participantes: [
    { nro: 1, apellidoPaterno: 'BARRIOS', apellidoMaterno: 'GRANADOS', nombres: 'JUAN CARLOS', ci: '5942879', lugar: 'QR', registroMatricula: '71588' },
    { nro: 2, apellidoPaterno: 'CALLE', apellidoMaterno: 'LAIME', nombres: 'ESAU ADOLFO', ci: '8311010', lugar: 'QR', registroMatricula: '71593' },
    { nro: 3, apellidoPaterno: 'CAMACHO', apellidoMaterno: 'BALDERRAMA', nombres: 'PATRICIA SCARLEN', ci: '3619282', lugar: 'QR', registroMatricula: '71594' },
    { nro: 4, apellidoPaterno: 'CARVALLO', apellidoMaterno: 'QUIROGA', nombres: 'PABLO ALBERTO', ci: '7356222', lugar: 'QR', registroMatricula: '71595' },
    { nro: 5, apellidoPaterno: 'CHUQUIMIA', apellidoMaterno: 'CONDORI', nombres: 'JUAN CARLOS', ci: '4360467', lugar: 'QR', registroMatricula: '71596' },
    { nro: 6, apellidoPaterno: 'CONDORI', apellidoMaterno: 'QUISPE', nombres: 'AXEL SIMON', ci: '9924575', lugar: '', registroMatricula: '71597' },
    { nro: 7, apellidoPaterno: 'CUSI', apellidoMaterno: 'CONDORI', nombres: 'MARCELO JOSÉ', ci: '5962510', lugar: 'QR', registroMatricula: '71598' },
    { nro: 8, apellidoPaterno: 'DEL CASTILLO', apellidoMaterno: 'VARGAS', nombres: 'PEDRO LUIS ROBERTO', ci: '5283874', lugar: 'QR', registroMatricula: '71599' },
    { nro: 9, apellidoPaterno: 'GUERRERO', apellidoMaterno: 'ROSPILLOSA', nombres: 'MAIRA', ci: '7137940', lugar: 'QR', registroMatricula: '71587' },
    { nro: 10, apellidoPaterno: 'HUACARA', apellidoMaterno: 'CHOQUE', nombres: 'GABRIEL', ci: '8279250', lugar: 'QR', registroMatricula: '71600' },
    { nro: 11, apellidoPaterno: 'LLANOS', apellidoMaterno: 'TINTAYA', nombres: 'ABDIEL', ci: '9246339', lugar: 'QR', registroMatricula: '71601' },
    { nro: 12, apellidoPaterno: 'MACIAS', apellidoMaterno: 'MIRANDA', nombres: 'JUAN MANUEL', ci: '6176844', lugar: '', registroMatricula: '71591' },
    { nro: 13, apellidoPaterno: 'MAMANI', apellidoMaterno: 'GUAJLLIRE', nombres: 'ADOLFO', ci: '4333068', lugar: 'QR', registroMatricula: '71602' },
    { nro: 14, apellidoPaterno: 'MERCADO', apellidoMaterno: 'ALARCON', nombres: 'JOSE LUIS', ci: '8174701', lugar: 'QR', registroMatricula: '71603' },
    { nro: 15, apellidoPaterno: 'MURIEL', apellidoMaterno: 'RUEDA', nombres: 'SYBIL MELISSA', ci: '5720667', lugar: 'QR', registroMatricula: '71586' },
    { nro: 16, apellidoPaterno: 'PAUCARA', apellidoMaterno: 'FLORES', nombres: 'ROGER', ci: '9233975', lugar: 'QR', registroMatricula: '71604' },
    { nro: 17, apellidoPaterno: 'RODRIGUEZ', apellidoMaterno: 'CALVI', nombres: 'DIEGO ALEJANDRO', ci: '8051496', lugar: 'QR', registroMatricula: '71608' },
    { nro: 18, apellidoPaterno: 'SOLIZ', apellidoMaterno: 'MAYSER', nombres: 'ROBERTO EULOGIO', ci: '4711042', lugar: 'QR', registroMatricula: '71590' },
    { nro: 19, apellidoPaterno: 'VILLARROEL', apellidoMaterno: 'COCA', nombres: 'SEIR GERSON', ci: '7866138', lugar: 'QR', registroMatricula: '71609' },
    { nro: 20, apellidoPaterno: 'VILLCA', apellidoMaterno: 'SARMIENTO', nombres: 'SAMIR RUBEN', ci: '6820555', lugar: 'LP', registroMatricula: '71589' },
    { nro: 21, apellidoPaterno: 'VINO', apellidoMaterno: 'QUISBERT', nombres: 'SUSANA', ci: '6845520', lugar: 'QR', registroMatricula: '71592' },
  ],

  pagos: [
    { nro: 1, apellidoPaterno: 'BARRIOS', apellidoMaterno: 'GRANADOS', nombres: 'JUAN CARLOS', ci: '5942879', cuotaInicial: 980, matricula: 200, pagoMonografia: 0, total: 1180 },
    { nro: 2, apellidoPaterno: 'CALLE', apellidoMaterno: 'LAIME', nombres: 'ESAU ADOLFO', ci: '8311010', cuotaInicial: 1960, matricula: 200, pagoMonografia: 80, total: 2240 },
    { nro: 3, apellidoPaterno: 'CAMACHO', apellidoMaterno: 'BALDERRAMA', nombres: 'PATRICIA SCARLEN', ci: '3619282', cuotaInicial: 1960, matricula: 200, pagoMonografia: 80, total: 2240 },
    { nro: 4, apellidoPaterno: 'CARVALLO', apellidoMaterno: 'QUIROGA', nombres: 'PABLO ALBERTO', ci: '7356222', cuotaInicial: 1960, matricula: 200, pagoMonografia: 0, total: 2160 },
    { nro: 5, apellidoPaterno: 'CHUQUIMIA', apellidoMaterno: 'CONDORI', nombres: 'JUAN CARLOS', ci: '4360467', cuotaInicial: 1960, matricula: 200, pagoMonografia: 0, total: 2160 },
    { nro: 6, apellidoPaterno: 'CONDORI', apellidoMaterno: 'QUISPE', nombres: 'AXEL SIMON', ci: '9924575', cuotaInicial: 1960, matricula: 200, pagoMonografia: 80, total: 2240 },
    { nro: 7, apellidoPaterno: 'CUSI', apellidoMaterno: 'CONDORI', nombres: 'MARCELO JOSÉ', ci: '5962510', cuotaInicial: 1960, matricula: 200, pagoMonografia: 80, total: 2240 },
    { nro: 8, apellidoPaterno: 'DEL CASTILLO', apellidoMaterno: 'VARGAS', nombres: 'PEDRO LUIS ROBERTO', ci: '5283874', cuotaInicial: 1960, matricula: 200, pagoMonografia: 80, total: 2240 },
    { nro: 9, apellidoPaterno: 'GUERRERO', apellidoMaterno: 'ROSPILLOSA', nombres: 'MAIRA', ci: '7137940', cuotaInicial: 1960, matricula: 200, pagoMonografia: 0, total: 2160 },
    { nro: 10, apellidoPaterno: 'HUACARA', apellidoMaterno: 'CHOQUE', nombres: 'GABRIEL', ci: '8279250', cuotaInicial: 1960, matricula: 200, pagoMonografia: 80, total: 2240 },
    { nro: 11, apellidoPaterno: 'LLANOS', apellidoMaterno: 'TINTAYA', nombres: 'ABDIEL', ci: '9246339', cuotaInicial: 1960, matricula: 200, pagoMonografia: 80, total: 2240 },
    { nro: 12, apellidoPaterno: 'MACIAS', apellidoMaterno: 'MIRANDA', nombres: 'JUAN MANUEL', ci: '6176844', cuotaInicial: 0, matricula: 200, pagoMonografia: 0, total: 200 },
    { nro: 13, apellidoPaterno: 'MAMANI', apellidoMaterno: 'GUAJLLIRE', nombres: 'ADOLFO', ci: '4333068', cuotaInicial: 1960, matricula: 200, pagoMonografia: 80, total: 2240 },
    { nro: 14, apellidoPaterno: 'MERCADO', apellidoMaterno: 'ALARCON', nombres: 'JOSE LUIS', ci: '8174701', cuotaInicial: 980, matricula: 200, pagoMonografia: 0, total: 1180 },
    { nro: 15, apellidoPaterno: 'MURIEL', apellidoMaterno: 'RUEDA', nombres: 'SYBIL MELISSA', ci: '5720667', cuotaInicial: 1960, matricula: 200, pagoMonografia: 80, total: 2240 },
    { nro: 16, apellidoPaterno: 'PAUCARA', apellidoMaterno: 'FLORES', nombres: 'ROGER', ci: '9233975', cuotaInicial: 1960, matricula: 200, pagoMonografia: 80, total: 2240 },
    { nro: 17, apellidoPaterno: 'RODRIGUEZ', apellidoMaterno: 'CALVI', nombres: 'DIEGO ALEJANDRO', ci: '8051496', cuotaInicial: 980, matricula: 200, pagoMonografia: 0, total: 1180 },
    { nro: 18, apellidoPaterno: 'SOLIZ', apellidoMaterno: 'MAYSER', nombres: 'ROBERTO EULOGIO', ci: '4711042', cuotaInicial: 980, matricula: 200, pagoMonografia: 0, total: 1180 },
    { nro: 19, apellidoPaterno: 'VILLARROEL', apellidoMaterno: 'COCA', nombres: 'SEIR GERSON', ci: '7866138', cuotaInicial: 980, matricula: 200, pagoMonografia: 0, total: 1180 },
    { nro: 20, apellidoPaterno: 'VILLCA', apellidoMaterno: 'SARMIENTO', nombres: 'SAMIR RUBEN', ci: '6820555', cuotaInicial: 0, matricula: 200, pagoMonografia: 0, total: 200 },
    { nro: 21, apellidoPaterno: 'VINO', apellidoMaterno: 'QUISBERT', nombres: 'SUSANA', ci: '6845520', cuotaInicial: 0, matricula: 200, pagoMonografia: 0, total: 200 },
  ],

  descuentos: [
    { nro: 1, apellidoPaterno: 'BARRIOS', apellidoMaterno: 'GRANADOS', nombres: 'JUAN CARLOS', ci: '5942879', colegiatura: 980, porcentajeDescuento: '30%' },
    { nro: 2, apellidoPaterno: 'CALLE', apellidoMaterno: 'LAIME', nombres: 'ESAU ADOLFO', ci: '8311010', colegiatura: 1960, porcentajeDescuento: '30%' },
    { nro: 3, apellidoPaterno: 'CAMACHO', apellidoMaterno: 'BALDERRAMA', nombres: 'PATRICIA SCARLEN', ci: '3619282', colegiatura: 1960, porcentajeDescuento: '30%' },
    { nro: 4, apellidoPaterno: 'CARVALLO', apellidoMaterno: 'QUIROGA', nombres: 'PABLO ALBERTO', ci: '7356222', colegiatura: 1960, porcentajeDescuento: '30%' },
    { nro: 5, apellidoPaterno: 'CHUQUIMIA', apellidoMaterno: 'CONDORI', nombres: 'JUAN CARLOS', ci: '4360467', colegiatura: 1960, porcentajeDescuento: '30%' },
    { nro: 6, apellidoPaterno: 'CONDORI', apellidoMaterno: 'QUISPE', nombres: 'AXEL SIMON', ci: '9924575', colegiatura: 1960, porcentajeDescuento: '30%' },
    { nro: 7, apellidoPaterno: 'CUSI', apellidoMaterno: 'CONDORI', nombres: 'MARCELO JOSÉ', ci: '5962510', colegiatura: 1960, porcentajeDescuento: '30%' },
    { nro: 8, apellidoPaterno: 'DEL CASTILLO', apellidoMaterno: 'VARGAS', nombres: 'PEDRO LUIS ROBERTO', ci: '5283874', colegiatura: 1960, porcentajeDescuento: '30%' },
    { nro: 9, apellidoPaterno: 'GUERRERO', apellidoMaterno: 'ROSPILLOSA', nombres: 'MAIRA', ci: '7137940', colegiatura: 1960, porcentajeDescuento: '30%' },
    { nro: 10, apellidoPaterno: 'HUACARA', apellidoMaterno: 'CHOQUE', nombres: 'GABRIEL', ci: '8279250', colegiatura: 1960, porcentajeDescuento: '30%' },
    { nro: 11, apellidoPaterno: 'LLANOS', apellidoMaterno: 'TINTAYA', nombres: 'ABDIEL', ci: '9246339', colegiatura: 1960, porcentajeDescuento: '30%' },
    { nro: 12, apellidoPaterno: 'MAMANI', apellidoMaterno: 'GUAJLLIRE', nombres: 'ADOLFO', ci: '4333068', colegiatura: 1960, porcentajeDescuento: '30%' },
    { nro: 13, apellidoPaterno: 'MERCADO', apellidoMaterno: 'ALARCON', nombres: 'JOSE LUIS', ci: '8174701', colegiatura: 980, porcentajeDescuento: '30%' },
    { nro: 14, apellidoPaterno: 'MURIEL', apellidoMaterno: 'RUEDA', nombres: 'SYBIL MELISSA', ci: '5720667', colegiatura: 1960, porcentajeDescuento: '30%' },
    { nro: 15, apellidoPaterno: 'PAUCARA', apellidoMaterno: 'FLORES', nombres: 'ROGER', ci: '9233975', colegiatura: 1960, porcentajeDescuento: '30%' },
    { nro: 16, apellidoPaterno: 'RODRIGUEZ', apellidoMaterno: 'CALVI', nombres: 'DIEGO ALEJANDRO', ci: '8051496', colegiatura: 980, porcentajeDescuento: '30%' },
    { nro: 17, apellidoPaterno: 'SOLIZ', apellidoMaterno: 'MAYSER', nombres: 'ROBERTO EULOGIO', ci: '4711042', colegiatura: 980, porcentajeDescuento: '30%' },
    { nro: 18, apellidoPaterno: 'VILLARROEL', apellidoMaterno: 'COCA', nombres: 'SEIR GERSON', ci: '7866138', colegiatura: 980, porcentajeDescuento: '30%' },
  ],

  resumenModulos: [
    { modulo: 'M1', aprobados: 21, reprobados: 2 },
    { modulo: 'M2', aprobados: 18, reprobados: 5 },
    { modulo: 'M3', aprobados: 18, reprobados: 5 },
    { modulo: 'M4', aprobados: 18, reprobados: 5 },
    { modulo: 'M5', aprobados: 18, reprobados: 5 },
  ],

  calificaciones: INFORME_ACADEMICO_MOCK.calificaciones,

  monografias: [
    {
      nro: 1,
      nombreCompleto: 'ABDIEL LLANOS TINTAYA',
      tema: 'EVALUACIÓN DE CONTROLES DE ACCESO BASADOS EN HOSTS (HBAC) Y LA GESTIÓN DE POLÍTICAS DE SUDO EN FREEIPA: UNA PRUEBA DE CONCEPTO PARA LA SEGURIDAD EN INFRAESTRUCTURAS LINUX',
    },
    {
      nro: 2,
      nombreCompleto: 'ADOLFO MAMANI GUAJLLIRE',
      tema: 'ADMINISTRACIÓN DE UNA PLATAFORMA DE ALMACENAMIENTO LOCAL BASADA EN GNU LINUX PARA LA UNIDAD DE SISTEMAS DE LA REGIONAL LA PAZ DE LA CAJA NACIONAL DE SALUD',
    },
    {
      nro: 3,
      nombreCompleto: 'AXEL SIMON CONDORI QUISPE',
      tema: 'ANÁLISIS DE HERRAMIENTAS DE ADMINISTRACIÓN REMOTA EN SERVIDORES LINUX Y SU IMPACTO EN LA GESTIÓN EFICIENTE',
    },
    {
      nro: 4,
      nombreCompleto: 'ESAU ADOLFO CALLE LAIME',
      tema: 'ANÁLISIS DE HERRAMIENTAS DE AUTOMATIZACIÓN EN SERVIDORES GNU/LINUX Y SU INFLUENCIA EN LA EFICIENCIA ADMINISTRATIVA',
    },
    {
      nro: 5,
      nombreCompleto: 'GABRIEL HUACARA CHOQUE',
      tema: 'EVALUACIÓN COMPARATIVA DE LAS HERRAMIENTAS DE VIRTUALIZACIÓN KVM Y QEMU EN SISTEMAS LINUX PARA ENTORNOS DE SERVIDORES',
    },
    {
      nro: 6,
      nombreCompleto: 'JOSE LUIS MERCADO ALARCÓN',
      tema: 'ANÁLISIS DE INFRAESTRUCTURA, SEGURIDAD Y AUTOMATIZACIÓN EN SERVIDORES GNU/LINUX',
    },
    {
      nro: 7,
      nombreCompleto: 'JUAN CARLOS BARRIOS GRANADOS',
      tema: 'EVALUACIÓN DE WAZUH COMO HERRAMIENTA DE MONITOREO EN SERVIDORES GNU/LINUX Y SU IMPACTO EN LA DISPONIBILIDAD DEL SISTEMA',
    },
    {
      nro: 8,
      nombreCompleto: 'SYBIL MELISSA MURIEL RUEDA\nJUAN CARLOS CHUQUIMIA CONDORI',
      tema: 'IMPLEMENTACIÓN Y ANÁLISIS DE UNA PLATAFORMA DE MONITOREO Y DETECCIÓN DE AMENAZAS EN SERVIDORES GNU/LINUX EN UN ENTORNO VIRTUALIZADO UTILIZANDO WAZUH',
    },
    {
      nro: 9,
      nombreCompleto: 'MAIRA GUERRERO ROSPILLOSA',
      tema: 'ANÁLISIS DE HERRAMIENTAS DE ADMINISTRACIÓN REMOTA EN SERVIDORES LINUX Y SU IMPACTO EN LA GESTIÓN EFICIENTE',
    },
  ],

  responsable: {
    nombre: 'Lic. EDWIN CHAMBI GUTIERREZ',
    cargo: 'RESPONSABLE DE PROGRAMA',
    programa: 'DIPLOMADO EN ADMINISTRACIÓN DE SERVIDORES GNU/LINUX',
    versionModalidad: 'VERSIÓN II - VIRTUAL',
  },
};
