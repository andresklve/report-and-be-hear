import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ModeracionDTO } from '../../../models/ModeracionDTO';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { TestimonioDTO } from '../../../models/TestimonioDTO';
import { Moderacionservice } from '../../../services/moderacionservice';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Testimonioservice } from '../../../services/testimonioservice';
import { Toastservice } from '../../../services/toastservice';
import { estadoInfo, referencia, soles } from '../../../shared/ui';

@Component({
  selector: 'app-moderacionlistcomponent',
  imports: [RouterLink, DatePipe],
  templateUrl: './moderacionlistcomponent.html',
})
export class Moderacionlistcomponent implements OnInit {
  private mS = inject(Moderacionservice)
  private uS = inject(Usuarioservice)
  private tS = inject(Testimonioservice)
  private toast = inject(Toastservice)

  moderaciones = signal<ModeracionDTO[]>([])
  usuarios = signal<Map<number, UsuarioDTO>>(new Map())
  testimonios = signal<Map<number, TestimonioDTO>>(new Map())
  cargando = signal(true)
  confirmando = signal<number | null>(null)
  estadoInfo = estadoInfo
  referencia = referencia
  soles = soles

  total = computed(() => soles(this.moderaciones().reduce((s, m) => s + Number(m.costo ?? 0), 0)))

  ngOnInit(): void {
    forkJoin({ m: this.mS.list(), u: this.uS.list(), t: this.tS.list() }).subscribe({
      next: ({ m, u, t }) => {
        this.moderaciones.set([...m].sort((a, b) => (b.fechaAccion ?? '').localeCompare(a.fechaAccion ?? '')))
        this.usuarios.set(new Map(u.map(x => [x.idUsuario, x])))
        this.testimonios.set(new Map(t.map(x => [x.idTestimonio, x])))
        this.cargando.set(false)
      },
      error: () => { this.cargando.set(false); this.toast.error('No se pudo cargar moderaciones') },
    })
  }

  eliminar(id: number) {
    if (this.confirmando() !== id) {
      this.confirmando.set(id)
      setTimeout(() => { if (this.confirmando() === id) this.confirmando.set(null) }, 3500)
      return
    }
    this.mS.delete(id).subscribe({
      next: () => { this.moderaciones.update(l => l.filter(x => x.idModeracion !== id)); this.toast.ok('Moderación eliminada') },
      error: () => this.toast.error('No se pudo eliminar'),
    })
  }
}
