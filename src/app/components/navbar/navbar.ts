import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NotificacionesService, Notificacion } from '../../services/notificaciones';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  user: any = null;
  mobileMenuOpen = false;

  notificaciones: Notificacion[] = [];
  noLeidas = 0;
  mostrarPanel = false;

  private intervalo: any;

  constructor(
    private router: Router,
    public notifService: NotificacionesService
  ) {}

  ngOnInit(): void {
    this.checkLogin();
    this.intervalo = setInterval(() => {
      this.checkLogin();
      this.actualizarNotificaciones();
    }, 1500);
  }

  ngOnDestroy(): void {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  checkLogin(): void {
    const session = JSON.parse(localStorage.getItem('onepage_user') || 'null');
    this.isLoggedIn = session !== null;
    this.isAdmin = session !== null && session.role === 'admin';
    this.user = session;
  }

  actualizarNotificaciones(): void {
    if (!this.user) {
      this.notificaciones = [];
      this.noLeidas = 0;
      return;
    }
    this.notificaciones = this.notifService.getByUser(this.user.id);
    this.noLeidas = this.notifService.contarNoLeidas(this.user.id);
  }

  togglePanel(): void {
    this.mostrarPanel = !this.mostrarPanel;
    if (this.mostrarPanel) {
      setTimeout(() => {
        if (this.user) {
          this.notifService.marcarTodasLeidas(this.user.id);
          this.actualizarNotificaciones();
        }
      }, 1500);
    }
  }

  cerrarPanel(): void {
    this.mostrarPanel = false;
  }

  limpiarNotificaciones(): void {
    if (this.user) {
      this.notifService.limpiar(this.user.id);
      this.actualizarNotificaciones();
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  logout(): void {
    localStorage.removeItem('onepage_user');
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.user = null;
    this.notificaciones = [];
    this.noLeidas = 0;
    this.mobileMenuOpen = false;
    this.router.navigate(['/']);
  }
}