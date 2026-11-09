import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InformeAcademicoData } from '../models/informe-academico.model';
import { INFORME_ACADEMICO_MOCK } from '../data/informe-academico.mock';
import { FORMULARIO_BG_BASE64 } from '../data/formulario-bg.base64';

@Injectable({ providedIn: 'root' })
export class InformeAcademicoPdfService {

  // Color exacto oficial: #016EB7
  private readonly COLOR_AZUL_POSGRADO: [number, number, number] = [1, 110, 183];
  // Color con 30% de transparencia (70% opacidad) sobre fondo blanco
  private readonly COLOR_LINEAS_DASH: [number, number, number] = [77, 154, 205];
  // Radio de curvatura sutil (4 pt: suave y formal)
  private readonly RADIUS_ESQUINAS = 4;

  generarPdf(
    data: InformeAcademicoData = INFORME_ACADEMICO_MOCK,
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

    // ==========================================
    // PAGINA 1: CARTA Y NOMBRAMIENTO DOCENTE
    // ==========================================

    // Fondo membretado oficial UPEA Posgrado (FORMULARIO.webp)
    doc.addImage(FORMULARIO_BG_BASE64, 'WEBP', 0, 0, pageWidth, pageHeight);

    // Contenido desplazado más abajo para no chocar con el escudo ni con los logos del membrete
    let currentY = 120;

    // Fecha en la esquina superior derecha
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(data.lugarFecha, pageWidth - marginX - 110, currentY);

    currentY += 30;

    // Destinatario a la izquierda (inicia a partir de Y = 150, libre del escudo superior)
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
    doc.text('De mi mayor consideración;', marginX, currentY);
    currentY += 15;

    doc.text('A tiempo de hacerle llegar un cordial saludo.', marginX, currentY);
    currentY += 15;

    const pPrograma = 'Por medio de la presente, hacemos llegar el detalle académico del programa del DIPLOMADO EN ADMINISTRACIÓN DE SERVIDORES GNU/LINUX VERSIÓN II MODALIDAD VIRTUAL.';
    const splitProg = doc.splitTextToSize(pPrograma, pageWidth - (marginX * 2));
    doc.text(splitProg, marginX, currentY);
    currentY += (splitProg.length * 13) + 4;

    const pNombramiento = 'Los tramites de nombramiento de docentes inicia a partir del mes de ' + data.mesInicio + ' y culmina en ' + data.mesFin + '.';
    const splitNomb = doc.splitTextToSize(pNombramiento, pageWidth - (marginX * 2));
    doc.text(splitNomb, marginX, currentY);
    currentY += (splitNomb.length * 13) + 16; // Espaciado elegante antes de la tabla

    // TABLA 1: Nombramiento de Docentes
    const nombramientosBody = data.nombramientos.map((item) => [
      item.nro.toString(),
      item.modulo,
      item.docente,
      item.gestion,
      item.fechaNombramiento,
    ]);

    const tabla1StartY = currentY;
    let tabla1HeadHeight = 0;

    autoTable(doc, {
      startY: tabla1StartY,
      tableWidth: tableW,
      margin: { left: marginX, right: marginX },
      head: [['N°', 'MÓDULO', 'DOCENTE', 'GESTIÓN', 'FECHA NOMBRAMIENTO']],
      body: nombramientosBody,
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
        cellPadding: 4,
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
        // Fondo azul de cabecera con esquinas superiores redondeadas (solo relleno, sin borde exterior en cabecera)
        if (hookData.section === 'head' && hookData.column.index === 0) {
          tabla1HeadHeight = hookData.row.height;
          doc.setFillColor(this.COLOR_AZUL_POSGRADO[0], this.COLOR_AZUL_POSGRADO[1], this.COLOR_AZUL_POSGRADO[2]);
          doc.roundedRect(marginX, hookData.cell.y, tableW, hookData.row.height, this.RADIUS_ESQUINAS, this.RADIUS_ESQUINAS, 'F');
          doc.rect(marginX, hookData.cell.y + this.RADIUS_ESQUINAS, tableW, hookData.row.height - this.RADIUS_ESQUINAS, 'F');
        }
      },
      didDrawCell: (hookData) => {
        const { cell, row, column, section } = hookData;

        // Divisores verticales interiores
        if (column.index < hookData.table.columns.length - 1) {
          if (section === 'head') {
            doc.setLineDashPattern([], 0);
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.line(cell.x + cell.width, cell.y + 2, cell.x + cell.width, cell.y + cell.height - 2);
          } else {
            // Líneas interdelineadas con 30% de transparencia (70% opacidad)
            doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
            doc.setLineDashPattern([2, 1.5], 0);
            doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
            doc.setLineWidth(0.35);
            doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
            doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
          }
        }

        // Divisores horizontales interiores entre filas del cuerpo
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

    // Borde exterior del cuerpo con esquinas inferiores redondeadas (U-shape)
    // Sin tocar la cabecera azul para evitar bordes dentados sobre el título
    const tabla1FinalY = (doc as any).lastAutoTable.finalY;
    const body1StartY = tabla1StartY + tabla1HeadHeight;
    const body1Height = tabla1FinalY - body1StartY;

    doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
    doc.setLineDashPattern([2, 1.5], 0);
    doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
    doc.setLineWidth(0.35);

    const sBezier = (4 / 3) * (Math.SQRT2 - 1);
    const r = this.RADIUS_ESQUINAS;

    doc.lines([
      [0, body1Height - r],
      [0, r * sBezier, r - r * sBezier, r, r, r],
      [tableW - 2 * r, 0],
      [r * sBezier, 0, r, -r * (1 - sBezier), r, -r],
      [0, -(body1Height - r)],
    ], marginX, body1StartY, [1, 1], 'S', false);

    doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
    doc.setLineDashPattern([], 0);

    currentY = tabla1FinalY + 24;

    const pCalificaciones = 'A continuación; tenemos las calificaciones de cada módulo correspondiente al DIPLOMADO EN ADMINISTRACIÓN DE SERVIDORES GNU/LINUX VERSIÓN II MODALIDAD VIRTUAL.';
    const splitCalif = doc.splitTextToSize(pCalificaciones, pageWidth - (marginX * 2));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(splitCalif, marginX, currentY);

    // ==========================================
    // PAGINA 2: REGISTRO DE CALIFICACIONES
    // ==========================================
    doc.addPage();

    // Fondo membretado oficial UPEA Posgrado (FORMULARIO.webp)
    doc.addImage(FORMULARIO_BG_BASE64, 'WEBP', 0, 0, pageWidth, pageHeight);

    // Contenido desplazado más abajo (Y = 105 pt) para no chocar con el membrete institucional
    let yPag2 = 105;

    // Título de la tabla con espaciado superior e inferior holgado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);
    doc.text('REGISTRO DE CALIFICACIONES', pageWidth / 2, yPag2, { align: 'center' });

    yPag2 += 25; // Espacio entre el título y la tabla
    const tabla2StartY = yPag2;

    const calificacionesBody = data.calificaciones.map((est) => [
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
    ]);

    let tabla2HeadHeight = 0;

    autoTable(doc, {
      startY: tabla2StartY,
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
      body: calificacionesBody,
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
        fontSize: 7,
        textColor: [0, 0, 0],
        cellPadding: 2.5,
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
        // Celdas reprobadas (<= 11): fondo rosa suave y letras en rojo con negrita
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
        // En cabecera, fondo azul con esquinas superiores redondeadas suaves (solo relleno, sin borde exterior en cabecera)
        if (hookData.section === 'head' && hookData.column.index === 0) {
          tabla2HeadHeight = hookData.row.height;
          doc.setFillColor(this.COLOR_AZUL_POSGRADO[0], this.COLOR_AZUL_POSGRADO[1], this.COLOR_AZUL_POSGRADO[2]);
          doc.roundedRect(marginX, hookData.cell.y, tableW, hookData.row.height, this.RADIUS_ESQUINAS, this.RADIUS_ESQUINAS, 'F');
          doc.rect(marginX, hookData.cell.y + this.RADIUS_ESQUINAS, tableW, hookData.row.height - this.RADIUS_ESQUINAS, 'F');
        }
      },
      didDrawCell: (hookData) => {
        const { cell, row, column, section } = hookData;

        // Divisores verticales interiores
        if (column.index < hookData.table.columns.length - 1) {
          if (section === 'head') {
            doc.setLineDashPattern([], 0);
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.line(cell.x + cell.width, cell.y + 2, cell.x + cell.width, cell.y + cell.height - 2);
          } else {
            // Líneas interdelineadas con 30% de transparencia (70% opacidad)
            doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
            doc.setLineDashPattern([2, 1.5], 0);
            doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
            doc.setLineWidth(0.35);
            doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
            doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
          }
        }

        // Divisores horizontales interiores entre filas del cuerpo
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

    // Borde exterior del cuerpo con esquinas inferiores redondeadas (U-shape)
    // Sin tocar la cabecera azul para evitar bordes dentados sobre el título
    const tabla2FinalY = (doc as any).lastAutoTable.finalY;
    const body2StartY = tabla2StartY + tabla2HeadHeight;
    const body2Height = tabla2FinalY - body2StartY;

    doc.setGState(new (doc as any).GState({ opacity: 0.7, 'stroke-opacity': 0.7 }));
    doc.setLineDashPattern([2, 1.5], 0);
    doc.setDrawColor(this.COLOR_LINEAS_DASH[0], this.COLOR_LINEAS_DASH[1], this.COLOR_LINEAS_DASH[2]);
    doc.setLineWidth(0.35);

    doc.lines([
      [0, body2Height - r],
      [0, r * sBezier, r - r * sBezier, r, r, r],
      [tableW - 2 * r, 0],
      [r * sBezier, 0, r, -r * (1 - sBezier), r, -r],
      [0, -(body2Height - r)],
    ], marginX, body2StartY, [1, 1], 'S', false);

    doc.setGState(new (doc as any).GState({ opacity: 1, 'stroke-opacity': 1 }));
    doc.setLineDashPattern([], 0);

    // ==========================================
    // BLOQUE DE FIRMA AL PIE (PAGINA 2)
    // Desplazado más abajo con línea interdelineada superior para firmar encima
    // ==========================================
    const centroX = pageWidth / 2;
    const yLineaFirma = tabla2FinalY + 80; // Espacio holgado (+80 pt) para estampar la firma/sello
    const anchoLineaFirma = 190;
    const x1Firma = centroX - (anchoLineaFirma / 2);
    const x2Firma = centroX + (anchoLineaFirma / 2);

    // Línea interdelineada para la firma en color negro
    doc.setLineDashPattern([2.5, 2], 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.6);
    doc.line(x1Firma, yLineaFirma, x2Firma, yLineaFirma);
    doc.setLineDashPattern([], 0);

    // Textos de pie de firma debajo de la línea
    const finalYPag2 = yLineaFirma + 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);

    doc.text(data.responsable.nombre, centroX, finalYPag2, { align: 'center' });
    doc.text(data.responsable.cargo, centroX, finalYPag2 + 10, { align: 'center' });
    doc.text(data.responsable.programa, centroX, finalYPag2 + 20, { align: 'center' });
    doc.text(data.responsable.versionModalidad, centroX, finalYPag2 + 30, { align: 'center' });

    const nombreArchivo = 'INFORME_ACADEMICO_GNU_LINUX_V2.pdf';
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
