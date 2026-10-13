import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../services/productos';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-mis-entidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-entidades.html',
  styleUrl: './mis-entidades.css'
})
export class MisEntidades implements OnInit {
  entidades: any[] = [];
  mostrarForm = false;
  nuevoCodigo = 'BCP';
  nuevoNumero = '';
  nuevoSaldo: number = 1000;
  guardando = false;

  bancosDisponibles = [
    { codigo: 'BCP', nombre: 'Banco de Crédito', color: '#FF6B00' },
    { codigo: 'INTERBANK', nombre: 'Interbank', color: '#00A650' },
    { codigo: 'BBVA', nombre: 'BBVA', color: '#004481' },
    { codigo: 'SCOTIABANK', nombre: 'Scotiabank', color: '#EC111A' },
    { codigo: 'YAPE', nombre: 'Yape', color: '#6D28D9' },
    { codigo: 'PLIN', nombre: 'Plin', color: '#00C4B4' },
  ];

  constructor(private service: ProductosService, private auth: AuthService) {}

  ngOnInit(): void {
    this.cargar();
    this.generarNumero();
  }

  cargar(): void {
    const user = this.auth.getUser();
    if (!user) return;
    this.service.getEntidades().subscribe({
      next: (data: any[]) => {
        this.entidades = data.filter((e: any) => e.userId === user.id);
      },
      error: (err) => console.error('Error al cargar entidades:', err)
    });
  }

  generarNumero(): void {
    // Genera un número de 10 dígitos aleatorio
    const numero = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    this.nuevoNumero = numero;
  }

  cambiarBanco(codigo: string): void {
    this.nuevoCodigo = codigo;
    // Regeneramos el número al cambiar de banco
    this.generarNumero();
  }

  vincular(): void {
    if (!this.nuevoSaldo || this.nuevoSaldo <= 0) {
      alert('Ingresa un saldo válido mayor a 0.');
      return;
    }

    const user = this.auth.getUser();
    if (!user) {
      alert('Debes iniciar sesión.');
      return;
    }

    const banco = this.bancosDisponibles.find(b => b.codigo === this.nuevoCodigo);

    const entidad = {
      userId: user.id,
      codigo: banco?.codigo,
      nombre: banco?.nombre,
      numero: this.nuevoNumero,
      saldo: Number(this.nuevoSaldo),
      principal: this.entidades.length === 0,
      color: banco?.color
    };

    this.guardando = true;

    this.service.crearEntidad(entidad).subscribe({
      next: () => {
        this.cargar();
        this.mostrarForm = false;
        this.nuevoSaldo = 1000;
        this.generarNumero();
        this.guardando = false;
        alert(`✅ Entidad ${banco?.codigo} vinculada con el número ${this.nuevoNumero}`);
      },
      error: (err) => {
        console.error('Error al vincular:', err);
        alert('❌ Error al vincular. Verifica que JSON Server esté corriendo.');
        this.guardando = false;
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Desvincular esta entidad?')) return;
    this.service.eliminarEntidad(id).subscribe({
      next: () => this.cargar(),
      error: (err) => console.error('Error al eliminar:', err)
    });
  }

  getSaldoTotal(): number {
    return this.entidades.reduce((sum, e) => sum + Number(e.saldo), 0);
  }
}