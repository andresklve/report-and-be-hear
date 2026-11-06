import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Authservice } from '../../services/authservice';
import { Logocomponent } from '../logocomponent/logocomponent';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, Logocomponent],
  templateUrl: './navbarcomponent.html',
})
export class Navbarcomponent {
  auth = inject(Authservice)
  private router = inject(Router)
  menu = signal(false)
  scrolled = signal(false)

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 8)
  }

  @HostListener('document:keydown.escape')
  cerrarMenu() {
    this.menu.set(false)
  }

  rolLabel(): string {
    const r = this.auth.sesion()?.rol
    return r === 'ADMINISTRADOR' ? 'Administrador' : r === 'MUNICIPALIDAD' ? 'Municipalidad' : 'Ciudadano'
  }

  salir() {
    this.menu.set(false)
    this.auth.logout()
    this.router.navigate(['/'])
  }
}
