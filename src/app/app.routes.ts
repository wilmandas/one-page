import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { Productos } from './pages/productos/productos';
import { Ofertas } from './pages/ofertas/ofertas';
import { Tienda } from './pages/tienda/tienda';
import { ContactoPageComponent } from './pages/contacto/contacto';
import { MiCuenta } from './pages/mi-cuenta/mi-cuenta';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { NotFound } from './pages/not-found/not-found';
import { Admin } from './pages/admin/admin';
import { EnviarDinero } from './pages/enviar-dinero/enviar-dinero';
import { PagarServicio } from './pages/pagar-servicio/pagar-servicio';
import { MisEntidades } from './pages/mis-entidades/mis-entidades';
import { Historial } from './pages/historial/historial';
import { Contactos } from './pages/contactos/contactos';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'productos', component: Productos },
  { path: 'ofertas', component: Ofertas },
  { path: 'tienda', component: Tienda },
  { path: 'contacto', component: ContactoPageComponent },
  { path: 'login', component: Login },
  { path: 'mi-cuenta', component: MiCuenta, canActivate: [AuthGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'enviar-dinero', component: EnviarDinero, canActivate: [AuthGuard] },
  { path: 'pagar-servicio', component: PagarServicio, canActivate: [AuthGuard] },
  { path: 'mis-entidades', component: MisEntidades, canActivate: [AuthGuard] },
  { path: 'historial', component: Historial, canActivate: [AuthGuard] },
  { path: 'contactos', component: Contactos, canActivate: [AuthGuard] },
  { path: 'admin', component: Admin, canActivate: [AuthGuard, AdminGuard] },
  { path: '**', component: NotFound },
];