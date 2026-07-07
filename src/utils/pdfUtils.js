// src/utils/pdfUtils.js
import { jsPDF } from 'jspdf';
import { formatCOP } from './dateUtils';

/**
 * Genera el PDF de una cotización de arriendo y lo descarga.
 *
 * @param {object} params
 * @param {object} params.settings - { nombreEmpresa, nit, logoBase64 }
 * @param {object} params.cotizacion - {
 *   nombreCliente, telefono, seccion ('cubierta'|'normal'),
 *   tipoContrato ('mensual'|'eventual'), tarifa, vigenciaDesde, vigenciaHasta, notas
 * }
 * @returns {string} nombre del archivo descargado
 */
export function generarCotizacionPDF({ settings, cotizacion }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = 20;

  // ---- Encabezado con logo ----
  if (settings.logoBase64) {
    try {
      doc.addImage(settings.logoBase64, 'PNG', margin, y - 6, 22, 22);
    } catch {
      // Si el formato no es compatible, seguimos sin logo en vez de romper el PDF
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(settings.nombreEmpresa || 'Parqueadero', settings.logoBase64 ? margin + 28 : margin, y);

  if (settings.nit) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`NIT ${settings.nit}`, settings.logoBase64 ? margin + 28 : margin, y + 6);
    doc.setTextColor(0);
  }

  y += 22;
  doc.setDrawColor(220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  // ---- Título ----
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('COTIZACIÓN DE ARRIENDO DE PARQUEADERO', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120);
  const fechaEmision = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Fecha de emisión: ${fechaEmision}`, margin, y);
  doc.setTextColor(0);
  y += 12;

  // ---- Datos del cliente ----
  const filaDato = (label, valor) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(valor || '—'), margin + 45, y);
    y += 7;
  };

  filaDato('Cliente:', cotizacion.nombreCliente);
  if (cotizacion.telefono) filaDato('Teléfono:', cotizacion.telefono);
  filaDato('Tipo de puesto:', cotizacion.seccion === 'cubierta' ? 'Cubierta' : 'Normal / descubierta');
  filaDato('Modalidad:', cotizacion.tipoContrato === 'mensual' ? 'Arriendo mensual' : 'Eventual / por hora');
  if (cotizacion.vigenciaDesde) filaDato('Vigencia desde:', cotizacion.vigenciaDesde);
  if (cotizacion.vigenciaHasta) filaDato('Vigencia hasta:', cotizacion.vigenciaHasta);

  y += 4;

  // ---- Tarifa destacada ----
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Tarifa cotizada', margin + 6, y + 9);
  doc.setFontSize(15);
  doc.text(
    formatCOP(cotizacion.tarifa) + (cotizacion.tipoContrato === 'mensual' ? ' / mes' : ''),
    margin + 6,
    y + 17
  );
  y += 34;

  // ---- Notas ----
  if (cotizacion.notas) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Notas:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    const lineas = doc.splitTextToSize(cotizacion.notas, pageWidth - margin * 2);
    doc.text(lineas, margin, y);
    y += lineas.length * 5 + 6;
  }

  // ---- Footer ----
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    'Esta cotización es informativa y no representa un contrato firmado.',
    margin,
    285
  );

  const nombreArchivo = `cotizacion-${(cotizacion.nombreCliente || 'cliente')
    .toLowerCase()
    .replace(/\s+/g, '-')}.pdf`;

  doc.save(nombreArchivo);
  return nombreArchivo;
}
