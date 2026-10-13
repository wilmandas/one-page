import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private API = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/productos`);
  }

  getCreditos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/creditos`);
  }

  actualizarCredito(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.API}/creditos/${id}`, data);
  }

  crearCredito(credito: any): Observable<any> {
    return this.http.post(`${this.API}/creditos`, credito);
  }

  getTransacciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/transacciones`);
  }

  crearTransaccion(transaccion: any): Observable<any> {
    return this.http.post(`${this.API}/transacciones`, transaccion);
  }

  getEntidades(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/entidades`);
  }

  crearEntidad(entidad: any): Observable<any> {
    return this.http.post(`${this.API}/entidades`, entidad);
  }

  actualizarEntidad(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.API}/entidades/${id}`, data);
  }

  eliminarEntidad(id: number): Observable<any> {
    return this.http.delete(`${this.API}/entidades/${id}`);
  }
}