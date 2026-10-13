import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductosService } from '../../services/productos';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ofertas.html',
  styleUrl: './ofertas.css'
})
export class Ofertas implements OnInit {
  ofertas: any[] = [];
  cargando = true;

  constructor(private service: ProductosService) {}

  ngOnInit(): void {
    this.service.getProductos().subscribe({
      next: (data: any[]) => {
        this.ofertas = data.filter((p: any) => p.descuento && p.descuento > 0);
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  precioFinal(p: any): number {
    return p.precio * (1 - p.descuento / 100);
  }

  agregarAlCarrito(producto: any): void {
    const carrito = JSON.parse(localStorage.getItem('onepage_carrito') || '[]');
    const existe = carrito.find((c: any) => c.id === producto.id);
    const precio = this.precioFinal(producto);

    if (existe) {
      existe.cantidad++;
    } else {
      carrito.push({ ...producto, precio, cantidad: 1 });
    }

    localStorage.setItem('onepage_carrito', JSON.stringify(carrito));

    Swal.fire({
      icon: 'success',
      title: '¡Agregado!',
      html: `<b>${producto.nombre}</b> al carrito<br>S/ ${precio.toFixed(2)}`,
      timer: 1500,
      showConfirmButton: false
    });
  }
}