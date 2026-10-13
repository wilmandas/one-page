import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../services/productos';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  categorias: string[] = [];
  busqueda = '';
  categoriaSeleccionada = 'Todas';
  cargando = true;

  constructor(private service: ProductosService) {}

  ngOnInit(): void {
    this.service.getProductos().subscribe({
      next: (data: any[]) => {
        this.productos = data;
        this.productosFiltrados = data;
        this.categorias = ['Todas', ...new Set(data.map((p: any) => p.categoria))];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.cargando = false;
      }
    });
  }

  filtrar(): void {
    this.productosFiltrados = this.productos.filter((p: any) => {
      const coincideBusqueda = p.nombre.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideCategoria = this.categoriaSeleccionada === 'Todas' || p.categoria === this.categoriaSeleccionada;
      return coincideBusqueda && coincideCategoria;
    });
  }

  seleccionarCategoria(cat: string): void {
    this.categoriaSeleccionada = cat;
    this.filtrar();
  }

  agregarAlCarrito(producto: any): void {
    const carrito = JSON.parse(localStorage.getItem('onepage_carrito') || '[]');
    const existe = carrito.find((c: any) => c.id === producto.id);
    if (existe) {
      existe.cantidad++;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }
    localStorage.setItem('onepage_carrito', JSON.stringify(carrito));
    alert(`✅ ${producto.nombre} agregado al carrito`);
  }
}