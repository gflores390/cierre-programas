import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InformeAcademicoPdfService } from './services/informe-academico-pdf.service';
import { InformeFinalPdfService } from './services/informe-final-pdf.service';
import { InformeEconomicoPdfService } from './services/informe-economico-pdf.service';
import { InformeDescuentoPdfService } from './services/informe-descuento-pdf.service';
import { TablaPosgradoComponent, ColumnaTablaPosgrado } from '../../shared/components/tabla-posgrado/tabla-posgrado.component';
import { INFORME_ACADEMICO_MOCK } from './data/informe-academico.mock';

export interface InformeCard {
  id: string;
  titulo: string;
  archivoOrigen: string;
  categoria: string;
  codigoRef: string;
  descripcion: string;
  colorBg: string;
  habilitado: boolean;
}

@Component({
  selector: 'app-formularios',
  standalone: true,
  imports: [CommonModule, TablaPosgradoComponent],
  templateUrl: './formularios.component.html',
})
export class FormulariosComponent {
  private academicoPdfService = inject(InformeAcademicoPdfService);
  private finalPdfService = inject(InformeFinalPdfService);
  private economicoPdfService = inject(InformeEconomicoPdfService);
  private descuentoPdfService = inject(InformeDescuentoPdfService);

  mostrarTablasAcademico = false;

  // Datos reales del mock
  nombramientos = INFORME_ACADEMICO_MOCK.nombramientos;
  calificaciones = INFORME_ACADEMICO_MOCK.calificaciones;

  // Configuración de columnas para la Tabla 1: Nombramiento de Docentes
  columnasNombramientos: ColumnaTablaPosgrado[] = [
    { campo: 'nro', etiqueta: 'Nº', ancho: '45px', align: 'center' },
    { campo: 'modulo', etiqueta: 'MÓDULO', align: 'left' },
    { campo: 'docente', etiqueta: 'DOCENTE ASIGNADO', align: 'center' },
    { campo: 'gestion', etiqueta: 'GESTIÓN', ancho: '70px', align: 'center' },
    { campo: 'fechaNombramiento', etiqueta: 'FECHA NOMBRAMIENTO', ancho: '180px', align: 'center' },
  ];

  // Configuración de columnas para la Tabla 2: Registro de Calificaciones
  columnasCalificaciones: ColumnaTablaPosgrado[] = [
    { campo: 'nro', etiqueta: 'Nª', ancho: '35px', align: 'center' },
    { campo: 'apellidoPaterno', etiqueta: 'APELLIDO PATERNO', align: 'left' },
    { campo: 'apellidoMaterno', etiqueta: 'APELLIDO MATERNO', align: 'left' },
    { campo: 'nombres', etiqueta: 'NOMBRES', align: 'left' },
    { campo: 'ci', etiqueta: 'Nª CARNET', ancho: '95px', align: 'center' },
    { campo: 'm1', etiqueta: 'M-1', ancho: '45px', align: 'center', esNota: true, headerBg: '#147ab9' },
    { campo: 'm2', etiqueta: 'M-2', ancho: '45px', align: 'center', esNota: true, headerBg: '#147ab9' },
    { campo: 'm3', etiqueta: 'M-3', ancho: '45px', align: 'center', esNota: true, headerBg: '#147ab9' },
    { campo: 'm4', etiqueta: 'M-4', ancho: '45px', align: 'center', esNota: true, headerBg: '#147ab9' },
    { campo: 'notaMonografia', etiqueta: 'NOTA MONOGRAFÍA', ancho: '110px', align: 'center', esNota: true, headerBg: '#dc8c32' },
  ];

  informes: InformeCard[] = [
    {
      id: 'academico',
      titulo: 'INFORME ACADÉMICO',
      archivoOrigen: 'INFORME ACADÉMICO .docx',
      categoria: 'Académico',
      codigoRef: 'INF-ACAD-01',
      descripcion: 'Informe de cumplimiento curricular, nombramiento de docentes y notas completas con el tema de tabla institucional.',
      colorBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
      habilitado: true,
    },
    {
      id: 'final',
      titulo: 'INFORME FINAL',
      archivoOrigen: 'INFORME FINAL DASGL-V-II 29-06-2026...',
      categoria: 'Cierre de Versión',
      codigoRef: 'DASGL-V-II',
      descripcion: 'Informe de cierre de programa con inversión, nómina de participantes, detalle de pagos, descuentos, informe académico, calificaciones y monografías.',
      colorBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
      habilitado: true,
    },
    {
      id: 'economico',
      titulo: 'INFORME ECONÓMICO',
      archivoOrigen: 'INFORME ECONOMICO.docx',
      categoria: 'Financiero',
      codigoRef: 'INF-ECON-02',
      descripcion: 'Detalle económico: pagos realizados por participantes (matrícula, colegiatura, monografías) y participantes beneficiados con descuento del 30%.',
      colorBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
      habilitado: true,
    },
    {
      id: 'descuento',
      titulo: 'INFORME DE DESCUENTO',
      archivoOrigen: 'INFORME descuento.docx',
      categoria: 'Becas y Convenios',
      codigoRef: 'INF-DESC-03',
      descripcion: 'Nómina de participantes que optaron por el descuento institucional del 30% aplicable al pago al contado o en dos cuotas.',
      colorBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
      habilitado: true,
    },
  ];

  toggleTablasAcademico() {
    this.mostrarTablasAcademico = !this.mostrarTablasAcademico;
  }

  imprimir(id: string) {
    if (id === 'academico') {
      this.academicoPdfService.generarPdf(undefined, 'imprimir');
    } else if (id === 'final') {
      this.finalPdfService.generarPdf(undefined, 'imprimir');
    } else if (id === 'economico') {
      this.economicoPdfService.generarPdf(undefined, 'imprimir');
    } else if (id === 'descuento') {
      this.descuentoPdfService.generarPdf(undefined, 'imprimir');
    } else {
      alert('Este informe se diseñará a continuación.');
    }
  }

  descargar(id: string) {
    if (id === 'academico') {
      this.academicoPdfService.generarPdf(undefined, 'descargar');
    } else if (id === 'final') {
      this.finalPdfService.generarPdf(undefined, 'descargar');
    } else if (id === 'economico') {
      this.economicoPdfService.generarPdf(undefined, 'descargar');
    } else if (id === 'descuento') {
      this.descuentoPdfService.generarPdf(undefined, 'descargar');
    } else {
      alert('Este informe se diseñará a continuación.');
    }
  }
}
