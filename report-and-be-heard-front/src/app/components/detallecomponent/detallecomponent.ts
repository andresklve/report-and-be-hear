import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Datos, Datosservice } from '../../services/datosservice';
import { Moderacionservice } from '../../services/moderacionservice';
import { ModeracionDTO } from '../../models/ModeracionDTO';
import { Authservice } from '../../services/authservice';
import { Estadotrackcomponent } from '../estadotrackcomponent/estadotrackcomponent';
import { Mapapickercomponent } from '../mapapickercomponent/mapapickercomponent';
import { estadoInfo, iconoCategoria, referencia, soles } from '../../shared/ui';

@Component({
  selector: 'app-detallecomponent',
  imports: [RouterLink, DatePipe, Estadotrackcomponent, Mapapickercomponent],
  templateUrl: './detallecomponent.html',
})
export class Detallecomponent implements OnInit {
  private route = inject(ActivatedRoute)
  private dS = inject(Datosservice)
  private mS = inject(Moderacionservice)
  auth = inject(Authservice)

  datos = signal<Datos | null>(null)
  moderaciones = signal<ModeracionDTO[]>([])
  noExiste = signal(false)
  id = signal(0)
  estadoInfo = estadoInfo
  soles = soles

  t = computed(() => this.datos()?.testimonios.find(x => x.idTestimonio === this.id()) ?? null)
  categoria = computed(() => this.datos()?.cat.get(this.t()?.idCategoria ?? -1) ?? null)
  zona = computed(() => this.datos()?.zona.get(this.t()?.idZona ?? -1) ?? null)
  icono = computed(() => iconoCategoria(this.categoria()?.nombreCategoria))
  ref = computed(() => referencia(this.id()))
  esMio = computed(() => this.auth.sesion()?.idUsuario === this.t()?.idUsuario)

  historial = computed(() =>
    this.moderaciones().filter(m => m.idTestimonio === this.id())
      .sort((a, b) => (a.fechaAccion ?? '').localeCompare(b.fechaAccion ?? '')))

  ngOnInit(): void {
    this.route.paramMap.subscribe(p => {
      this.id.set(Number(p.get('id')))
      forkJoin({ d: this.dS.cargar(), m: this.mS.list() }).subscribe({
        next: ({ d, m }) => {
          this.datos.set(d)
          this.moderaciones.set(m)
          this.noExiste.set(!d.testimonios.some(x => x.idTestimonio === this.id()))
        },
        error: () => this.noExiste.set(true),
      })
    })
  }
}
