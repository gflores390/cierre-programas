import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InformeFinalData } from '../models/informe-final.model';
import { INFORME_FINAL_MOCK } from '../data/informe-final.mock';
import { FORMULARIO_BG_BASE64 } from '../data/formulario-bg.base64';

@Injectable({ providedIn: 'root' })
export class InformeFinalPdfService {

  // Color exacto oficial: #016EB7
  private readonly COLOR_AZUL_POSGRADO: [number, number, number] = [1, 110, 183];
  // Color con 30% de transparencia (70% opacidad) sobre fondo blanco
  private readonly COLOR_LINEAS_DASH: [number, number, number] = [77, 154, 205];
  // Radio de curvatura sutil (4 pt: suave y formal)
  private readonly RADIUS_ESQUINAS = 4;

  generarPdf(
    data: InformeFinalData = INFORME_FINAL_MOCK,
    accion: 'imprimir' | 'descargar' = 'imprimir'
  ) {
    // Abrir la ventana inmediatamente con el clic del usuario para evitar bloqueo de ventanas emergentes (popups)
    let ventanaImpresion: Window | null = null;
    if (accion === 'imprimir' && typeof window !== 'undefined') {
      try {
        ventanaImpresion = window.open('', '_blank');
        if (ventanaImpresion) {
          ventanaImpresion.document.write(
            '<!DOCTYPE html><html><head><title>Generando documento...</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui,-apple-system,sans-serif;background:#f8fafc;color:#1e293b}.box{text-align:center;padding:24px;background:white;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)}.spinner{border:3px solid #e2e8f0;border-top:3px solid #016EB7;border-radius:50%;width:32px;height:32px;animation:spin 1s linear infinite;margin:0 auto 12px}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style></head><body><div class="box"><div class="spinner"></div><div style="font-weight:600;font-size:14px">Generando documento oficial Posgrado...</div><div style="font-size:12px;color:#64748b;margin-top:4px">Por favor, espere un momento</div></div></body></html>'
          );
        }
      } catch (e) {
        console.warn('Ventana emergente bloqueada por el navegador:', e);
      }
    }
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter', // 612 x 792 pt
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 45;
    const tableW = pageWidth - (marginX * 2); // 522 pt
    const centroX = pageWidth / 2;

    const drawBackground = () => {
      doc.addImage(FORMULARIO_BG_BASE64, 'WEBP', 0, 0, pageWidth, pageHeight);
    };

    const drawBodyBorder = (startX: number, bodyStartY: number, currentTableW: number, finalY: number) => {
      const bodyHeight = finalY - bodyStartY;
      if (bodyHeight <= this.RADIUS_ESQUINAS) return;
      doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
      doc.setLineDashPattern([2, 1.5], 0);
      doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
      doc.setLineWidth(0.35);
      const sBezier = (4 / 3) * (Math.SQRT2 - 1);
      const r = this.RADIUS_ESQUINAS;
      doc.lines([
        [0, bodyHeight - r],
        [0, r * sBezier, r - r * sBezier, r, r, r],
        [currentTableW - 2 * r, 0],
        [r * sBezier, 0, r, -r * (1 - sBezier), r, -r],
        [0, -(bodyHeight - r)],
      ], startX, bodyStartY, [1, 1], 'S', false);
      doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
      doc.setLineDashPattern([], 0);
    };

    // ==========================================
    // PAGINA 1: CARTA, INVERSION Y NOMBRAMIENTOS
    // ==========================================
    drawBackground();

    let currentY = 120;

    // Fecha en la esquina superior derecha
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(data.lugarFecha, pageWidth - marginX - 110, currentY);

    currentY += 30;

    // Destinatario a la izquierda
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(data.destinatario.tratamiento, marginX, currentY);
    currentY += 13;

    doc.setFont('helvetica', 'bold');
    doc.text(data.destinatario.nombre, marginX, currentY);
    currentY += 13;

    doc.text(data.destinatario.cargo, marginX, currentY);
    currentY += 13;

    doc.text(data.destinatario.institucion, marginX, currentY);
    currentY += 13;

    doc.setFont('helvetica', 'normal');
    doc.text('Presente. -', marginX, currentY);
    currentY += 34; // Espacio holgado arriba de la Referencia

    // Referencia
    const refX = marginX + 115;
    const refWidth = pageWidth - marginX - refX;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const refLineas = doc.splitTextToSize('Ref.:  ' + data.referencia, refWidth);

    refLineas.forEach((linea: string) => {
      doc.text(linea, refX, currentY);
      const textWidth = doc.getTextWidth(linea);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.8);
      doc.line(refX, currentY + 2, refX + textWidth, currentY + 2);
      currentY += 13;
    });

