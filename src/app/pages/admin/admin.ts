import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../services/productos';
import { AuthService } from '../../services/auth';
import { NotificacionesService } from '../../services/notificaciones';
import { AuditoriaService } from '../../services/auditoria';
import { Chart, registerables } from 'chart.js';
import Swal from 'sweetalert2';

Chart.register(...registerables);

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit, AfterViewInit {
  @ViewChild('graficoSemana') graficoSemana!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoEntidades') graficoEntidades!: ElementRef<HTMLCanvasElement>;

  users: any[] = [];
  creditos: any[] = [];
  transacciones: any[] = [];
  entidades: any[] = [];
  logs: any[] = [];
  tab = 'dashboard';

  busquedaUser = '';

  usuarioSeleccionado: any = null;
  mostrarDetalle = false;

  private chart1: any = null;
  private chart2: any = null;

  constructor(
    private service: ProductosService,
    public auth: AuthService,
    private notifService: NotificacionesService,
    public auditoriaService: AuditoriaService
  ) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.inicializarGraficos(), 800);
  }

  cargarTodo(): void {
    const stored = JSON.parse(localStorage.getItem('onepage_users') || '[]');
    this.users = stored;

    this.service.getCreditos().subscribe((d: any[]) => this.creditos = d);
    this.service.getTransacciones().subscribe((d: any[]) => {
      this.transacciones = d;
      setTimeout(() => this.inicializarGraficos(), 200);
    });
    this.service.getEntidades().subscribe((d: any[]) => {
      this.entidades = d;
      setTimeout(() => this.inicializarGraficos(), 200);
    });

    this.logs = this.auditoriaService.getLogs();
  }

  get usersFiltrados(): any[] {
    if (!this.busquedaUser) return this.users;
    const q = this.busquedaUser.toLowerCase();
    return this.users.filter((u: any) =>
      u.nombre?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      String(u.phone || '').includes(q)
    );
  }

  get pendientes(): number {
    return this.creditos.filter((c: any) => c.estado === 'pendiente').length;
  }

  get montoTotalMovido(): number {
    return this.transacciones.reduce((sum, t) => sum + Number(t.monto || 0), 0);
  }

  get comisionesGeneradas(): number {
    return this.montoTotalMovido * 0.007;
  }

  verDetalle(user: any): void {
    this.usuarioSeleccionado = user;
    this.mostrarDetalle = true;
  }

  cerrarDetalle(): void {
    this.usuarioSeleccionado = null;
    this.mostrarDetalle = false;
  }

  getTransaccionesUsuario(userId: number): any[] {
    return this.transacciones.filter((t: any) => Number(t.userId) === Number(userId));
  }

  getEntidadesUsuario(userId: number): any[] {
    return this.entidades.filter((e: any) => Number(e.userId) === Number(userId));
  }

  getCreditosUsuario(userId: number): any[] {
    return this.creditos.filter((c: any) => Number(c.userId) === Number(userId));
  }

  getSaldoUsuario(userId: number): number {
    return this.getEntidadesUsuario(userId).reduce((s, e) => s + Number(e.saldo || 0), 0);
  }

  getTotalMovidoUsuario(userId: number): number {
    return this.getTransaccionesUsuario(userId).reduce((s, t) => s + Number(t.monto || 0), 0);
  }

  aprobarCredito(id: number): void {
    const credito = this.creditos.find((c: any) => c.id === id);

    Swal.fire({
      title: '¿Aprobar crédito?',
      text: 'El usuario será notificado de la aprobación',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.actualizarCredito(id, { estado: 'aprobado' }).subscribe(() => {
          this.creditos = this.creditos.map((c: any) => 
            c.id === id ? { ...c, estado: 'aprobado' } : c
          );

          if (credito) {
            this.notifService.crear({
              userId: credito.userId,
              tipo: 'success',
              titulo: '¡Crédito aprobado!',
              mensaje: `Tu solicitud de S/ ${credito.monto} fue aprobada`,
              icono: 'bi-cash-stack'
            });

            this.auditoriaService.registrar({
              userId: this.auth.getUser()?.id,
              usuario: this.auth.getUser()?.name || 'Admin',
              accion: 'Crédito aprobado',
              detalle: `Crédito #${id} de ${credito.usuario} por S/ ${credito.monto}`,
              tipo: 'aprobar'
            });
          }

          Swal.fire('¡Aprobado!', 'El crédito fue aprobado', 'success');
          this.logs = this.auditoriaService.getLogs();
        });
      }
    });
  }

  rechazarCredito(id: number): void {
    const credito = this.creditos.find((c: any) => c.id === id);

    Swal.fire({
      title: '¿Rechazar crédito?',
      input: 'text',
      inputLabel: 'Motivo del rechazo',
      inputPlaceholder: 'Ej: Documentación incompleta',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) return 'Debes escribir un motivo';
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.actualizarCredito(id, { 
          estado: 'rechazado', 
          motivoRechazo: result.value 
        }).subscribe(() => {
          this.creditos = this.creditos.map((c: any) => 
            c.id === id ? { ...c, estado: 'rechazado' } : c
          );

          if (credito) {
            this.notifService.crear({
              userId: credito.userId,
              tipo: 'error',
              titulo: 'Crédito rechazado',
              mensaje: `Tu solicitud de S/ ${credito.monto} fue rechazada: ${result.value}`,
              icono: 'bi-x-circle-fill'
            });

            this.auditoriaService.registrar({
              userId: this.auth.getUser()?.id,
              usuario: this.auth.getUser()?.name || 'Admin',
              accion: 'Crédito rechazado',
              detalle: `Crédito #${id} de ${credito.usuario}. Motivo: ${result.value}`,
              tipo: 'rechazar'
            });
          }

          Swal.fire('Rechazado', 'El crédito fue rechazado', 'info');
          this.logs = this.auditoriaService.getLogs();
        });
      }
    });
  }

  toggleUser(user: any): void {
    Swal.fire({
      title: user.activo ? '¿Desactivar usuario?' : '¿Activar usuario?',
      text: user.nombre,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: user.activo ? '#dc2626' : '#059669',
      confirmButtonText: user.activo ? 'Desactivar' : 'Activar'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = this.users.map((u: any) => 
          u.id === user.id ? { ...u, activo: !u.activo } : u
        );
        this.users = updated;
        localStorage.setItem('onepage_users', JSON.stringify(updated));

        this.notifService.crear({
          userId: user.id,
          tipo: user.activo ? 'warning' : 'success',
          titulo: user.activo ? 'Cuenta desactivada' : 'Cuenta activada',
          mensaje: user.activo 
            ? 'Tu cuenta ha sido desactivada temporalmente.' 
            : 'Tu cuenta ha sido reactivada.',
          icono: user.activo ? 'bi-lock-fill' : 'bi-unlock-fill'
        });

        this.auditoriaService.registrar({
          userId: this.auth.getUser()?.id,
          usuario: this.auth.getUser()?.name || 'Admin',
          accion: user.activo ? 'Usuario desactivado' : 'Usuario activado',
          detalle: `${user.nombre} (${user.email})`,
          tipo: 'editar'
        });

        Swal.fire('Actualizado', `Usuario ${!user.activo ? 'activado' : 'desactivado'}`, 'success');
        this.logs = this.auditoriaService.getLogs();
      }
    });
  }

  limpiarLogs(): void {
    Swal.fire({
      title: '¿Limpiar todos los logs?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.auditoriaService.limpiar();
        this.logs = [];
        Swal.fire('Limpiado', 'Los logs han sido eliminados', 'success');
      }
    });
  }

  inicializarGraficos(): void {
    if (this.chart1) this.chart1.destroy();
    if (this.chart2) this.chart2.destroy();

    if (this.graficoSemana && this.graficoSemana.nativeElement) {
      const ctx1 = this.graficoSemana.nativeElement.getContext('2d');
      if (ctx1) {
        this.chart1 = new Chart(ctx1, {
          type: 'line',
          data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
              label: 'Transacciones',
              data: [12, 19, 8, 25, 18, 32, 15],
              borderColor: '#7c3aed',
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
              tension: 0.4,
              fill: true,
              borderWidth: 3,
              pointRadius: 5,
              pointBackgroundColor: '#7c3aed'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
              x: { grid: { display: false } }
            }
          }
        });
      }
    }

    if (this.graficoEntidades && this.graficoEntidades.nativeElement) {
      const conteo: any = {};
      this.entidades.forEach((e: any) => {
        const key = e.codigo || 'OTRO';
        conteo[key] = (conteo[key] || 0) + 1;
      });

      const labels = Object.keys(conteo);
      const valores = Object.values(conteo);

      const ctx2 = this.graficoEntidades.nativeElement.getContext('2d');
      if (ctx2) {
        this.chart2 = new Chart(ctx2, {
          type: 'doughnut',
          data: {
            labels: labels.length > 0 ? labels : ['Sin datos'],
            datasets: [{
              data: valores.length > 0 ? valores : [1],
              backgroundColor: labels.length > 0 
                ? ['#7c3aed', '#2563eb', '#059669', '#d97706', '#db2777', '#0891b2', '#f59e0b', '#10b981']
                : ['#e2e8f0'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
              legend: { position: 'bottom' }
            }
          }
        });
      }
    }
  }

  logout(): void {
    this.auth.logout();
  }
}