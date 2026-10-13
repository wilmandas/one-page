import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notificacion {
  id: string;
  userId: number | string;
  tipo: 'success' | 'info' | 'warning' | 'error';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  icono?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private KEY = 'onepage_notificaciones';
  private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);
  public notificaciones$: Observable<Notificacion[]> = this.notificacionesSubject.asObservable();

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    const data = localStorage.getItem(this.KEY);
    const notifs: Notificacion[] = data ? JSON.parse(data) : [];
    this.notificacionesSubject.next(notifs);
  }

  private guardar(notifs: Notificacion[]): void {
    localStorage.setItem(this.KEY, JSON.stringify(notifs));
    this.notificacionesSubject.next(notifs);
  }

  // ➕ Crear notificación
  crear(data: {
    userId: number | string;
    tipo: 'success' | 'info' | 'warning' | 'error';
    titulo: string;
    mensaje: string;
    icono?: string;
  }): void {
    const notifs = this.notificacionesSubject.value;
    const nueva: Notificacion = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      userId: data.userId,
      tipo: data.tipo,
      titulo: data.titulo,
      mensaje: data.mensaje,
      fecha: new Date().toISOString(),
      leida: false,
      icono: data.icono || this.iconoPorTipo(data.tipo),
    };

    notifs.unshift(nueva); // Agregar al inicio
    // Mantener solo las últimas 50
    const limitado = notifs.slice(0, 50);
    this.guardar(limitado);
  }

  // 📋 Obtener notificaciones de un usuario
  getByUser(userId: number | string): Notificacion[] {
    return this.notificacionesSubject.value.filter(
      n => String(n.userId) === String(userId)
    );
  }

  // 🔔 Contar no leídas
  contarNoLeidas(userId: number | string): number {
    return this.getByUser(userId).filter(n => !n.leida).length;
  }

  // ✅ Marcar como leída
  marcarLeida(id: string): void {
    const notifs = this.notificacionesSubject.value.map(n =>
      n.id === id ? { ...n, leida: true } : n
    );
    this.guardar(notifs);
  }

  // ✅ Marcar todas como leídas
  marcarTodasLeidas(userId: number | string): void {
    const notifs = this.notificacionesSubject.value.map(n =>
      String(n.userId) === String(userId) ? { ...n, leida: true } : n
    );
    this.guardar(notifs);
  }

  // 🗑️ Eliminar una notificación
  eliminar(id: string): void {
    const notifs = this.notificacionesSubject.value.filter(n => n.id !== id);
    this.guardar(notifs);
  }

  // 🗑️ Limpiar todas de un usuario
  limpiar(userId: number | string): void {
    const notifs = this.notificacionesSubject.value.filter(
      n => String(n.userId) !== String(userId)
    );
    this.guardar(notifs);
  }

  private iconoPorTipo(tipo: string): string {
    switch (tipo) {
      case 'success': return 'bi-check-circle-fill';
      case 'warning': return 'bi-exclamation-triangle-fill';
      case 'error': return 'bi-x-circle-fill';
      default: return 'bi-info-circle-fill';
    }
  }

  // 🎨 Color por tipo
  colorPorTipo(tipo: string): string {
    switch (tipo) {
      case 'success': return '#059669';
      case 'warning': return '#d97706';
      case 'error': return '#dc2626';
      default: return '#2563eb';
    }
  }

  // ⏱️ Tiempo relativo
  tiempoRelativo(fecha: string): string {
    const diff = Date.now() - new Date(fecha).getTime();
    const min = Math.floor(diff / 60000);
    const hrs = Math.floor(min / 60);
    const dias = Math.floor(hrs / 24);

    if (min < 1) return 'Ahora';
    if (min < 60) return `Hace ${min} min`;
    if (hrs < 24) return `Hace ${hrs}h`;
    if (dias < 7) return `Hace ${dias}d`;
    return new Date(fecha).toLocaleDateString();
  }
}