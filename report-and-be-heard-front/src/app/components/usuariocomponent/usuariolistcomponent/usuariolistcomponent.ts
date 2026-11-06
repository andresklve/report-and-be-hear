import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { RolDTO } from '../../../models/RolDTO';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Rolservice } from '../../../services/rolservice';
import { Authservice } from '../../../services/authservice';
import { Toastservice } from '../../../services/toastservice';

@Component({
  selector: 'app-usuariolistcomponent',
  imports: [RouterLink, DatePipe, SlicePipe],
  templateUrl: './usuariolistcomponent.html',
})
export class Usuariolistcomponent implements OnInit {
  private uS = inject(Usuarioservice)
  private rS = inject(Rolservice)
  private toast = inject(Toastservice)
  auth = inject(Authservice)

  usuarios = signal<UsuarioDTO[]>([])
  roles = signal<RolDTO[]>([])
  cargando = signal(true)
  texto = signal('')
  rolFiltro = signal<number | null>(null)
  confirmando = signal<number | null>(null)

  rolNombre = computed(() => new Map(this.roles().map(r => [r.idRol, r.nombreRol])))
  conteoRol = computed(() => {
    const m = new Map<number, number>()
    this.usuarios().forEach(u => m.set(u.idRol, (m.get(u.idRol) ?? 0) + 1))
    return m
  })
  filtrados = computed(() => {
    const q = this.texto().trim().toLowerCase()
    return this.usuarios().filter(u =>
      (this.rolFiltro() == null || u.idRol === this.rolFiltro()) &&
      (!q || `${u.nombres} ${u.apellidos} ${u.correo}`.toLowerCase().includes(q)))
  })

  ngOnInit(): void {
    forkJoin({ u: this.uS.list(), r: this.rS.list() }).subscribe({
      next: ({ u, r }) => { this.usuarios.set(u); this.roles.set(r); this.cargando.set(false) },
      error: () => { this.cargando.set(false); this.toast.error('No se pudo cargar usuarios') },
    })
  }

  iniciales(u: UsuarioDTO) {
    return `${u.nombres[0] ?? ''}${u.apellidos[0] ?? ''}`.toUpperCase()
  }

  tonoRol(id: number) {
    const n = this.rolNombre().get(id)
    return n === 'ADMINISTRADOR' ? 'pill-bad' : n === 'MUNICIPALIDAD' ? 'pill-info' : 'pill-neutral'
  }

  eliminar(u: UsuarioDTO) {
    if (u.idUsuario === this.auth.sesion()?.idUsuario) { this.toast.info('No puedes eliminar tu propia cuenta'); return }
    if (this.confirmando() !== u.idUsuario) {
      this.confirmando.set(u.idUsuario)
      setTimeout(() => { if (this.confirmando() === u.idUsuario) this.confirmando.set(null) }, 3500)
      return
    }
    this.uS.delete(u.idUsuario).subscribe({
      next: () => { this.usuarios.update(l => l.filter(x => x.idUsuario !== u.idUsuario)); this.toast.ok('Usuario eliminado') },
      error: () => { this.confirmando.set(null); this.toast.error('No se puede eliminar: tiene reportes o moderaciones.') },
    })
  }
}
