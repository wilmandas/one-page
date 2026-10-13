import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class ContactoPageComponent {
  nombre = '';
  email = '';
  mensaje = '';

  enviar(): void {
    if (!this.nombre || !this.email || !this.mensaje) {
      Swal.fire('Campos vacíos', 'Completa todos los campos', 'warning');
      return;
    }

    Swal.fire({
      icon: 'success',
      title: '¡Mensaje enviado!',
      text: 'Te responderemos a la brevedad posible',
      confirmButtonColor: '#7c3aed'
    });

    this.nombre = '';
    this.email = '';
    this.mensaje = '';
  }
}