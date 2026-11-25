import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { Authservice } from '../../services/authservice';
import { Notificacionservice } from '../../services/notificacionservice';
import { NotificacionDTO } from '../../models/NotificacionDTO';
import { Logocomponent } from '../logocomponent/logocomponent';

@Component({
  selector: 'app-menucomponent',
  imports: [MatChipsModule, MatBadgeModule, DatePipe, RouterLink, RouterLinkActive, Logocomponent, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, MatRippleModule],
  templateUrl: './menucomponent.html',
  styleUrl: './menucomponent.css',
})
export class Menucomponent {
  auth = inject(Authservice)
  notif = inject(Notificacionservice)
  private router = inject(Router)

  iconoNotif(tipo: string): string {
    return tipo === 'COMENTARIO' ? 'chat_bubble' : tipo === 'SUSPENSION' ? 'block' : 'construction'
  }

  // Marca la notificacion como leida y abre el reporte, si tiene uno
  abrir(n: NotificacionDTO) {
    this.notif.marcarLeida(n)
    if (n.idTestimonio) this.router.navigate(['/reporte', n.idTestimonio])
  }

  rolLabel(): string {
    const r = this.auth.sesion()?.rol
    return r === 'ADMINISTRADOR' ? 'Administrador' : r === 'MUNICIPALIDAD' ? 'Municipalidad' : 'Ciudadano'
  }

  salir() {
    this.auth.logout()
    this.router.navigate(['/'])
  }
}
