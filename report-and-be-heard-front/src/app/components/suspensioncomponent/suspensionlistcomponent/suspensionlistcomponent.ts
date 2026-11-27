import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Suspensionservice } from '../../../services/suspensionservice';
import { MOTIVOS_SUSPENSION, SuspensionDTO } from '../../../models/SuspensionDTO';

// Cuentas suspendidas por comentarios ofensivos o reportes falsos. Se pueden levantar.
@Component({
  selector: 'app-suspensionlistcomponent',
  imports: [
    DatePipe,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './suspensionlistcomponent.html',
  styleUrl: './suspensionlistcomponent.css',
})
export class Suspensionlistcomponent implements OnInit {
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6']
  listaSuspensiones: SuspensionDTO[] = []
  dataSource: SuspensionDTO[] = []
  filtro: string = 'VIGENTES'
  mensaje: string = ''

  constructor(private sS: Suspensionservice,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.listarSuspensiones()
  }

  listarSuspensiones(): void {
    this.sS.list().subscribe({
      next: data => {
        this.listaSuspensiones = data
        this.filtrar(this.filtro)
        this.cdr.detectChanges()
      }, error: err => {
        console.log('Ocurrió un error al obtener los registros', err)
        this.mensaje = 'No se pudo conectar con el servidor.'
        this.cdr.detectChanges()
      }
    })
  }

  levantarSuspension(s: SuspensionDTO): void {
    this.sS.levantar(s.idSuspension).subscribe({
      next: r => {
        this.mensaje = `Se levantó la suspensión de ${r.nombreUsuario}.`
        this.listarSuspensiones()
        this.cdr.detectChanges()
      }, error: err => {
        console.log(err)
        this.mensaje = 'No se pudo levantar la suspensión.'
        this.cdr.detectChanges()
      }
    })
  }

  filtrar(filtro: string): void {
    this.filtro = filtro
    this.dataSource = filtro === 'VIGENTES' ? this.listaSuspensiones.filter(s => s.vigente) : this.listaSuspensiones
  }

  contarVigentes(): number {
    return this.listaSuspensiones.filter(s => s.vigente).length
  }

  motivoLabel(m: string): string {
    return MOTIVOS_SUSPENSION.find(x => x.key === m)?.label ?? m
  }

  estadoLabel(s: SuspensionDTO): string {
    return s.vigente ? 'Vigente' : !s.activa ? 'Levantada' : 'Vencida'
  }
}
