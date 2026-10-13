import { Injectable } from '@angular/core';

export interface LogAuditoria {
  id: string;
  fecha: string;
  userId: number | string | null;
  usuario: string;
  accion: string;
  detalle: string;
  tipo: 'crear' | 'editar' | 'eliminar' | 'login' | 'logout' | 'transferir' | 'aprobar' | 'rechazar';
  ip?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private KEY = 'onepage_auditoria';

  constructor() {}

  registrar(data: {
    userId: number | string | null;
    usuario: string;
    accion: string;
    detalle: string;
    tipo: LogAuditoria['tipo'];
  }): void {
    const logs: LogAuditoria[] = JSON.parse(localStorage.getItem(this.KEY) || '[]');

    const nuevo: LogAuditoria = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      fecha: new Date().toISOString(),
      userId: data.userId,
      usuario: data.usuario,
      accion: data.accion,
      detalle: data.detalle,
      tipo: data.tipo,
      ip: '127.0.0.1'
    };

    logs.unshift(nuevo);
    const limitados = logs.slice(0, 500);
    localStorage.setItem(this.KEY, JSON.stringify(limitados));
  }

  getLogs(): LogAuditoria[] {
    return JSON.parse(localStorage.getItem(this.KEY) || '[]');
  }

  limpiar(): void {
    localStorage.removeItem(this.KEY);
  }

  colorPorTipo(tipo: string): string {
    switch (tipo) {
      case 'crear': return '#059669';
      case 'editar': return '#2563eb';
      case 'eliminar': return '#dc2626';
      case 'login': return '#7c3aed';
      case 'logout': return '#64748b';
      case 'transferir': return '#d97706';
      case 'aprobar': return '#059669';
      case 'rechazar': return '#dc2626';
      default: return '#64748b';
    }
  }

  iconoPorTipo(tipo: string): string {
    switch (tipo) {
      case 'crear': return 'bi-plus-circle-fill';
      case 'editar': return 'bi-pencil-fill';
      case 'eliminar': return 'bi-trash-fill';
      case 'login': return 'bi-box-arrow-in-right';
      case 'logout': return 'bi-box-arrow-right';
      case 'transferir': return 'bi-send-fill';
      case 'aprobar': return 'bi-check-circle-fill';
      case 'rechazar': return 'bi-x-circle-fill';
      default: return 'bi-info-circle-fill';
    }
  }
}