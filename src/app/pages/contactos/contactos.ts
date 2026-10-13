import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactosService } from '../../services/contactos';
import { AuthService } from '../../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contactos',
  standalone: true,
imports: [CommonModule, FormsModule],
  templateUrl: './contactos.html',
  styleUrl: './contactos.css'
})
export class Contactos implements OnInit {
  contactos: any[] = [];
  mostrarForm = false;

  nuevoNombre = '';
  nuevoTelefono = '';
  nuevoAlias = '';
  nuevoEntidad = '';

  entidades = ['BCP', 'Interbank', 'BBVA', 'Scotiabank', 'Yape', 'Plin', 'BIM', 'Otro'];

  constructor(private service: ContactosService, private auth: AuthService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const user = this.auth.getUser();
    if (!user) return;
    this.contactos = this.service.getByUser(user.id);
  }

  agregar(): void {
    if (!this.nuevoNombre || !this.nuevoTelefono) {
      Swal.fire('Campos vacíos', 'Nombre y teléfono son obligatorios', 'warning');
      return;
    }

    const user = this.auth.getUser();
    const result = this.service.crear({
      userId: user.id,
      nombre: this.nuevoNombre,
      telefono: this.nuevoTelefono,
      alias: this.nuevoAlias || undefined,
      entidadPreferida: this.nuevoEntidad || undefined
    });

    if (result.success) {
      this.cargar();
      this.nuevoNombre = '';
      this.nuevoTelefono = '';
      this.nuevoAlias = '';
      this.nuevoEntidad = '';
      this.mostrarForm = false;
      Swal.fire({
        icon: 'success',
        title: '¡Contacto guardado!',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      Swal.fire('Error', result.message, 'error');
    }
  }

  eliminar(id: string, nombre: string): void {
    Swal.fire({
      title: '¿Eliminar contacto?',
      text: nombre,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.eliminar(id);
        this.cargar();
        Swal.fire('Eliminado', 'Contacto eliminado', 'success');
      }
    });
  }
}