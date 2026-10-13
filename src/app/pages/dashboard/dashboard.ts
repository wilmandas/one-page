import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ProductosService } from '../../services/productos';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  user: any = null;
  creditos: any[] = [];
  transacciones: any[] = [];
  entidades: any[] = [];

  constructor(
    private auth: AuthService,
    private service: ProductosService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUser();

    // 🔄 Si es admin, redirigir al panel admin
    if (this.user && this.user.role === 'admin') {
      this.auth.router.navigate(['/admin']);
      return;
    }

    this.service.getCreditos().subscribe((data: any[]) => {
      this.creditos = data.filter((c: any) => Number(c.userId) === Number(this.user.id));
    });

    this.service.getTransacciones().subscribe((data: any[]) => {
      this.transacciones = data.filter((t: any) => Number(t.userId) === Number(this.user.id));
    });

    this.service.getEntidades().subscribe((data: any[]) => {
      this.entidades = data.filter((e: any) => Number(e.userId) === Number(this.user.id));
    });
  }

  get saldoTotal(): number {
    return this.entidades.reduce((sum, e) => sum + Number(e.saldo), 0);
  }

  logout(): void {
    this.auth.logout();
  }
}