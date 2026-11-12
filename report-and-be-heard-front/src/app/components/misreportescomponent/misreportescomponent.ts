import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { Datos, Datosservice } from '../../services/datosservice';
import { Moderacionservice } from '../../services/moderacionservice';
import { ModeracionDTO } from '../../models/ModeracionDTO';
import { Authservice } from '../../services/authservice';
import { Estadotrackcomponent } from '../estadotrackcomponent/estadotrackcomponent';
import { Estadochipcomponent } from '../estadochipcomponent/estadochipcomponent';
import { colorCategoria, iconoCategoria, referencia } from '../../shared/ui';

@Component({
  selector: 'app-misreportescomponent',
  imports: [RouterLink, Estadotrackcomponent, Estadochipcomponent, MatCardModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatProgressBarModule, MatRippleModule],
  templateUrl: './misreportescomponent.html',
  styleUrl: './misreportescomponent.css',
})
export class Misreportescomponent implements OnInit {
  private dS = inject(Datosservice)
  private mS = inject(Moderacionservice)
  auth = inject(Authservice)

  datos = signal<Datos | null>(null)
  moderaciones = signal<ModeracionDTO[]>([])
  error = signal(false)
  iconoCategoria = iconoCategoria
  colorCategoria = colorCategoria
  pageIndex = signal(0)
  pageSize = signal(5)
  referencia = referencia

  mios = computed(() => {
    const d = this.datos(), id = this.auth.sesion()?.idUsuario
    if (!d) return []
    return d.testimonios.filter(t => t.idUsuario === id).map(t => {
      const ultima = this.moderaciones().filter(m => m.idTestimonio === t.idTestimonio)
        .sort((a, b) => (b.fechaAccion ?? '').localeCompare(a.fechaAccion ?? ''))[0]
      return { t, ultima, categoria: d.cat.get(t.idCategoria)?.nombreCategoria ?? '', zona: d.zona.get(t.idZona)?.nombreZona ?? '' }
    })
  })

  pagina = computed(() => {
    const ini = this.pageIndex() * this.pageSize()
    return this.mios().slice(ini, ini + this.pageSize())
  })

  cambiarPagina(e: PageEvent) {
    this.pageIndex.set(e.pageIndex)
    this.pageSize.set(e.pageSize)
  }

  resumen = computed(() => {
    const l = this.mios()
    return {
      total: l.length,
      abiertos: l.filter(x => ['PENDIENTE', 'EN_PROCESO'].includes(x.t.estado)).length,
      resueltos: l.filter(x => x.t.estado === 'RESUELTO').length,
    }
  })

  ngOnInit(): void {
    forkJoin({ d: this.dS.cargar(), m: this.mS.list() }).subscribe({
      next: ({ d, m }) => { this.datos.set(d); this.moderaciones.set(m) },
      error: () => this.error.set(true),
    })
  }
}
