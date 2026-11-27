import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ModeracionDTO } from '../../../models/ModeracionDTO';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { TestimonioDTO } from '../../../models/TestimonioDTO';
import { Moderacionservice } from '../../../services/moderacionservice';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Testimonioservice } from '../../../services/testimonioservice';
import { Estadochipcomponent } from '../../estadochipcomponent/estadochipcomponent';
import { Rangofechascomponent } from '../../rangofechascomponent/rangofechascomponent';
import { ESTADOS, enRango, referencia, soles } from '../../../shared/ui';

@Component({
  selector: 'app-moderacionlistcomponent',
  imports: [
    RouterLink,
    DatePipe,
    Estadochipcomponent,
    Rangofechascomponent,
    MatTableModule,
    MatPaginatorModule,
    MatButtonToggleModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './moderacionlistcomponent.html',
  styleUrl: './moderacionlistcomponent.css',
})
export class Moderacionlistcomponent implements OnInit {
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']
  dataSource: MatTableDataSource<ModeracionDTO> = new MatTableDataSource()
  listaModeraciones: ModeracionDTO[] = []
  listaUsuarios: UsuarioDTO[] = []
  listaTestimonios: TestimonioDTO[] = []
  mensaje: string = ''
  estados = ESTADOS
  referencia = referencia
  soles = soles

  // Filtros
  desde: Date | null = null
  hasta: Date | null = null
  accionFiltro: string = 'TODAS'

  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor(private mS: Moderacionservice,
    private uS: Usuarioservice,
    private tS: Testimonioservice,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.listarModeraciones()
    this.uS.list().subscribe({ next: data => { this.listaUsuarios = data; this.cdr.detectChanges() } })
    this.tS.list().subscribe({ next: data => { this.listaTestimonios = data; this.cdr.detectChanges() } })
  }

  listarModeraciones(): void {
    this.mS.list().subscribe({
      next: data => {
        this.listaModeraciones = data.sort((a, b) => (b.fechaAccion ?? '').localeCompare(a.fechaAccion ?? ''))
        this.dataSource = new MatTableDataSource(this.listaModeraciones)
        this.dataSource.paginator = this.paginator
        this.aplicarFiltros()
        this.cdr.detectChanges()
      }, error: err => {
        console.log('Ocurrió un error al obtener los registros', err)
        this.mensaje = 'No se pudo conectar con el servidor.'
        this.cdr.detectChanges()
      }
    })
  }

  eliminarModeracion(id: number): void {
    this.mS.delete(id).subscribe({
      next: () => {
        this.mensaje = ''
        this.listarModeraciones()
        this.cdr.detectChanges()
      }, error: err => {
        console.log('Ocurrió un error al eliminar el registro', err)
        this.mensaje = 'No se pudo eliminar la moderación.'
        this.cdr.detectChanges()
      }
    })
  }

  // Filtros por accion y por rango de fechas
  filtrarAccion(accion: string): void {
    this.accionFiltro = accion
    this.aplicarFiltros()
  }
  cambiarDesde(f: Date | null): void {
    this.desde = f
    this.aplicarFiltros()
  }
  cambiarHasta(f: Date | null): void {
    this.hasta = f
    this.aplicarFiltros()
  }
  aplicarFiltros(): void {
    this.dataSource.data = this.listaModeraciones.filter(m =>
      enRango(m.fechaAccion, this.desde, this.hasta) &&
      (this.accionFiltro === 'TODAS' || m.accion === this.accionFiltro))
    this.dataSource.paginator?.firstPage()
  }

  sumarCostos(lista: ModeracionDTO[]): string {
    return soles(lista.reduce((s, m) => s + Number(m.costo ?? 0), 0))
  }

  descripcion(idTestimonio: number): string {
    return this.listaTestimonios.find(t => t.idTestimonio === idTestimonio)?.descripcionTexto ?? ''
  }

  nombreUsuario(idUsuario: number): string {
    return this.listaUsuarios.find(u => u.idUsuario === idUsuario)?.nombres ?? '—'
  }
}
