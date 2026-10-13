import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  banks = ['BCP', 'Interbank', 'BBVA', 'Scotiabank', 'Mibanco', 'Caja Huancayo', 'Caja Piura', 'Yape', 'Plin', 'BIM', 'Tunki'];

  features = [
    { icon: 'bi-send-fill', title: 'Transferir', desc: 'Envía dinero al instante', color: '#7c3aed' },
    { icon: 'bi-arrow-left-right', title: 'Entre tus cuentas', desc: 'Mueve dinero entre tus bancos', color: '#2563eb' },
    { icon: 'bi-cash-stack', title: 'Préstamos', desc: 'Solicita según tu banco', color: '#059669' },
    { icon: 'bi-receipt', title: 'Pagar servicios', desc: 'Luz, agua, internet y celular', color: '#d97706' },
    { icon: 'bi-bank2', title: 'Vincular bancos', desc: 'Todos tus bancos en uno', color: '#db2777' },
    { icon: 'bi-graph-up-arrow', title: 'Reportes', desc: 'Movimientos en tiempo real', color: '#0891b2' },
  ];
}