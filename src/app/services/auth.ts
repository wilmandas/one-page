import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuditoriaService } from './auditoria';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private KEY = 'onepage_user';

  constructor(public router: Router, private auditoria: AuditoriaService) {}

  login(email: string, password: string): { success: boolean; message: string } {
    const users = JSON.parse(localStorage.getItem('onepage_users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      return { success: false, message: 'Correo o contraseña incorrectos.' };
    }

    const session = {
      id: user.id,
      email: user.email,
      name: user.nombre,
      phone: user.phone,
      role: user.role,
      genero: user.genero || 'otro',
      loginAt: new Date().toISOString(),
    };

    localStorage.setItem(this.KEY, JSON.stringify(session));
    this.aplicarTema(session.genero);

    this.auditoria.registrar({
      userId: user.id,
      usuario: user.nombre,
      accion: 'Inicio de sesión',
      detalle: `Usuario ${user.email} inició sesión`,
      tipo: 'login'
    });

    return { success: true, message: 'Login exitoso' };
  }

  register(data: { nombre: string; email: string; password: string; phone: string; genero?: string }): { success: boolean; message: string } {
    const users = JSON.parse(localStorage.getItem('onepage_users') || '[]');

    if (users.find((u: any) => u.email === data.email)) {
      return { success: false, message: 'Este correo ya está registrado.' };
    }

    const newUser = {
      id: Date.now(),
      nombre: data.nombre,
      email: data.email,
      password: data.password,
      phone: data.phone,
      genero: data.genero || 'otro',
      role: 'user',
      activo: true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('onepage_users', JSON.stringify(users));

    this.auditoria.registrar({
      userId: newUser.id,
      usuario: newUser.nombre,
      accion: 'Registro de usuario',
      detalle: `Nuevo usuario: ${newUser.email}`,
      tipo: 'crear'
    });

    return { success: true, message: 'Registro exitoso' };
  }

  // 🎨 APLICAR TEMA SEGÚN GÉNERO
  aplicarTema(genero: string): void {
    document.body.classList.remove('theme-male', 'theme-female', 'theme-neutral');

    if (genero === 'masculino') {
      document.body.classList.add('theme-male');
    } else if (genero === 'femenino') {
      document.body.classList.add('theme-female');
    } else {
      document.body.classList.add('theme-neutral');
    }
  }

  updateProfile(data: { nombre?: string; email?: string; phone?: string; genero?: string }): { success: boolean; message: string } {
    const session = this.getUser();
    if (!session) return { success: false, message: 'No hay sesión activa.' };

    const users = JSON.parse(localStorage.getItem('onepage_users') || '[]');
    const index = users.findIndex((u: any) => u.id === session.id);

    if (index === -1) return { success: false, message: 'Usuario no encontrado.' };

    if (data.email && data.email !== users[index].email) {
      const existe = users.find((u: any) => u.email === data.email && u.id !== session.id);
      if (existe) return { success: false, message: 'Ese correo ya está en uso.' };
    }

    users[index] = { ...users[index], ...data };
    localStorage.setItem('onepage_users', JSON.stringify(users));

    const updatedSession = { ...session, ...data };
    localStorage.setItem(this.KEY, JSON.stringify(updatedSession));

    if (data.genero) {
      this.aplicarTema(data.genero);
    }

    this.auditoria.registrar({
      userId: session.id,
      usuario: session.name,
      accion: 'Actualización de perfil',
      detalle: 'Datos personales actualizados',
      tipo: 'editar'
    });

    return { success: true, message: 'Perfil actualizado' };
  }

  changePassword(currentPassword: string, newPassword: string): { success: boolean; message: string } {
    const session = this.getUser();
    if (!session) return { success: false, message: 'No hay sesión activa.' };

    if (newPassword.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const users = JSON.parse(localStorage.getItem('onepage_users') || '[]');
    const index = users.findIndex((u: any) => u.id === session.id);

    if (index === -1) return { success: false, message: 'Usuario no encontrado.' };

    if (users[index].password !== currentPassword) {
      return { success: false, message: 'La contraseña actual es incorrecta.' };
    }

    users[index].password = newPassword;
    localStorage.setItem('onepage_users', JSON.stringify(users));

    return { success: true, message: 'Contraseña actualizada' };
  }

  logout(): void {
    const session = this.getUser();
    if (session) {
      this.auditoria.registrar({
        userId: session.id,
        usuario: session.name,
        accion: 'Cierre de sesión',
        detalle: `Usuario ${session.email} cerró sesión`,
        tipo: 'logout'
      });
    }
    localStorage.removeItem(this.KEY);
    document.body.classList.remove('theme-male', 'theme-female', 'theme-neutral');
    this.router.navigate(['/']);
  }

  getUser(): any {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : null;
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user !== null && user.role === 'admin';
  }
}