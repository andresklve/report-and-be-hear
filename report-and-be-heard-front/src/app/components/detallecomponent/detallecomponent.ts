import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { forkJoin, switchMap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Datos, Datosservice } from '../../services/datosservice';
import { Moderacionservice } from '../../services/moderacionservice';
import { ModeracionDTO } from '../../models/ModeracionDTO';
import { Authservice } from '../../services/authservice';
import { Apoyoservice } from '../../services/apoyoservice';
import { Testimonioservice } from '../../services/testimonioservice';
import { Toastservice } from '../../services/toastservice';
import { ApoyoResumenDTO } from '../../models/ApoyoDTO';
import { Comentarioscomponent } from '../comentarioscomponent/comentarioscomponent';
import { Suspendercomponent } from '../suspendercomponent/suspendercomponent';
import { Estadotrackcomponent } from '../estadotrackcomponent/estadotrackcomponent';
import { Mapapickercomponent } from '../mapapickercomponent/mapapickercomponent';
import { Estadochipcomponent } from '../estadochipcomponent/estadochipcomponent';
import { colorCategoria, colorEstado, estadoInfo, iconoCategoria, referencia, soles } from '../../shared/ui';

@Component({
  selector: 'app-detallecomponent',
  imports: [MatDividerModule, MatListModule, RouterLink, DatePipe, Estadotrackcomponent, Mapapickercomponent, Estadochipcomponent, Comentarioscomponent, Suspendercomponent,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule],
  templateUrl: './detallecomponent.html',
  styleUrl: './detallecomponent.css',
})
export class Detallecomponent implements OnInit {
  private route = inject(ActivatedRoute)
  private dS = inject(Datosservice)
  private mS = inject(Moderacionservice)
  auth = inject(Authservice)
  private location = inject(Location)
  private router = inject(Router)
  private aS = inject(Apoyoservice)
  private tS = inject(Testimonioservice)
  private toast = inject(Toastservice)

  apoyo = signal<ApoyoResumenDTO | null>(null)
  apoyando = signal(false)
  falso = signal(false)

  datos = signal<Datos | null>(null)
  moderaciones = signal<ModeracionDTO[]>([])
  noExiste = signal(false)
  id = signal(0)
  estadoInfo = estadoInfo
  colorCategoria = colorCategoria
  colorEstado = colorEstado
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

  alternarApoyo() {
    const s = this.auth.sesion()
    if (!s) { this.router.navigate(['/ingresar']); return }
    const ya = this.apoyo()?.apoyadoPorUsuario
    this.apoyando.set(true)
    const pedido = ya ? this.aS.quitar(this.id(), s.idUsuario) : this.aS.apoyar(this.id(), s.idUsuario)
    pedido.subscribe({
      next: r => { this.apoyo.set(r); this.apoyando.set(false) },
      error: err => { this.apoyando.set(false); this.toast.error(err.error?.message ?? 'No se pudo registrar el apoyo') },
    })
  }

  // Tras suspender al autor por reporte falso, el reporte queda descartado con su motivo
  descartarFalso() {
    const t = this.t()
    const s = this.auth.sesion()
    this.falso.set(false)
    if (!t || !s || t.estado === 'RECHAZADO') return
    this.mS.insert({
      idModeracion: 0, idTestimonio: t.idTestimonio, idUsuarioAdmin: s.idUsuario,
      accion: 'RECHAZADO', motivo: 'Reporte falso: se suspendió la cuenta de quien lo registró.', costo: null, fechaAccion: null,
    }).pipe(
      switchMap(() => this.tS.update(t.idTestimonio, { ...t, estado: 'RECHAZADO' }))
    ).subscribe({
      next: () => { this.toast.ok(`${this.ref()} descartado como reporte falso`); this.cargar() },
      error: () => this.toast.error('La cuenta se suspendió, pero no se pudo descartar el reporte'),
    })
  }

  // Regresa a la pagina anterior (resultados, bandeja, mis reportes...). Si se entro
  // directo por el enlace y no hay pagina anterior en la app, va al mapa.
  volver() {
    const nav = this.router.lastSuccessfulNavigation()
    if (nav?.previousNavigation) this.location.back()
    else this.router.navigate(['/'])
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(p => {
      this.id.set(Number(p.get('id')))
      this.falso.set(false)
      this.cargar()
      this.aS.resumen(this.id(), this.auth.sesion()?.idUsuario).subscribe({ next: r => this.apoyo.set(r), error: () => this.apoyo.set(null) })
    })
  }

  private cargar() {
    forkJoin({ d: this.dS.cargar(), m: this.mS.list() }).subscribe({
      next: ({ d, m }) => {
        this.datos.set(d)
        this.moderaciones.set(m)
        this.noExiste.set(!d.testimonios.some(x => x.idTestimonio === this.id()))
      },
      error: () => this.noExiste.set(true),
    })
  }
}
