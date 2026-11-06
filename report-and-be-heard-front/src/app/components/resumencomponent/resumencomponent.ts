import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../services/datosservice';
import { Reporteservice } from '../../services/reporteservice';
import {
  CategoriaReporteDTO, CostoCategoriaDTO, DesempenoIADTO, InversionDepartamentoDTO,
  RankingZonaDTO, TendenciaTemporalDTO
} from '../../models/ReporteDTO';
import { Barra, Barrascomponent } from '../barrascomponent/barrascomponent';
import { duracion, soles } from '../../shared/ui';

// Reportes US08 - US14 para Municipalidad y Administrador
@Component({
  selector: 'app-resumencomponent',
  imports: [Barrascomponent, DecimalPipe, RouterLink],
  templateUrl: './resumencomponent.html',
})
export class Resumencomponent implements OnInit {
  private dS = inject(Datosservice)
  private rS = inject(Reporteservice)

  datos = signal<Datos | null>(null)
  porCategoria = signal<CategoriaReporteDTO[]>([])
  ranking = signal<RankingZonaDTO[]>([])
  tendencia = signal<TendenciaTemporalDTO[]>([])
  agrupacion = signal<'dia' | 'mes'>('dia')
  inversion = signal<InversionDepartamentoDTO[]>([])
  costos = signal<CostoCategoriaDTO[]>([])
  tiempo = signal<number | null>(null)
  ia = signal<DesempenoIADTO[]>([])
  hoy = new Date()

  kpis = computed(() => {
    const ts = this.datos()?.testimonios ?? []
    const n = (e: string) => ts.filter(t => t.estado === e).length
    return {
      total: ts.length, pendientes: n('PENDIENTE'), proceso: n('EN_PROCESO'), resueltos: n('RESUELTO'),
      inversion: soles(this.inversion().reduce((s, i) => s + Number(i.totalInversion ?? 0), 0)),
      tiempo: duracion(this.tiempo()),
      pct: ts.length ? Math.round((n('RESUELTO') / ts.length) * 100) : 0,
    }
  })

  barrasCategoria = computed<Barra[]>(() => this.porCategoria().map(c => ({ label: c.nombreCategoria, valor: c.cantidadTestimonios })))
  barrasRanking = computed<Barra[]>(() => this.ranking().slice(0, 6).map(r => ({ label: r.nombreZona, valor: r.totalTestimonios })))
  barrasInversion = computed<Barra[]>(() => this.inversion().map(i => ({ label: i.departamento, valor: Number(i.totalInversion), texto: soles(i.totalInversion) })))
  barrasCosto = computed<Barra[]>(() => this.costos().map(c => ({ label: c.categoria, valor: Number(c.totalCosto), texto: soles(c.totalCosto) })))

  columnas = computed(() => {
    const t = this.tendencia().slice(-14)
    const max = Math.max(1, ...t.map(x => x.totalTestimonios))
    return t.map(x => ({ ...x, pct: (x.totalTestimonios / max) * 100 }))
  })

  ngOnInit(): void {
    this.dS.cargar().subscribe(d => this.datos.set(d))
    this.rS.porCategoria().subscribe(r => this.porCategoria.set(r))
    this.rS.rankingZonas().subscribe(r => this.ranking.set(r))
    this.rS.inversionPorDepartamento().subscribe(r => this.inversion.set(r))
    this.rS.costoPorCategoria().subscribe(r => this.costos.set(r))
    this.rS.tiempoAtencion().subscribe(r => this.tiempo.set(r?.diasPromedio ?? null))
    this.rS.desempenoIA().subscribe(r => this.ia.set(r))
    this.cargarTendencia()
  }

  cargarTendencia(a: 'dia' | 'mes' = this.agrupacion()) {
    this.agrupacion.set(a)
    this.rS.tendencia(a).subscribe(r => this.tendencia.set(r))
  }
}
