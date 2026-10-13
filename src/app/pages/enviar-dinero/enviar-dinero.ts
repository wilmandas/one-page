import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductosService } from '../../services/productos';
import { AuthService } from '../../services/auth';
import { NotificacionesService } from '../../services/notificaciones';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-enviar-dinero',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './enviar-dinero.html',
  styleUrl: './enviar-dinero.css'
})
export class EnviarDinero implements OnInit {
  destinatario = '';
  monto: number = 0;
  concepto = '';
  loading = false;

  misEntidades: any[] = [];
  entidadOrigen: any = null;

  constructor(
    private service: ProductosService,
    private auth: AuthService,
    private notifService: NotificacionesService
  ) {}

  ngOnInit(): void {
    this.cargarEntidades();
  }

  cargarEntidades(): void {
    const user = this.auth.getUser();
    if (!user) return;

    this.service.getEntidades().subscribe({
      next: (data: any[]) => {
        this.misEntidades = data.filter((e: any) => Number(e.userId) === Number(user.id));
        if (this.misEntidades.length > 0) {
          this.entidadOrigen = this.misEntidades[0].id;
        }
      }
    });
  }

  enviar(): void {
    if (!this.destinatario || !this.monto || this.monto <= 0) {
      Swal.fire('Campos incompletos', 'Completa todos los campos', 'warning');
      return;
    }

    if (this.misEntidades.length === 0) {
      Swal.fire('Sin entidades', 'Ve a "Mis Entidades" y vincula una cuenta primero', 'warning');
      return;
    }

    const origen = this.misEntidades.find((e: any) => Number(e.id) === Number(this.entidadOrigen));
    if (!origen) {
      Swal.fire('Error', 'Selecciona una cuenta de origen', 'error');
      return;
    }

    if (Number(origen.saldo) < this.monto) {
      Swal.fire('Saldo insuficiente', `Tienes S/ ${origen.saldo} en ${origen.codigo}`, 'error');
      return;
    }

    this.loading = true;

    const users = JSON.parse(localStorage.getItem('onepage_users') || '[]');

    this.service.getEntidades().subscribe({
      next: (todasLasEntidades: any[]) => {

        let destinatarioEncontrado: any = null;
        let entidadDestino: any = null;

        destinatarioEncontrado = users.find((u: any) => String(u.phone) === String(this.destinatario));

        if (destinatarioEncontrado) {
          entidadDestino = todasLasEntidades.find(
            (e: any) => Number(e.userId) === Number(destinatarioEncontrado.id)
          );
        } else {
          const entidadPorNumero = todasLasEntidades.find(
            (e: any) => String(e.numero) === String(this.destinatario)
          );
          if (entidadPorNumero) {
            entidadDestino = entidadPorNumero;
            destinatarioEncontrado = users.find(
              (u: any) => Number(u.id) === Number(entidadPorNumero.userId)
            );
          }
        }

        const nombreDestino = destinatarioEncontrado ? destinatarioEncontrado.nombre : this.destinatario;

        const user = this.auth.getUser();
        const transaccion = {
          userId: user.id,
          usuario: user.name,
          tipo: 'P2P',
          monto: this.monto,
          destino: nombreDestino,
          concepto: this.concepto || 'Sin concepto',
          estado: 'completado',
          fecha: new Date().toISOString().split('T')[0]
        };

        const nuevoSaldoOrigen = Number(origen.saldo) - Number(this.monto);

        this.service.actualizarEntidad(origen.id, { saldo: nuevoSaldoOrigen }).subscribe({
          next: () => {

            if (entidadDestino) {
              const nuevoSaldoDestino = Number(entidadDestino.saldo) + Number(this.monto);
              this.service.actualizarEntidad(entidadDestino.id, { saldo: nuevoSaldoDestino }).subscribe({
                next: () => {
                  this.crearNotificaciones(transaccion, destinatarioEncontrado, user);
                  this.registrarTransaccion(transaccion, nombreDestino);
                }
              });
            } else if (destinatarioEncontrado) {
              const entidadNueva = {
                userId: destinatarioEncontrado.id,
                codigo: 'ONE',
                nombre: 'Cuenta ONE-PAGE',
                numero: this.generarNumeroCuenta(),
                saldo: Number(this.monto),
                principal: true,
                color: '#7c3aed'
              };
              this.service.crearEntidad(entidadNueva).subscribe({
                next: () => {
                  this.crearNotificaciones(transaccion, destinatarioEncontrado, user);
                  this.registrarTransaccion(transaccion, nombreDestino);
                }
              });
            } else {
              this.registrarTransaccion(transaccion, null);
            }
          }
        });
      }
    });
  }

  // 🆕 Crear notificaciones para emisor y receptor
  crearNotificaciones(transaccion: any, destinatario: any, emisor: any): void {
    // Notificación para el emisor (confirmación)
    this.notifService.crear({
      userId: emisor.id,
      tipo: 'success',
      titulo: 'Envío exitoso',
      mensaje: `Enviaste S/ ${transaccion.monto} a ${destinatario?.nombre || transaccion.destino}`,
      icono: 'bi-send-check-fill'
    });

    // Notificación para el receptor
    if (destinatario) {
      this.notifService.crear({
        userId: destinatario.id,
        tipo: 'success',
        titulo: '¡Dinero recibido!',
        mensaje: `Recibiste S/ ${transaccion.monto} de ${emisor.name}`,
        icono: 'bi-cash-coin'
      });
    }
  }

  generarNumeroCuenta(): string {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }

  registrarTransaccion(transaccion: any, nombreDestino: string | null): void {
    this.service.crearTransaccion(transaccion).subscribe({
      next: () => {
        this.cargarEntidades();
        this.destinatario = '';
        this.monto = 0;
        this.concepto = '';
        this.loading = false;

        Swal.fire({
          icon: 'success',
          title: '¡Envío exitoso!',
          html: nombreDestino 
            ? `Enviaste <b>S/ ${transaccion.monto}</b> a <b>${nombreDestino}</b>`
            : `Enviaste <b>S/ ${transaccion.monto}</b> a ${transaccion.destino} (usuario externo)`,
          timer: 3000,
          timerProgressBar: true,
          confirmButtonColor: '#7c3aed'
        });
      }
    });
  }
}