import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InformeDescuentoData } from '../models/informe-descuento.model';
import { INFORME_DESCUENTO_MOCK } from '../data/informe-descuento.mock';
import { FORMULARIO_BG_BASE64 } from '../data/formulario-bg.base64';

@Injectable({ providedIn: 'root' })
export class InformeDescuentoPdfService {

  // Color exacto oficial: #016EB7
  private readonly COLOR_AZUL_POSGRADO: [number, number, number] = [1, 110, 183];
  // Color con 30% de transparencia (70% opacidad) sobre fondo blanco
  private readonly COLOR_LINEAS_DASH: [number, number, number] = [77, 154, 205];
  // Radio de curvatura sutil (4 pt: suave y formal)
  private readonly RADIUS_ESQUINAS = 4;

  generarPdf(
    data: InformeDescuentoData = INFORME_DESCUENTO_MOCK,
    accion: 'imprimir' | 'descargar' = 'imprimir'
  ) {
    // Abrir la ventana inmediatamente con el clic del usuario para evitar bloqueo de popups
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
    // PAGINA 1: CARTA, TABLA 30% DESCUENTO Y FIRMA
    // ==========================================
    drawBackground();

    let currentY = 112;

    // Fecha en la esquina superior derecha
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(0, 0, 0);
    doc.text(data.lugarFecha, pageWidth - marginX - 110, currentY);

    currentY += 26;

    // Destinatario a la izquierda
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(data.destinatario.tratamiento, marginX, currentY);
    currentY += 12;

    doc.setFont('helvetica', 'bold');
    doc.text(data.destinatario.nombre, marginX, currentY);
    currentY += 12;

    doc.text(data.destinatario.cargo, marginX, currentY);
    currentY += 12;

    doc.text(data.destinatario.institucion, marginX, currentY);
    currentY += 12;

    doc.setFont('helvetica', 'normal');
    doc.text('Presente. -', marginX, currentY);
    currentY += 24;

    // Referencia subrayada
    const refX = marginX + 115;
    const refWidth = pageWidth - marginX - refX;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const refLineas = doc.splitTextToSize('Ref.:  ' + data.referencia, refWidth);

    refLineas.forEach((linea: string) => {
      doc.text(linea, refX, currentY);
      const textWidth = doc.getTextWidth(linea);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.8);
      doc.line(refX, currentY + 2, refX + textWidth, currentY + 2);
      currentY += 11;
    });

    currentY += 18;

    // Saludo y cuerpo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('A tiempo de hacerle llegar un cordial saludo.', marginX, currentY);
    currentY += 14;

    const pPrograma = 'Por medio de la presente, hacemos llegar el detalle del proceso académico y administrativo del programa de ' + data.programa + ' ' + data.version + ' ' + data.modalidad + '.';
    const splitProg = doc.splitTextToSize(pPrograma, tableW);
    doc.text(splitProg, marginX, currentY);
    currentY += (splitProg.length * 11.5) + 6;

    const pOpto = data.textoExplicativo;
    const splitOpto = doc.splitTextToSize(pOpto, tableW);
    doc.text(splitOpto, marginX, currentY);
    currentY += (splitOpto.length * 11.5) + 12;

    // Título de la tabla
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('30% DE DESCUENTO', centroX, currentY, { align: 'center' });
    currentY += 8;

    // TABLA BENEFICIARIOS DE DESCUENTO
    const descStartY = currentY;
    let descHeadH = 0;

    autoTable(doc, {
      startY: descStartY,
      tableWidth: tableW,
      margin: { left: marginX, right: marginX },
      head: [
        [
          'Nª',
          'APELLIDO PATERNO',
          'APELLIDO MATERNO',
          'NOMBRES',
          'Nª DE CARNET',
          'COLEGIATURA',
          '% DE DESCUENTO',
        ],
      ],
      body: data.beneficiarios.map((d) => [
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
        cellPadding: { top: 5, bottom: 5, left: 2, right: 2 },
      },
      styles: {
        fontSize: 6.8,
        textColor: [0, 0, 0],
        cellPadding: 2,
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

    // ==========================================
    // BLOQUE DE FIRMA AL PIE (PAGINA 1)
    // Línea de firma negra centrada
    // ==========================================
    const yLineaFirma = descFinalY + 45;
    const anchoLineaFirma = 190;
    const x1Firma = centroX - (anchoLineaFirma / 2);
    const x2Firma = centroX + (anchoLineaFirma / 2);

    doc.setLineDashPattern([2.5, 2], 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.6);
    doc.line(x1Firma, yLineaFirma, x2Firma, yLineaFirma);
    doc.setLineDashPattern([], 0);

    const finalYSig = yLineaFirma + 13;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);

    doc.text(data.responsable.nombre, centroX, finalYSig, { align: 'center' });
    doc.text(data.responsable.cargo, centroX, finalYSig + 10, { align: 'center' });
    doc.text(data.responsable.programa, centroX, finalYSig + 20, { align: 'center' });
    doc.text(data.responsable.versionModalidad, centroX, finalYSig + 30, { align: 'center' });

    // Salida según acción
    const nombreArchivo = 'INFORME_DESCUENTO_DASGL_V2.pdf';
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
