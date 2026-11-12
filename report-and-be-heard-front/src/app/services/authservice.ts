import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { LoginRequestDTO, LoginResponseDTO, RolNombre, SesionDTO } from '../models/SesionDTO';
import { UsuarioDTO } from '../models/UsuarioDTO';
import { Usuarioservice } from './usuarioservice';
import { Rolservice } from './rolservice';

const CLAVE = 'rbh.sesion';

@Injectable({
  providedIn: 'root',
})
export class Authservice {
  private http = inject(HttpClient);
  private uS = inject(Usuarioservice);
  private rS = inject(Rolservice);
  private browser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly sesion = signal<SesionDTO | null>(this.leer());
  readonly esEquipo = computed(() => ['ADMINISTRADOR', 'MUNICIPALIDAD'].includes(this.sesion()?.rol ?? ''));
  readonly esAdmin = computed(() => this.sesion()?.rol === 'ADMINISTRADOR');
  readonly iniciales = computed(() => {
    const s = this.sesion();
    return s ? `${s.nombres[0] ?? ''}${s.apellidos[0] ?? ''}`.toUpperCase() : '';
  });

  // POST /login -> token; luego se completa la sesion con el usuario y su rol
  login(correo: string, password: string): Observable<SesionDTO> {
    const body: LoginRequestDTO = { username: correo.trim().toLowerCase(), password };
    return this.http.post<LoginResponseDTO>(`${environment.base}/login`, body).pipe(
      switchMap(res => forkJoin({ usuarios: this.uS.list(), roles: this.rS.list() }).pipe(
        map(({ usuarios, roles }) => {
          const u = usuarios.find(x => x.correo.toLowerCase() === res.username.toLowerCase())
          if (!u) throw new Error('Usuario no encontrado')
          const rol = (roles.find(r => r.idRol === u.idRol)?.nombreRol ?? 'CIUDADANO') as RolNombre
          const s: SesionDTO = {
            token: res.token, idUsuario: u.idUsuario, nombres: u.nombres,
            apellidos: u.apellidos, correo: u.correo, rol
          }
          this.guardar(s)
          return s
        })
      ))
    )
  }

  // Registro publico: el backend siempre crea al usuario como CIUDADANO
  registrar(nombres: string, apellidos: string, correo: string, password: string): Observable<SesionDTO> {
    const u: UsuarioDTO = {
      idUsuario: 0, idRol: 0, nombres: nombres.trim(), apellidos: apellidos.trim(),
      correo: correo.trim().toLowerCase(), passwordHash: password, fechaRegistro: null, activo: true
    }
    return this.uS.insert(u).pipe(
      switchMap(() => this.login(u.correo, password))
    )
  }

  logout() {
    this.sesion.set(null)
    if (this.browser) {
      try { localStorage.removeItem(CLAVE) } catch { }
    }
  }

  token(): string | null {
    return this.sesion()?.token ?? null
  }

  private guardar(s: SesionDTO) {
    this.sesion.set(s)
    if (this.browser) {
      try { localStorage.setItem(CLAVE, JSON.stringify(s)) } catch { }
    }
  }

  private leer(): SesionDTO | null {
    if (!this.browser) return null
    try {
      const raw = localStorage.getItem(CLAVE)
      return raw ? JSON.parse(raw) as SesionDTO : null
    } catch {
      return null
    }
  }

  static mensajeError(err: any): string {
    if (err?.status === 0) return 'No pudimos conectar con el servidor. Intenta de nuevo en un momento.'
    if (/suspendida/i.test(err?.error?.message ?? '')) return err.error.message
    if (err?.status === 401 || err?.status === 403) return 'Correo o contraseña incorrectos.'
    const msg: string = err?.error?.message ?? ''
    if (/correo|unique|duplicad|llave duplicada/i.test(msg)) return 'Ese correo ya está registrado. Prueba iniciando sesión.'
    return msg || 'Algo salió mal. Intenta otra vez.'
  }
}
