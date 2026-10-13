import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ProductosService } from '../../services/productos';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mi-cuenta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mi-cuenta.html',
  styleUrl: './mi-cuenta.css'
})
export class MiCuenta implements OnInit {
  user: any = null;
  entidades: any[] = [];
  transacciones: any[] = [];

  // Formulario perfil
  editando = false;
  formNombre = '';
  formEmail = '';
  formPhone = '';

  // Formulario contraseña
  formCurrentPassword = '';
  formNewPassword = '';
  formConfirmPassword = '';
  mostrarPassword = false;

  constructor(private auth: AuthService, private service: ProductosService) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.user = this.auth.getUser();
    if (!this.user) return;

    this.formNombre = this.user.name;
    this.formEmail = this.user.email;
    this.formPhone = this.user.phone;

    this.service.getEntidades().subscribe({
      next: (data: any[]) => {
        this.entidades = data.filter((e: any) => Number(e.userId) === Number(this.user.id));
      }
    });

    this.service.getTransacciones().subscribe({
      next: (data: any[]) => {
        this.transacciones = data.filter((t: any) => Number(t.userId) === Number(this.user.id));
      }
    });
  }

  getSaldoTotal(): number {
    return this.entidades.reduce((sum, e) => sum + Number(e.saldo), 0);
  }

  get totalEnviado(): number {
    return this.transacciones.reduce((sum, t) => sum + Number(t.monto || 0), 0);
  }

  toggleEdicion(): void {
    this.editando = !this.editando;
    if (!this.editando) {
      this.formNombre = this.user.name;
      this.formEmail = this.user.email;
      this.formPhone = this.user.phone;
    }
  }

  guardarPerfil(): void {
    if (!this.formNombre || !this.formEmail || !this.formPhone) {
      Swal.fire('Campos vacíos', 'Completa todos los campos', 'warning');
      return;
    }

    const result = this.auth.updateProfile({
      nombre: this.formNombre,
      email: this.formEmail,
      phone: this.formPhone,
    });

    if (result.success) {
      this.user = this.auth.getUser();
      this.editando = false;
      Swal.fire({
        icon: 'success',
        title: '¡Perfil actualizado!',
        text: result.message,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire('Error', result.message, 'error');
    }
  }

  cambiarPassword(): void {
    if (!this.formCurrentPassword || !this.formNewPassword || !this.formConfirmPassword) {
      Swal.fire('Campos vacíos', 'Completa todos los campos', 'warning');
      return;
    }

    if (this.formNewPassword !== this.formConfirmPassword) {
      Swal.fire('Error', 'Las contraseñas nuevas no coinciden', 'error');
      return;
    }

    if (this.formNewPassword.length < 6) {
      Swal.fire('Error', 'La nueva contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    const result = this.auth.changePassword(this.formCurrentPassword, this.formNewPassword);

    if (result.success) {
      this.formCurrentPassword = '';
      this.formNewPassword = '';
      this.formConfirmPassword = '';
      Swal.fire({
        icon: 'success',
        title: '¡Contraseña actualizada!',
        text: 'Tu nueva contraseña está activa',
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire('Error', result.message, 'error');
    }
  }

  // 🆕 Método público para el botón de logout
  logout(): void {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Tendrás que volver a iniciar sesión',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.auth.logout();
      }
    });
  }
}