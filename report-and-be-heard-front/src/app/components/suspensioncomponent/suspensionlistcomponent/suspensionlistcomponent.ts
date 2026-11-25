import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Suspensionservice } from '../../../services/suspensionservice';
import { Toastservice } from '../../../services/toastservice';
import { MOTIVOS_SUSPENSION, SuspensionDTO } from '../../../models/SuspensionDTO';

// Cuentas suspendidas por comentarios ofensivos o reportes falsos. Se pueden levantar.
@Component({
  selector: 'app-suspensionlistcomponent',
  imports: [DatePipe, MatTableModule, MatCardModule, MatButtonModule, MatButtonToggleModule, MatIconModule, MatChipsModule, MatTooltipModule, MatProgressBarModule],
  templateUrl: './suspensionlistcomponent.html',
  styleUrl: './suspensionlistcomponent.css',
})
export class Suspensionlistcomponent implements OnInit {
  private sS = inject(Suspensionservice)
  private toast = inject(Toastservice)

  suspensiones = signal<SuspensionDTO[]>([])
  cargando = signal(true)
  filtro = signal<'VIGENTES' | 'TODAS'>('VIGENTES')
  confirmando = signal<number | null>(null)
  columnas = ['usuario', 'motivo', 'desde', 'hasta', 'estado', 'acciones']

  vigentes = computed(() => this.suspensiones().filter(s => s.vigente).length)
  filtradas = computed(() => this.filtro() === 'VIGENTES' ? this.suspensiones().filter(s => s.vigente) : this.suspensiones())

  ngOnInit(): void {
    this.sS.list().subscribe({
      next: l => { this.suspensiones.set(l); this.cargando.set(false) },
      error: () => { this.cargando.set(false); this.toast.error('No se pudo cargar las suspensiones') },
    })
  }

  motivoLabel(m: string) {
    return MOTIVOS_SUSPENSION.find(x => x.key === m)?.label ?? m
  }

  estado(s: SuspensionDTO): { label: string; clase: string } {
    if (s.vigente) return { label: 'Vigente', clase: 'pill pill-error' }
    if (!s.activa) return { label: 'Levantada', clase: 'pill' }
    return { label: 'Vencida', clase: 'pill' }
  }

  levantar(s: SuspensionDTO) {
    if (this.confirmando() !== s.idSuspension) {
      this.confirmando.set(s.idSuspension)
      setTimeout(() => { if (this.confirmando() === s.idSuspension) this.confirmando.set(null) }, 3500)
      return
    }
    this.sS.levantar(s.idSuspension).subscribe({
      next: r => {
        this.suspensiones.update(l => l.map(x => x.idSuspension === r.idSuspension ? r : x))
        this.confirmando.set(null)
        this.toast.ok(`Se levantó la suspensión de ${r.nombreUsuario}`)
      },
      error: () => { this.confirmando.set(null); this.toast.error('No se pudo levantar la suspensión') },
    })
  }
}
