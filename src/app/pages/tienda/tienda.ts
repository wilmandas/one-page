import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ProductosService } from '../../services/productos';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tienda.html',
  styleUrl: './tienda.css'
})
export class Tienda implements OnInit {
  carrito: any[] = [];
  entidades: any[] = [];
  entidadSeleccionada: number | null = null;

  constructor(private auth: AuthService, private service: ProductosService) {}

  ngOnInit(): void {
    this.cargarCarrito();
    this.cargarEntidades();
  }

  cargarCarrito(): void {
    this.carrito = JSON.parse(localStorage.getItem('onepage_carrito') || '[]');
  }

  cargarEntidades(): void {
    const user = this.auth.getUser();
    if (!user) return;

    this.service.getEntidades().subscribe({
      next: (data: any[]) => {
        this.entidades = data.filter((e: any) => Number(e.userId) === Number(user.id));
        if (this.entidades.length > 0) {
          this.entidadSeleccionada = this.entidades[0].id;
        }
      }
    });
  }

  aumentar(item: any): void {
    item.cantidad++;
    this.guardar();
  }

  disminuir(item: any): void {
    if (item.cantidad > 1) {
      item.cantidad--;
      this.guardar();
    }
  }

  eliminar(id: any): void {
    this.carrito = this.carrito.filter(c => c.id !== id);
    this.guardar();
  }

  guardar(): void {
    localStorage.setItem('onepage_carrito', JSON.stringify(this.carrito));
  }

  get subtotal(): number {
    return this.carrito.reduce((s, i) => s + (i.precio * i.cantidad), 0);
  }

  get igv(): number {
    return this.subtotal * 0.18;
  }

  get total(): number {
    return this.subtotal + this.igv;
  }

  vaciarCarrito(): void {
    Swal.fire({
      title: '¿Vaciar carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Sí, vaciar'
    }).then((r) => {
      if (r.isConfirmed) {
        this.carrito = [];
        this.guardar();
        Swal.fire('Vaciado', '', 'success');
      }
    });
  }

  comprar(): void {
    const user = this.auth.getUser();

    if (!user) {
      Swal.fire('Inicia sesión', 'Debes iniciar sesión para comprar', 'warning');
      return;
    }

    if (this.carrito.length === 0) {
      Swal.fire('Carrito vacío', 'Agrega productos antes de comprar', 'warning');
      return;
    }

    if (!this.entidadSeleccionada) {
      Swal.fire('Sin cuenta', 'Vincula una entidad primero', 'warning');
      return;
    }

    const entidad = this.entidades.find((e: any) => Number(e.id) === Number(this.entidadSeleccionada));
    if (!entidad || Number(entidad.saldo) < this.total) {
      Swal.fire('Saldo insuficiente', `Tienes S/ ${entidad?.saldo} en ${entidad?.codigo}`, 'error');
      return;
    }

    const nuevoSaldo = Number(entidad.saldo) - this.total;

    this.service.actualizarEntidad(entidad.id, { saldo: nuevoSaldo }).subscribe({
      next: () => {
        const transaccion = {
          userId: user.id,
          usuario: user.name,
          tipo: 'Compra tienda',
          monto: this.total,
          destino: `${this.carrito.length} producto(s)`,
          concepto: this.carrito.map((c: any) => c.nombre).join(', '),
          estado: 'completado',
          fecha: new Date().toISOString().split('T')[0]
        };

        this.service.crearTransaccion(transaccion).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Compra exitosa!',
            html: `Total pagado: <b>S/ ${this.total.toFixed(2)}</b><br>Desde: <b>${entidad.codigo}</b>`,
            timer: 3000,
            confirmButtonColor: '#7c3aed'
          });

          this.carrito = [];
          this.guardar();
          this.cargarEntidades();
        });
      },
      error: () => {
        Swal.fire('Error', 'No se pudo procesar el pago', 'error');
      }
    });
  }
}