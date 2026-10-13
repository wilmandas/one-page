import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  email = '';
  password = '';
  error = '';
  loading = false;
  modoRegistro = false;

  // Registro
  regNombre = '';
  regEmail = '';
  regPhone = '';
  regGenero = '';
  regPassword = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!localStorage.getItem('onepage_users')) {
      const users = [
        { id: 1, nombre: 'Benito Ruiz', email: 'benito@test.com', password: '123456', phone: '987654321', role: 'user', activo: true, genero: 'masculino' },
        { id: 2, nombre: 'Alexander Aley', email: 'alexander@test.com', password: '123456', phone: '955035628', role: 'user', activo: true, genero: 'masculino' },
        { id: 3, nombre: 'Admin ONE-PAGE', email: 'admin@onepage.pe', password: 'admin123', phone: '999111222', role: 'admin', activo: true, genero: 'masculino' },
        { id: 4, nombre: 'Demo', email: 'demo@onepage.pe', password: 'demo123', phone: '999888777', role: 'user', activo: true, genero: 'femenino' },
      ];
      localStorage.setItem('onepage_users', JSON.stringify(users));
    }
  }

  onSubmit(): void {
    this.error = '';
    this.loading = true;

    setTimeout(() => {
      const r = this.auth.login(this.email, this.password);
      if (r.success) {
        const user = this.auth.getUser();
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.error = r.message;
        this.loading = false;
      }
    }, 500);
  }

  registrar(): void {
    this.error = '';

    if (!this.regNombre || !this.regEmail || !this.regPassword || !this.regPhone) {
      this.error = 'Completa todos los campos obligatorios.';
      return;
    }

    if (!this.regGenero) {
      this.error = 'Selecciona tu género.';
      return;
    }

    this.loading = true;
    setTimeout(() => {
      const r = this.auth.register({
        nombre: this.regNombre,
        email: this.regEmail,
        password: this.regPassword,
        phone: this.regPhone,
      });

      if (r.success) {
        this.modoRegistro = false;
        this.email = this.regEmail;
        this.password = this.regPassword;
        this.error = '✅ Cuenta creada. Ahora ingresa.';
        this.loading = false;
      } else {
        this.error = r.message;
        this.loading = false;
      }
    }, 500);
  }
}