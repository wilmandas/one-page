import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../services/productos';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-pagar-servicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagar-servicio.html',
  styleUrl: './pagar-servicio.css'
})
export class PagarServicio implements OnInit {
  servicios = [
    { codigo: 'LUZ', nombre: 'Luz del Sur', icon: '💡' },
    { codigo: 'AGUA', nombre: 'Sedapal', icon: '💧' },
    { codigo: 'INTERNET', nombre: 'Movistar', icon: '🌐' },
    { codigo: 'CELULAR', nombre: 'Claro', icon: '📱' },
    { codigo: 'CABLE', nombre: 'DirecTV', icon: '📺' },
    { codigo: 'GAS', nombre: 'Calidda', icon: '🔥' },
  ];

  servicioSeleccionado: any = null;
  numeroRecibo = '';
  monto: number = 0;
  error = '';
  exito = '';
  loading = false;

  misEntidades: any[] = [];
  entidadOrigen: number | null = null;

  constructor(private service: ProductosService, private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user) {
      this.service.getEntidades().subscribe({
        next: (data: any[]) => {
          this.misEntidades = data.filter((e: any) => e.userId === user.id);
          if (this.misEntidades.length > 0) {
            this.entidadOrigen = this.misEntidades[0].id;
          }
        }
      });
    }
  }

  seleccionar(servicio: any): void {
    this.servicioSeleccionado = servicio;
  }

  pagar(): void {
    this.error = '';
    this.exito = '';

    if (!this.servicioSeleccionado || !this.numeroRecibo || !this.monto || this.monto <= 0) {
      this.error = 'Completa todos los campos.';
      return;
    }

    if (this.misEntidades.length === 0) {
      this.error = 'No tienes entidades vinculadas. Ve a "Mis Entidades" primero.';
      return;
    }

    const origen = this.misEntidades.find((e: any) => e.id === this.entidadOrigen);
    if (!origen || origen.saldo < this.monto) {
      this.error = `Saldo insuficiente. Tienes S/ ${origen?.saldo || 0} en ${origen?.codigo}.`;
      return;
    }

    this.loading = true;

    const user = this.auth.getUser();
    const transaccion = {
      userId: user.id,
      usuario: user.name,
      tipo: 'Pago servicio',
      monto: this.monto,
      destino: this.servicioSeleccionado.nombre,
      concepto: `Recibo ${this.numeroRecibo}`,
      estado: 'completado',
      fecha: new Date().toISOString().split('T')[0]
    };

    this.service.crearTransaccion(transaccion).subscribe({
      next: () => {
        this.exito = `✅ ${this.servicioSeleccionado.nombre} pagado por S/ ${this.monto}`;
        this.numeroRecibo = '';
        this.monto = 0;
        this.servicioSeleccionado = null;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al procesar el pago.';
        this.loading = false;
      }
    });
  }
}