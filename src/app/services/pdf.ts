import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({ providedIn: 'root' })
export class PdfService {

  generarComprobante(transaccion: any, usuario: any): void {
    const doc = new jsPDF();

    // Colores ONE-PAGE
    const morado = { r: 124, g: 58, b: 237 };
    const gris = { r: 100, g: 116, b: 139 };

    // Header con fondo morado
    doc.setFillColor(morado.r, morado.g, morado.b);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ONE-PAGE', 20, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Tu billetera universal', 20, 27);

    // Ícono de éxito
    doc.setFontSize(40);
    doc.setTextColor(255, 255, 255);
    doc.text('OK', 180, 25);

    // Título
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Comprobante de pago', 20, 60);

    // Línea separadora
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 68, 190, 68);

    // Monto destacado
    doc.setFillColor(245, 243, 255);
    doc.roundedRect(20, 75, 170, 30, 5, 5, 'F');

    doc.setTextColor(gris.r, gris.g, gris.b);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('MONTO ENVIADO', 28, 85);

    doc.setTextColor(morado.r, morado.g, morado.b);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`S/ ${Number(transaccion.monto).toFixed(2)}`, 28, 98);

    // Detalles
    let y = 125;

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES DE LA TRANSACCION', 20, y);
    y += 10;

    doc.setDrawColor(226, 232, 240);
    doc.line(20, y, 190, y);
    y += 8;

    // Filas de detalles
    this.filaDetalle(doc, 'Referencia', transaccion.id || 'N/A', y);
    y += 10;
    this.filaDetalle(doc, 'Tipo', transaccion.tipo || 'P2P', y);
    y += 10;
    this.filaDetalle(doc, 'Fecha', transaccion.fecha || new Date().toLocaleDateString(), y);
    y += 10;
    this.filaDetalle(doc, 'Emisor', transaccion.usuario || usuario?.name || 'N/A', y);
    y += 10;
    this.filaDetalle(doc, 'Beneficiario', transaccion.destino || 'N/A', y);
    y += 10;
    if (transaccion.concepto) {
      this.filaDetalle(doc, 'Concepto', transaccion.concepto, y);
      y += 10;
    }
    this.filaDetalle(doc, 'Estado', transaccion.estado || 'COMPLETADO', y);
    y += 20;

    // Cuadro de estado
    doc.setFillColor(209, 250, 229);
    doc.roundedRect(20, y, 170, 15, 5, 5, 'F');

    doc.setTextColor(4, 120, 87);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSACCION EXITOSA', 28, y + 10);

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 265, 190, 265);

    doc.setTextColor(gris.r, gris.g, gris.b);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Comprobante generado automaticamente por ONE-PAGE', 20, 272);
    doc.text(`Fecha de emision: ${new Date().toLocaleString()}`, 20, 277);
    doc.text('www.onepage.pe | info@onepage.pe', 20, 282);

    // Guardar
    const nombre = `ONE-PAGE-${transaccion.id || Date.now()}.pdf`;
    doc.save(nombre);
  }

  private filaDetalle(doc: any, label: string, valor: string, y: number): void {
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(label, 20, y);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(String(valor), 190, y, { align: 'right' });
  }
}