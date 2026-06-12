import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Matricula } from '../models';

export interface DatosCabeceraPdf {
  programa:  string;
  unidad:    string;   // ej. "CENTRAL - POSGRADO - EL ALTO"
  version:   string;
  modalidad: string;
  gestion:   string;
}

@Injectable({ providedIn: 'root' })
export class MatriculaPdfService {
  /**
   * Genera el listado de matriculados en formato PDF (tamaño carta).
   * Devuelve los bytes del PDF para ser usado por el visor.
   */
  generarListado(matriculas: Matricula[], cab: DatosCabeceraPdf): Uint8Array {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',  // 612 x 792 pt
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX   = 28;

    // ── Cabecera ────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(cab.programa.toUpperCase(), marginX, 30);

    doc.setFontSize(9);
    doc.text(cab.unidad.toUpperCase(), marginX, 46);

    // Versión / Modalidad / Gestión alineados
    const colStart  = pageWidth * 0.42;
    const colWidth  = (pageWidth - marginX - colStart) / 3;
    doc.text(`Versión .::  ${cab.version}`,   colStart,                 46);
    doc.text(`Modalidad .::  ${cab.modalidad}`, colStart + colWidth,    46);
    doc.text(`Gestión .::  ${cab.gestion}`,  colStart + colWidth * 2,   46);

    // Línea doble decorativa
    doc.setLineWidth(0.5);
    doc.line(marginX, 54, pageWidth - marginX, 54);
    doc.line(marginX, 57, pageWidth - marginX, 57);

    // ── Tabla ───────────────────────────────────────────────────
    const body = matriculas.map((m, i) => [
      String(i + 1),
      m.ci.split(' ')[0],
      String(m.ru ?? ''),
      `${m.estudiante.apellidos} ${m.estudiante.nombres}`.toUpperCase(),
      m.estudiante.fechaNacimiento ?? '',
      m.estudiante.genero === 'femenino' ? 'F' : m.estudiante.genero === 'masculino' ? 'M' : '',
      m.contacto.telefono,
      `${cab.gestion} ${cab.gestion}-04-06`,
    ]);

    autoTable(doc, {
      startY: 68,
      margin: { left: marginX, right: marginX },
      head: [['N°', 'CI', 'RU', 'Apellidos y Nombre(s)', 'Fecha Nac.', 'Género', 'Celular', 'Matriculas']],
      body,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 4,
        lineColor: [180, 180, 180],
        lineWidth: 0.4,
        textColor: [40, 40, 40],
      },
      headStyles: {
        fillColor: [220, 230, 245],
        textColor: [30, 30, 30],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 8.5,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 24 },   // N°
        1: { halign: 'center', cellWidth: 52 },   // CI
        2: { halign: 'center', cellWidth: 38 },   // RU
        3: { halign: 'left'                   },   // Apellidos y Nombres (auto)
        4: { halign: 'center', cellWidth: 56 },   // Fecha Nac.
        5: { halign: 'center', cellWidth: 36 },   // Género
        6: { halign: 'center', cellWidth: 60 },   // Celular
        7: { halign: 'center', cellWidth: 88 },   // Matriculas
      },
      didDrawPage: (data) => {
        // Pie de página con número de página
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Página ${data.pageNumber}`,
          pageWidth - marginX,
          pageHeight - 14,
          { align: 'right' },
        );
      },
    });

    return new Uint8Array(doc.output('arraybuffer'));
  }
}
