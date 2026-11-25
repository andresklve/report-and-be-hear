import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificacionDTO } from '../models/NotificacionDTO';
import { Authservice } from './authservice';

// Notificaciones del usuario con sesion. Se consultan al iniciar sesion y cada 30 s
// (solo en el navegador, no en el renderizado del servidor).
@Injectable({
  providedIn: 'root',
})
export class Notificacionservice {
  private apiURL = `${environment.base}/apis/notificaciones`;
  private http = inject(HttpClient)
  private auth = inject(Authservice)
  private browser = isPlatformBrowser(inject(PLATFORM_ID))
  private timer: ReturnType<typeof setInterval> | null = null

  readonly lista = signal<NotificacionDTO[]>([])
  readonly noLeidas = computed(() => this.lista().filter(n => !n.leida).length)

  constructor() {
    effect(() => {
      const id = this.auth.sesion()?.idUsuario
      if (this.timer) { clearInterval(this.timer); this.timer = null }
      this.lista.set([])
      if (!id || !this.browser) return
      this.refrescar()
      this.timer = setInterval(() => this.refrescar(), 30000)
    })
  }

  listPorUsuario(idUsuario: number): Observable<NotificacionDTO[]> {
    return this.http.get<NotificacionDTO[]>(`${this.apiURL}/usuario/${idUsuario}`);
  }

  refrescar() {
    const id = this.auth.sesion()?.idUsuario
    if (!id) return
    this.listPorUsuario(id).subscribe({ next: l => this.lista.set(l), error: () => {} })
  }

  marcarLeida(n: NotificacionDTO) {
    if (n.leida) return
    this.lista.update(l => l.map(x => x.idNotificacion === n.idNotificacion ? { ...x, leida: true } : x))
    this.http.put(`${this.apiURL}/${n.idNotificacion}/leida`, {}).subscribe({ error: () => {} })
  }

  marcarTodas() {
    const id = this.auth.sesion()?.idUsuario
    if (!id || !this.noLeidas()) return
    this.lista.update(l => l.map(x => ({ ...x, leida: true })))
    this.http.put(`${this.apiURL}/usuario/${id}/leidas`, {}).subscribe({ error: () => {} })
  }
}
