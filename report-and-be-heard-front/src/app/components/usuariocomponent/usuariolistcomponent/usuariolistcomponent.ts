import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { RolDTO } from '../../../models/RolDTO';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Rolservice } from '../../../services/rolservice';
import { Authservice } from '../../../services/authservice';
import { Toastservice } from '../../../services/toastservice';
import { Usuariocardcomponent } from '../usuariocardcomponent/usuariocardcomponent';
import { Rangofechascomponent } from '../../rangofechascomponent/rangofechascomponent';
import { enRango } from '../../../shared/ui';

// Lista de usuarios en tabla o en tarjetas, con el mismo paginador para ambas vistas
@Component({
  selector: 'app-usuariolistcomponent',
  imports: [RouterLink, DatePipe, TitleCasePipe, Usuariocardcomponent, Rangofechascomponent, MatTableModule, MatPaginatorModule, MatCardModule, MatButtonModule,
    MatButtonToggleModule, MatIconModule, MatFormFieldModule, MatInputModule, MatChipsModule, MatTooltipModule, MatProgressBarModule],
  templateUrl: './usuariolistcomponent.html',
  styleUrl: './usuariolistcomponent.css',
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
  vista = signal<'tabla' | 'tarjetas'>('tarjetas')
  desde = signal<Date | null>(null)
  hasta = signal<Date | null>(null)
  columnas = ['persona', 'rol', 'registro', 'estado', 'acciones']

  // Paginacion
  pageIndex = signal(0)
  pageSize = signal(8)

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
      enRango(u.fechaRegistro, this.desde(), this.hasta()) &&
      (!q || `${u.nombres} ${u.apellidos} ${u.correo}`.toLowerCase().includes(q)))
  })
  pagina = computed(() => {
    const ini = this.pageIndex() * this.pageSize()
    return this.filtrados().slice(ini, ini + this.pageSize())
  })

  constructor() {
    // Al cambiar el filtro se vuelve a la primera pagina
    effect(() => { this.texto(); this.rolFiltro(); this.desde(); this.hasta(); this.pageIndex.set(0) })
  }

  ngOnInit(): void {
    forkJoin({ u: this.uS.list(), r: this.rS.list() }).subscribe({
      next: ({ u, r }) => { this.usuarios.set([...u].sort((a, b) => b.idUsuario - a.idUsuario)); this.roles.set(r); this.cargando.set(false) },
      error: () => { this.cargando.set(false); this.toast.error('No se pudo cargar usuarios') },
    })
  }

  cambiarPagina(e: PageEvent) {
    this.pageIndex.set(e.pageIndex)
    this.pageSize.set(e.pageSize)
  }

  iniciales(u: UsuarioDTO) {
    return `${u.nombres[0] ?? ''}${u.apellidos[0] ?? ''}`.toUpperCase()
  }

  tonoRol(id: number) {
    const n = this.rolNombre().get(id)
    return n === 'ADMINISTRADOR' ? 'pill pill-error' : n === 'MUNICIPALIDAD' ? 'pill pill-info' : 'pill'
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