    currentY += 30; // Espacio holgado abajo de la Referencia

    // Cuerpo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text('A tiempo de hacerle llegar un cordial saludo.', marginX, currentY);
    currentY += 15;

    const pPrograma = 'Por medio de la presente, hacemos llegar el detalle del proceso académico y administrativo del programa de DIPLOMADO EN ADMINISTRACIÓN DE SERVIDORES GNU/LINUX VERSIÓN II, MODALIDAD VIRTUAL.';
    const splitProg = doc.splitTextToSize(pPrograma, tableW);
    doc.text(splitProg, marginX, currentY);
    currentY += (splitProg.length * 13) + 10;

    doc.text('El monto de inversión en este programa fue de:', marginX, currentY);
    currentY += 14;

    // TABLA PEQUEÑA DE INVERSION (COLEGIATURA / MATRICULA)
    const inversionW = 260;
    const inversionX = centroX - (inversionW / 2);
    const inversionStartY = currentY;
    let inversionHeadH = 0;

    autoTable(doc, {
      startY: inversionStartY,
      tableWidth: inversionW,
      margin: { left: inversionX },
      head: [['CONCEPTO', 'MONTO']],
      body: data.inversion.map((inv) => [inv.concepto, inv.monto]),
      theme: 'plain',
      headStyles: {
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
      },
      styles: {
        fontSize: 8,
        textColor: [0, 0, 0],
        cellPadding: 4,
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 150, fontStyle: 'bold' },
        1: { cellWidth: 110, halign: 'center', fontStyle: 'bold' },
      },
      willDrawCell: (hookData) => {
        if (hookData.section === 'head' && hookData.column.index === 0) {
          inversionHeadH = hookData.row.height;
          doc.setFillColor(this.COLOR_AZUL_POSGRADO[0], this.COLOR_AZUL_POSGRADO[1], this.COLOR_AZUL_POSGRADO[2]);
          doc.roundedRect(inversionX, hookData.cell.y, inversionW, hookData.row.height, this.RADIUS_ESQUINAS, this.RADIUS_ESQUINAS, 'F');
          doc.rect(inversionX, hookData.cell.y + this.RADIUS_ESQUINAS, inversionW, hookData.row.height - this.RADIUS_ESQUINAS, 'F');
        }
      },
      didDrawCell: (hookData) => {
        const { cell, row, column, section } = hookData;
        if (column.index < hookData.table.columns.length - 1) {
          if (section === 'head') {
            doc.setLineDashPattern([], 0);
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.line(cell.x + cell.width, cell.y + 2, cell.x + cell.width, cell.y + cell.height - 2);
          } else {
            doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
            doc.setLineDashPattern([2, 1.5], 0);
            doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
            doc.setLineWidth(0.35);
            doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
            doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
          }
        }
        if (section === 'body' && row.index < hookData.table.body.length - 1) {
          doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
          doc.setLineDashPattern([2, 1.5], 0);
          doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
          doc.setLineWidth(0.35);
          doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
          doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
        }
        doc.setLineDashPattern([], 0);
      },
    });

    const inversionFinalY = (doc as any).lastAutoTable.finalY;
    drawBodyBorder(inversionX, inversionStartY + inversionHeadH, inversionW, inversionFinalY);

    currentY = inversionFinalY + 16;

    const pNombramiento = 'Los trámites administrativos regulares se inician con los tramites de nombramiento a partir del mes de ' + data.mesInicio + ' y culmina en ' + data.mesFin + '.';
    const splitNomb = doc.splitTextToSize(pNombramiento, tableW);
    doc.text(splitNomb, marginX, currentY);
    currentY += (splitNomb.length * 13) + 14;

    // TABLA 1: Nombramientos de Docentes
    const nombramientosStartY = currentY;
    let nombramientosHeadH = 0;

    autoTable(doc, {
      startY: nombramientosStartY,
      tableWidth: tableW,
      margin: { left: marginX, right: marginX },
      head: [['N°', 'MÓDULO', 'DOCENTE', 'GESTIÓN', 'FECHA NOMBRAMIENTO']],
      body: data.nombramientos.map((item) => [
        item.nro.toString(),
        item.modulo,
        item.docente,
        item.gestion,
        item.fechaNombramiento,
      ]),
      theme: 'plain',
      headStyles: {
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: { top: 6, bottom: 6, left: 3, right: 3 },
      },
      styles: {
        fontSize: 7.5,
        textColor: [0, 0, 0],
        cellPadding: 3.5,
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 24, halign: 'center' },
        1: { cellWidth: 184, fontStyle: 'bold' },
        2: { cellWidth: 124, halign: 'center' },
        3: { cellWidth: 50, halign: 'center' },
        4: { cellWidth: 140, halign: 'center' },
      },
      willDrawCell: (hookData) => {
        if (hookData.section === 'head' && hookData.column.index === 0) {
          nombramientosHeadH = hookData.row.height;
          doc.setFillColor(this.COLOR_AZUL_POSGRADO[0], this.COLOR_AZUL_POSGRADO[1], this.COLOR_AZUL_POSGRADO[2]);
          doc.roundedRect(marginX, hookData.cell.y, tableW, hookData.row.height, this.RADIUS_ESQUINAS, this.RADIUS_ESQUINAS, 'F');
          doc.rect(marginX, hookData.cell.y + this.RADIUS_ESQUINAS, tableW, hookData.row.height - this.RADIUS_ESQUINAS, 'F');
        }
      },
      didDrawCell: (hookData) => {
        const { cell, row, column, section } = hookData;
        if (column.index < hookData.table.columns.length - 1) {
          if (section === 'head') {
            doc.setLineDashPattern([], 0);
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.line(cell.x + cell.width, cell.y + 2, cell.x + cell.width, cell.y + cell.height - 2);
          } else {
            doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
            doc.setLineDashPattern([2, 1.5], 0);
            doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
            doc.setLineWidth(0.35);
            doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
            doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
          }
        }
        if (section === 'body' && row.index < hookData.table.body.length - 1) {
          doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
          doc.setLineDashPattern([2, 1.5], 0);
          doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
          doc.setLineWidth(0.35);
          doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
          doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
        }
        doc.setLineDashPattern([], 0);
      },
    });

    const nombramientosFinalY = (doc as any).lastAutoTable.finalY;
    drawBodyBorder(marginX, nombramientosStartY + nombramientosHeadH, tableW, nombramientosFinalY);

    // ==========================================
    // PAGINA 2: PLANILLA DE REGISTRO DE PARTICIPANTES
    // ==========================================
    doc.addPage();
    drawBackground();

    let yPag2 = 105;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    const pPart = 'A continuación, la nómina de registro de participantes del programa de DIPLOMADO EN ADMINISTRACIÓN DE SERVIDORES GNU/LINUX – versión II – modalidad VIRTUAL.';
    const splitPart = doc.splitTextToSize(pPart, tableW);
    doc.text(splitPart, marginX, yPag2);
    yPag2 += (splitPart.length * 12) + 14;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('PLANILLA DE REGISTRO DE PARTICIPANTES', centroX, yPag2, { align: 'center' });
    yPag2 += 20;

    const partStartY = yPag2;
    let partHeadH = 0;

    autoTable(doc, {
      startY: partStartY,
      tableWidth: tableW,
      margin: { left: marginX, right: marginX },
      head: [
        [
          'N°',
          'APELLIDO PATERNO',
          'APELLIDO MATERNO',
          'NOMBRES',
          'N° DE CARNET',
          'LUGAR',
          'REGISTRO MATRÍCULA',
        ],
      ],
      body: data.participantes.map((p) => [
        p.nro.toString(),
        p.apellidoPaterno,
        p.apellidoMaterno,
        p.nombres,
        p.ci,
        p.lugar,
        p.registroMatricula,
      ]),
      theme: 'plain',
      headStyles: {
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: { top: 6, bottom: 6, left: 2, right: 2 },
      },
      styles: {
        fontSize: 6.8,
        textColor: [0, 0, 0],
        cellPadding: 2.5,
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 22, halign: 'center' },
        1: { cellWidth: 85 },
        2: { cellWidth: 85 },
        3: { cellWidth: 120 },
        4: { cellWidth: 65, halign: 'center' },
        5: { cellWidth: 55, halign: 'center' },
        6: { cellWidth: 90, halign: 'center' },
      },
      willDrawCell: (hookData) => {
        if (hookData.section === 'head' && hookData.column.index === 0) {
          partHeadH = hookData.row.height;
          doc.setFillColor(this.COLOR_AZUL_POSGRADO[0], this.COLOR_AZUL_POSGRADO[1], this.COLOR_AZUL_POSGRADO[2]);
          doc.roundedRect(marginX, hookData.cell.y, tableW, hookData.row.height, this.RADIUS_ESQUINAS, this.RADIUS_ESQUINAS, 'F');
          doc.rect(marginX, hookData.cell.y + this.RADIUS_ESQUINAS, tableW, hookData.row.height - this.RADIUS_ESQUINAS, 'F');
        }
      },
      didDrawCell: (hookData) => {
        const { cell, row, column, section } = hookData;
        if (column.index < hookData.table.columns.length - 1) {
          if (section === 'head') {
            doc.setLineDashPattern([], 0);
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.line(cell.x + cell.width, cell.y + 2, cell.x + cell.width, cell.y + cell.height - 2);
          } else {
            doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
            doc.setLineDashPattern([2, 1.5], 0);
            doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
            doc.setLineWidth(0.35);
            doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
            doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
          }
        }
        if (section === 'body' && row.index < hookData.table.body.length - 1) {
          doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
          doc.setLineDashPattern([2, 1.5], 0);
          doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
          doc.setLineWidth(0.35);
          doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
          doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
        }
        doc.setLineDashPattern([], 0);
      },
    });

    const partFinalY = (doc as any).lastAutoTable.finalY;
    drawBodyBorder(marginX, partStartY + partHeadH, tableW, partFinalY);

    // ==========================================
    // PAGINA 3: DETALLE DE PAGOS Y DESCUENTOS
    // ==========================================
    doc.addPage();
    drawBackground();

    let yPag3 = 105;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    const pPagos = 'A continuación, el detalle de pagos de matrícula, colegiatura y monografías diplomado.';
    const splitPagos = doc.splitTextToSize(pPagos, tableW);
    doc.text(splitPagos, marginX, yPag3);
    yPag3 += (splitPagos.length * 12) + 14;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('DETALLE DE PAGOS', centroX, yPag3, { align: 'center' });
    yPag3 += 20;

    const pagosStartY = yPag3;
    let pagosHeadH = 0;

    autoTable(doc, {
      startY: pagosStartY,
      tableWidth: tableW,
      margin: { left: marginX, right: marginX },
      head: [
        [
          'N°',
          'APELLIDO\nPATERNO',
          'APELLIDO\nMATERNO',
          'NOMBRES',
          'N° DE\nCARNET',
          'CUOTA\nINICIAL',
          'MATRÍCULA',
          'PAGO\nMONOGRAFÍA',
          'TOTAL',
        ],
      ],
      body: data.pagos.map((p) => [
        p.nro.toString(),
        p.apellidoPaterno,
        p.apellidoMaterno,
        p.nombres,
        p.ci,
        p.cuotaInicial.toString(),
        p.matricula.toString(),
        p.pagoMonografia > 0 ? p.pagoMonografia.toString() : '',
        p.total.toString(),
      ]),
      theme: 'plain',
      headStyles: {
        textColor: [255, 255, 255],
        fontSize: 6.8,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: { top: 6, bottom: 6, left: 2, right: 2 },
      },
      styles: {
        fontSize: 6.5,
        textColor: [0, 0, 0],
        cellPadding: 2.2,
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 78 },
        2: { cellWidth: 78 },
        3: { cellWidth: 110 },
        4: { cellWidth: 56, halign: 'center' },
        5: { cellWidth: 50, halign: 'center', fontStyle: 'bold' },
        6: { cellWidth: 45, halign: 'center', textColor: [192, 0, 0], fontStyle: 'bold' },
        7: { cellWidth: 45, halign: 'center' },
        8: { cellWidth: 40, halign: 'center', fontStyle: 'bold' },
      },
      willDrawCell: (hookData) => {
        if (hookData.section === 'head' && hookData.column.index === 0) {
          pagosHeadH = hookData.row.height;
          doc.setFillColor(this.COLOR_AZUL_POSGRADO[0], this.COLOR_AZUL_POSGRADO[1], this.COLOR_AZUL_POSGRADO[2]);
          doc.roundedRect(marginX, hookData.cell.y, tableW, hookData.row.height, this.RADIUS_ESQUINAS, this.RADIUS_ESQUINAS, 'F');
          doc.rect(marginX, hookData.cell.y + this.RADIUS_ESQUINAS, tableW, hookData.row.height - this.RADIUS_ESQUINAS, 'F');
        }
      },
      didDrawCell: (hookData) => {
        const { cell, row, column, section } = hookData;
        if (column.index < hookData.table.columns.length - 1) {
          if (section === 'head') {
            doc.setLineDashPattern([], 0);
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.line(cell.x + cell.width, cell.y + 2, cell.x + cell.width, cell.y + cell.height - 2);
          } else {
            doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
            doc.setLineDashPattern([2, 1.5], 0);
            doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
            doc.setLineWidth(0.35);
            doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
            doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
          }
        }
        if (section === 'body' && row.index < hookData.table.body.length - 1) {
          doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
          doc.setLineDashPattern([2, 1.5], 0);
          doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
          doc.setLineWidth(0.35);
          doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
          doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
        }
        doc.setLineDashPattern([], 0);
      },
    });

    const pagosFinalY = (doc as any).lastAutoTable.finalY;
    drawBodyBorder(marginX, pagosStartY + pagosHeadH, tableW, pagosFinalY);

    // ==========================================
    // PAGINA 4: DESCUENTO DEL 30% Y RESUMEN ACADEMICO
    // ==========================================
    doc.addPage();
    drawBackground();

    let yPag4 = 105;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('DESCUENTO:', marginX, yPag4);
    yPag4 += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const pDesc = 'A continuación, la lista de participantes que se beneficiaron del descuento del 30% de descuento.';
    const splitDesc = doc.splitTextToSize(pDesc, tableW);
    doc.text(splitDesc, marginX, yPag4);
    yPag4 += (splitDesc.length * 12) + 14;

    const descStartY = yPag4;
    let descHeadH = 0;

    autoTable(doc, {
      startY: descStartY,
      tableWidth: tableW,
      margin: { left: marginX, right: marginX },
      head: [
        [
          'N°',
          'APELLIDO PATERNO',
          'APELLIDO MATERNO',
          'NOMBRES',
          'N° DE CARNET',
          'COLEGIATURA',
          '% DE DESCUENTO',
        ],
      ],
      body: data.descuentos.map((d) => [
        d.nro.toString(),
        d.apellidoPaterno,
        d.apellidoMaterno,
        d.nombres,
        d.ci,
        d.colegiatura.toString(),
        d.porcentajeDescuento,
      ]),
      theme: 'plain',
      headStyles: {
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: { top: 6, bottom: 6, left: 2, right: 2 },
      },
      styles: {
        fontSize: 6.8,
        textColor: [0, 0, 0],
        cellPadding: 2.5,
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 22, halign: 'center' },
        1: { cellWidth: 90 },
        2: { cellWidth: 90 },
        3: { cellWidth: 130 },
        4: { cellWidth: 65, halign: 'center' },
        5: { cellWidth: 65, halign: 'center', fontStyle: 'bold' },
        6: { cellWidth: 60, halign: 'center', textColor: [192, 0, 0], fontStyle: 'bold' },
      },
      willDrawCell: (hookData) => {
        if (hookData.section === 'head' && hookData.column.index === 0) {
          descHeadH = hookData.row.height;
          doc.setFillColor(this.COLOR_AZUL_POSGRADO[0], this.COLOR_AZUL_POSGRADO[1], this.COLOR_AZUL_POSGRADO[2]);
          doc.roundedRect(marginX, hookData.cell.y, tableW, hookData.row.height, this.RADIUS_ESQUINAS, this.RADIUS_ESQUINAS, 'F');
          doc.rect(marginX, hookData.cell.y + this.RADIUS_ESQUINAS, tableW, hookData.row.height - this.RADIUS_ESQUINAS, 'F');
        }
      },
      didDrawCell: (hookData) => {
        const { cell, row, column, section } = hookData;
        if (column.index < hookData.table.columns.length - 1) {
          if (section === 'head') {
            doc.setLineDashPattern([], 0);
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.line(cell.x + cell.width, cell.y + 2, cell.x + cell.width, cell.y + cell.height - 2);
          } else {
            doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
            doc.setLineDashPattern([2, 1.5], 0);
            doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
            doc.setLineWidth(0.35);
            doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
            doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
          }
        }
        if (section === 'body' && row.index < hookData.table.body.length - 1) {
          doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
          doc.setLineDashPattern([2, 1.5], 0);
          doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
          doc.setLineWidth(0.35);
          doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
          doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
        }
        doc.setLineDashPattern([], 0);
      },
    });

    const descFinalY = (doc as any).lastAutoTable.finalY;
    drawBodyBorder(marginX, descStartY + descHeadH, tableW, descFinalY);

    yPag4 = descFinalY + 18;

    // SECCION INFORME ACADEMICO (RESUMEN MODULOS)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('INFORME ACADÉMICO', marginX, yPag4);
    yPag4 += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const pAcademico = 'Los resultados académicos evidencian un desempeño satisfactorio de los participantes durante el desarrollo del programa. El Módulo 1 alcanzó la mayor tasa de aprobación, con 21 estudiantes aprobados y 2 reprobados. En los Módulos 2, 3, 4 y 5, los resultados fueron uniformes, registrándose 18 estudiantes aprobados y 5 reprobados en cada uno.';
    const splitAcad = doc.splitTextToSize(pAcademico, tableW);
    doc.text(splitAcad, marginX, yPag4);
    yPag4 += (splitAcad.length * 11.5) + 12;

    const resumenW = 240;
    const resumenX = centroX - (resumenW / 2);
    const resumenStartY = yPag4;
    let resumenHeadH = 0;

    autoTable(doc, {
      startY: resumenStartY,
      tableWidth: resumenW,
      margin: { left: resumenX },
      head: [['MÓDULOS', 'APROBADOS', 'REPROBADOS']],
      body: data.resumenModulos.map((r) => [r.modulo, r.aprobados.toString(), r.reprobados.toString()]),
      theme: 'plain',
      headStyles: {
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: { top: 5, bottom: 5, left: 3, right: 3 },
      },
      styles: {
        fontSize: 7.5,
        textColor: [0, 0, 0],
        cellPadding: 3.5,
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 80, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 80, halign: 'center' },
        2: { cellWidth: 80, halign: 'center' },
      },
      didParseCell: (hookData) => {
        if (hookData.section === 'body') {
          if (hookData.column.index === 1) {
            hookData.cell.styles.fillColor = [226, 239, 218];
            hookData.cell.styles.fontStyle = 'bold';
          } else if (hookData.column.index === 2) {
            hookData.cell.styles.fillColor = [252, 228, 214];
            hookData.cell.styles.fontStyle = 'bold';
          }
        }
      },
      willDrawCell: (hookData) => {
        if (hookData.section === 'head' && hookData.column.index === 0) {
          resumenHeadH = hookData.row.height;
          doc.setFillColor(this.COLOR_AZUL_POSGRADO[0], this.COLOR_AZUL_POSGRADO[1], this.COLOR_AZUL_POSGRADO[2]);
          doc.roundedRect(resumenX, hookData.cell.y, resumenW, hookData.row.height, this.RADIUS_ESQUINAS, this.RADIUS_ESQUINAS, 'F');
          doc.rect(resumenX, hookData.cell.y + this.RADIUS_ESQUINAS, resumenW, hookData.row.height - this.RADIUS_ESQUINAS, 'F');
        }
      },
      didDrawCell: (hookData) => {
        const { cell, row, column, section } = hookData;
        if (column.index < hookData.table.columns.length - 1) {
          if (section === 'head') {
            doc.setLineDashPattern([], 0);
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.line(cell.x + cell.width, cell.y + 2, cell.x + cell.width, cell.y + cell.height - 2);
          } else {
            doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
            doc.setLineDashPattern([2, 1.5], 0);
            doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
            doc.setLineWidth(0.35);
            doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
            doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
          }
        }
        if (section === 'body' && row.index < hookData.table.body.length - 1) {
          doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
          doc.setLineDashPattern([2, 1.5], 0);
          doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
          doc.setLineWidth(0.35);
          doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
          doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
        }
        doc.setLineDashPattern([], 0);
      },
    });

    const resumenFinalY = (doc as any).lastAutoTable.finalY;
    drawBodyBorder(resumenX, resumenStartY + resumenHeadH, resumenW, resumenFinalY);

    // ==========================================
    // PAGINA 5: REGISTRO DE CALIFICACIONES
    // ==========================================
    doc.addPage();
    drawBackground();

    let yPag5 = 105;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);
    doc.text('REGISTRO DE CALIFICACIONES', centroX, yPag5, { align: 'center' });
    yPag5 += 20;

    const califStartY = yPag5;
    let califHeadH = 0;

    autoTable(doc, {
      startY: califStartY,
      tableWidth: tableW,
      margin: { left: marginX, right: marginX },
      head: [
        [
          'N°',
          'APELLIDO\nPATERNO',
          'APELLIDO\nMATERNO',
          'NOMBRES',
          'N° DE\nCARNET',
          'M-1',
          'M-2',
          'M-3',
          'M-4',
          'NOTA\nMONOGRAFÍA',
        ],
      ],
      body: data.calificaciones.map((est) => [
        est.nro.toString(),
        est.apellidoPaterno,
        est.apellidoMaterno,
        est.nombres,
        est.ci,
        est.m1.toString(),
        est.m2.toString(),
        est.m3.toString(),
        est.m4.toString(),
        est.notaMonografia.toString(),
      ]),
      theme: 'plain',
      headStyles: {
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: { top: 6, bottom: 6, left: 2, right: 2 },
      },
      styles: {
        fontSize: 6.8,
        textColor: [0, 0, 0],
        cellPadding: 2.4,
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 82 },
        2: { cellWidth: 82 },
        3: { cellWidth: 118 },
        4: { cellWidth: 58, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' },
        6: { cellWidth: 25, halign: 'center' },
        7: { cellWidth: 25, halign: 'center' },
        8: { cellWidth: 25, halign: 'center' },
        9: { cellWidth: 62, halign: 'center' },
      },
      didParseCell: (hookData) => {
        if (hookData.section === 'body' && hookData.column.index >= 5) {
          const nota = Number(hookData.cell.raw);
          if (nota <= 11) {
            hookData.cell.styles.fillColor = [242, 220, 219];
            hookData.cell.styles.textColor = [192, 0, 0];
            hookData.cell.styles.fontStyle = 'bold';
          }
        }
      },
      willDrawCell: (hookData) => {
        if (hookData.section === 'head' && hookData.column.index === 0) {
          califHeadH = hookData.row.height;
          doc.setFillColor(this.COLOR_AZUL_POSGRADO[0], this.COLOR_AZUL_POSGRADO[1], this.COLOR_AZUL_POSGRADO[2]);
          doc.roundedRect(marginX, hookData.cell.y, tableW, hookData.row.height, this.RADIUS_ESQUINAS, this.RADIUS_ESQUINAS, 'F');
          doc.rect(marginX, hookData.cell.y + this.RADIUS_ESQUINAS, tableW, hookData.row.height - this.RADIUS_ESQUINAS, 'F');
        }
      },
      didDrawCell: (hookData) => {
        const { cell, row, column, section } = hookData;
        if (column.index < hookData.table.columns.length - 1) {
          if (section === 'head') {
            doc.setLineDashPattern([], 0);
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.line(cell.x + cell.width, cell.y + 2, cell.x + cell.width, cell.y + cell.height - 2);
          } else {
            doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
            doc.setLineDashPattern([2, 1.5], 0);
            doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
            doc.setLineWidth(0.35);
            doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
            doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
          }
        }
        if (section === 'body' && row.index < hookData.table.body.length - 1) {
          doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
          doc.setLineDashPattern([2, 1.5], 0);
          doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
          doc.setLineWidth(0.35);
          doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
          doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
        }
        doc.setLineDashPattern([], 0);
      },
    });

    const califFinalY = (doc as any).lastAutoTable.finalY;
    drawBodyBorder(marginX, califStartY + califHeadH, tableW, califFinalY);

    // ==========================================
    // PAGINA 6: REPORTE DE MONOGRAFIAS Y FIRMA
    // ==========================================
    doc.addPage();
    drawBackground();

    let yPag6 = 105;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(0, 0, 0);

    const pMono = 'EN CUANTO AL REPORTE DE MONOGRAFÍAS PRESENTADAS TENEMOS LO SIGUIENTE: Solo 9 participantes presentaron la monografía.';
    const splitMono = doc.splitTextToSize(pMono, tableW);
    doc.text(splitMono, marginX, yPag6);
    yPag6 += (splitMono.length * 13) + 14;

    const monoStartY = yPag6;
    let monoHeadH = 0;

    autoTable(doc, {
      startY: monoStartY,
      tableWidth: tableW,
      margin: { left: marginX, right: marginX },
      head: [['NRO', 'NOMBRE COMPLETO', 'TEMA']],
      body: data.monografias.map((m) => [m.nro.toString(), m.nombreCompleto, m.tema]),
      theme: 'plain',
      headStyles: {
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: { top: 6, bottom: 6, left: 3, right: 3 },
      },
      styles: {
        fontSize: 6.8,
        textColor: [0, 0, 0],
        cellPadding: 3.5,
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 26, halign: 'center' },
        1: { cellWidth: 156, fontStyle: 'bold' },
        2: { cellWidth: 340 },
      },
      willDrawCell: (hookData) => {
        if (hookData.section === 'head' && hookData.column.index === 0) {
          monoHeadH = hookData.row.height;
          doc.setFillColor(this.COLOR_AZUL_POSGRADO[0], this.COLOR_AZUL_POSGRADO[1], this.COLOR_AZUL_POSGRADO[2]);
          doc.roundedRect(marginX, hookData.cell.y, tableW, hookData.row.height, this.RADIUS_ESQUINAS, this.RADIUS_ESQUINAS, 'F');
          doc.rect(marginX, hookData.cell.y + this.RADIUS_ESQUINAS, tableW, hookData.row.height - this.RADIUS_ESQUINAS, 'F');
        }
      },
      didDrawCell: (hookData) => {
        const { cell, row, column, section } = hookData;
        if (column.index < hookData.table.columns.length - 1) {
          if (section === 'head') {
            doc.setLineDashPattern([], 0);
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.line(cell.x + cell.width, cell.y + 2, cell.x + cell.width, cell.y + cell.height - 2);
          } else {
            doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
            doc.setLineDashPattern([2, 1.5], 0);
            doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
            doc.setLineWidth(0.35);
            doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
            doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
          }
        }
        if (section === 'body' && row.index < hookData.table.body.length - 1) {
          doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
          doc.setLineDashPattern([2, 1.5], 0);
          doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
          doc.setLineWidth(0.35);
          doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
          doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
        }
        doc.setLineDashPattern([], 0);
      },
    });

    const monoFinalY = (doc as any).lastAutoTable.finalY;
    drawBodyBorder(marginX, monoStartY + monoHeadH, tableW, monoFinalY);

    // ==========================================
    // BLOQUE DE FIRMA AL PIE (PAGINA FINAL)
    // Línea de firma en color negro centrada
    // ==========================================
    const yLineaFirma = monoFinalY + 65;
    const anchoLineaFirma = 190;
    const x1Firma = centroX - (anchoLineaFirma / 2);
    const x2Firma = centroX + (anchoLineaFirma / 2);

    doc.setLineDashPattern([2.5, 2], 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.6);
    doc.line(x1Firma, yLineaFirma, x2Firma, yLineaFirma);
    doc.setLineDashPattern([], 0);

    const finalYSig = yLineaFirma + 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);

    doc.text(data.responsable.nombre, centroX, finalYSig, { align: 'center' });
    doc.text(data.responsable.cargo, centroX, finalYSig + 10, { align: 'center' });
    doc.text(data.responsable.programa, centroX, finalYSig + 20, { align: 'center' });
    doc.text(data.responsable.versionModalidad, centroX, finalYSig + 30, { align: 'center' });

    const nombreArchivo = 'INFORME_FINAL_DASGL_V2.pdf';
    if (accion === 'descargar') {
      try {
        const blob = doc.output('blob');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) {
            document.body.removeChild(a);
          }
          window.URL.revokeObjectURL(url);
        }, 1500);
      } catch (err) {
        doc.save(nombreArchivo);
      }
    } else {
      const blob = doc.output('blob');
      const blobUrl = window.URL.createObjectURL(blob);
      if (ventanaImpresion && !ventanaImpresion.closed) {
        ventanaImpresion.location.href = blobUrl;
      } else {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) {
            document.body.removeChild(a);
          }
        }, 1000);
      }
    }
  }
}
