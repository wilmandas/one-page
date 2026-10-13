import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Contacto {
  id: string;
  userId: number | string;
  nombre: string;
  telefono: string;
  alias?: string;
  entidadPreferida?: string;
  fechaCreacion: string;
}

@Injectable({ providedIn: 'root' })
export class ContactosService {
  private KEY = 'onepage_contactos';
  private contactosSubject = new BehaviorSubject<Contacto[]>([]);
  public contactos$: Observable<Contacto[]> = this.contactosSubject.asObservable();

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    const data = localStorage.getItem(this.KEY);
    const contactos: Contacto[] = data ? JSON.parse(data) : [];
    this.contactosSubject.next(contactos);
  }

  private guardar(contactos: Contacto[]): void {
    localStorage.setItem(this.KEY, JSON.stringify(contactos));
    this.contactosSubject.next(contactos);
  }

  getByUser(userId: number | string): Contacto[] {
    return this.contactosSubject.value.filter(
      c => String(c.userId) === String(userId)
    );
  }

  crear(data: {
    userId: number | string;
    nombre: string;
    telefono: string;
    alias?: string;
    entidadPreferida?: string;
  }): { success: boolean; message: string } {
    const contactos = this.contactosSubject.value;

    const existe = contactos.find(
      c => String(c.userId) === String(data.userId) && c.telefono === data.telefono
    );

    if (existe) {
      return { success: false, message: 'Este contacto ya existe' };
    }

    const nuevo: Contacto = {
      id: Date.now().toString(),
      userId: data.userId,
      nombre: data.nombre,
      telefono: data.telefono,
      alias: data.alias,
      entidadPreferida: data.entidadPreferida,
      fechaCreacion: new Date().toISOString()
    };

    contactos.push(nuevo);
    this.guardar(contactos);
    return { success: true, message: 'Contacto agregado' };
  }

  eliminar(id: string): void {
    const contactos = this.contactosSubject.value.filter(c => c.id !== id);
    this.guardar(contactos);
  }

  actualizar(id: string, data: Partial<Contacto>): void {
    const contactos = this.contactosSubject.value.map(c =>
      c.id === id ? { ...c, ...data } : c
    );
    this.guardar(contactos);
  }
}