import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductosService } from '../../services/productos';
import { AuthService } from '../../services/auth';
import { PdfService } from '../../services/pdf';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial implements OnInit {
  transacciones: any[] = [];
  filtro = 'todos';
  cargando = true;
  user: any = null;

  constructor(
    private service: ProductosService,
    private auth: AuthService,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUser();
    if (!this.user) return;

    this.service.getTransacciones().subscribe({
      next: (data: any[]) => {
        this.transacciones = data
          .filter((t: any) => Number(t.userId) === Number(this.user.id))
          .reverse();
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  get filtradas(): any[] {
    if (this.filtro === 'todos') return this.transacciones;
    return this.transacciones.filter(t => t.tipo.toLowerCase().includes(this.filtro));
  }

  get totalEnviado(): number {
    return this.transacciones.reduce((s, t) => s + Number(t.monto || 0), 0);
  }

  descargarPDF(t: any): void {
    try {
      this.pdfService.generarComprobante(t, this.user);
      Swal.fire({
        icon: 'success',
        title: 'PDF generado',
        text: 'El comprobante se descargó correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error al generar PDF:', err);
      Swal.fire('Error', 'No se pudo generar el PDF', 'error');
    }
  }

  verDetalle(t: any): void {
    Swal.fire({
      title: 'Detalle de transacción',
      html: `
        <div style="text-align: left; font-size: 14px;">
          <p><b>Referencia:</b> ${t.id}</p>
          <p><b>Tipo:</b> ${t.tipo}</p>
          <p><b>Fecha:</b> ${t.fecha}</p>
          <p><b>Emisor:</b> ${t.usuario || 'N/A'}</p>
          <p><b>Beneficiario:</b> ${t.destino || 'N/A'}</p>
          ${t.concepto ? `<p><b>Concepto:</b> ${t.concepto}</p>` : ''}
          <p><b>Monto:</b> <span style="color: #dc2626;">S/ ${Number(t.monto).toFixed(2)}</span></p>
          <p><b>Estado:</b> <span style="color: #059669;">${t.estado}</span></p>
        </div>
      `,
      confirmButtonText: 'Descargar PDF',
      showCancelButton: true,
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#64748b'
    }).then((result) => {
      if (result.isConfirmed) {
        this.descargarPDF(t);
      }
    });
  }
}