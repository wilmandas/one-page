import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'one-page';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    // 🎨 Aplicar tema al cargar la app
    const user = this.auth.getUser();
    if (user) {
      this.auth.aplicarTema(user.genero || 'otro');
    } else {
      document.body.classList.add('theme-neutral');
    }
  }
}