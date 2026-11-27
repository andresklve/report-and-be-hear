import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
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
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { RolDTO } from '../../../models/RolDTO';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Rolservice } from '../../../services/rolservice';
import { Authservice } from '../../../services/authservice';
import { Usuariocardcomponent } from '../usuariocardcomponent/usuariocardcomponent';
import { Rangofechascomponent } from '../../rangofechascomponent/rangofechascomponent';
import { enRango } from '../../../shared/ui';

// Lista de usuarios en tabla o en tarjetas, con el mismo paginador para ambas vistas
@Component({
  selector: 'app-usuariolistcomponent',
  imports: [
    RouterLink,
    DatePipe,
    TitleCasePipe,
    Usuariocardcomponent,
    Rangofechascomponent,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './usuariolistcomponent.html',
  styleUrl: './usuariolistcomponent.css',
})
export class Usuariolistcomponent implements OnInit {
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6']
  dataSource: UsuarioDTO[] = []
  listaRoles: RolDTO[] = []
  mensaje: string = ''

  // Filtros
  texto: string = ''
  rolFiltro: number | null = null
  desde: Date | null = null
  hasta: Date | null = null
  vista: string = 'tarjetas'

  // Paginacion
  pageIndex: number = 0
  pageSize: number = 8

  constructor(private uS: Usuarioservice,
    private rS: Rolservice,
    private auth: Authservice,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.listarUsuarios()
  }

  listarUsuarios(): void {
    this.uS.list().subscribe({
      next: usuarios => {
        this.rS.list().subscribe({
          next: roles => {
            this.dataSource = usuarios.sort((a, b) => b.idUsuario - a.idUsuario)
            this.listaRoles = roles
            this.cdr.detectChanges()
          }, error: err => {
            console.log(err)
            this.cdr.detectChanges()
          }
        })
      }, error: err => {
        console.log('Ocurrió un error al obtener los registros', err)
        this.mensaje = 'No se pudo conectar con el servidor.'
        this.cdr.detectChanges()
      }
    })
  }

  eliminarUsuario(u: UsuarioDTO): void {
    if (u.idUsuario === this.auth.sesion()?.idUsuario) {
      this.mensaje = 'No puedes eliminar tu propia cuenta.'
      return
    }
    this.uS.delete(u.idUsuario).subscribe({
      next: () => {
        this.mensaje = ''
        this.listarUsuarios()
        this.cdr.detectChanges()
      }, error: err => {
        console.log('Ocurrió un error al eliminar el registro', err)
        this.mensaje = 'No se puede eliminar: el usuario tiene reportes o moderaciones.'
        this.cdr.detectChanges()
      }
    })
  }

  // Usuarios que cumplen los filtros
  get filtrados(): UsuarioDTO[] {
    const q = this.texto.trim().toLowerCase()
    return this.dataSource.filter(u =>
      (this.rolFiltro == null || u.idRol === this.rolFiltro) &&
      enRango(u.fechaRegistro, this.desde, this.hasta) &&
      (!q || `${u.nombres} ${u.apellidos} ${u.username}`.toLowerCase().includes(q)))
  }

  // Usuarios de la pagina actual
  get pagina(): UsuarioDTO[] {
    const ini = this.pageIndex * this.pageSize
    return this.filtrados.slice(ini, ini + this.pageSize)
  }

  // Al cambiar un filtro se vuelve a la primera pagina
  filtrar(event: Event): void {
    this.texto = (event.target as HTMLInputElement).value
    this.pageIndex = 0
  }
  filtrarRol(id: number | null): void {
    this.rolFiltro = id
    this.pageIndex = 0
  }
  cambiarDesde(f: Date | null): void {
    this.desde = f
    this.pageIndex = 0
  }
  cambiarHasta(f: Date | null): void {
    this.hasta = f
    this.pageIndex = 0
  }

  cambiarPagina(e: PageEvent): void {
    this.pageIndex = e.pageIndex
    this.pageSize = e.pageSize
  }

  nombreRol(id: number): string {
    return this.listaRoles.find(r => r.idRol === id)?.nombreRol ?? ''
  }

  contarRol(id: number): number {
    return this.dataSource.filter(u => u.idRol === id).length
  }

  iniciales(u: UsuarioDTO): string {
    return `${u.nombres[0] ?? ''}${u.apellidos[0] ?? ''}`.toUpperCase()
  }

  tonoRol(id: number): string {
    const n = this.nombreRol(id)
    return n === 'ADMINISTRADOR' ? 'pill pill-error' : n === 'MUNICIPALIDAD' ? 'pill pill-info' : 'pill'
  }
}
