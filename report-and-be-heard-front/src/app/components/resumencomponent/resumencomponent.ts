import { MatChipsModule } from '@angular/material/chips';
import { Component, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Datos, Datosservice } from '../../services/datosservice';
import { Reporteservice } from '../../services/reporteservice';
import {
  CategoriaReporteDTO, CostoCategoriaDTO, DesempenoIADTO, InversionDepartamentoDTO,
  RankingZonaDTO, TendenciaTemporalDTO
} from '../../models/ReporteDTO';
import { Barra, Barrascomponent } from '../barrascomponent/barrascomponent';
import { Donacomponent, Porcion } from '../donacomponent/donacomponent';
import { ESTADOS, colorCategoria, colorEstado, duracion, soles } from '../../shared/ui';

// Reportes US08 - US14 para Municipalidad y Administrador
@Component({
  selector: 'app-resumencomponent',
  imports: [MatChipsModule, Barrascomponent, Donacomponent, DecimalPipe, RouterLink, MatCardModule, MatButtonModule, MatButtonToggleModule, MatIconModule,
    MatBadgeModule, MatTooltipModule, MatTableModule, MatPaginatorModule, MatProgressBarModule],
  templateUrl: './resumencomponent.html',
  styleUrl: './resumencomponent.css',
})
export class Resumencomponent implements OnInit {
  private dS = inject(Datosservice)
  private rS = inject(Reporteservice)
  colorCategoria = colorCategoria

  datos = signal<Datos | null>(null)
  porCategoria = signal<CategoriaReporteDTO[]>([])
  ranking = signal<RankingZonaDTO[]>([])
  tendencia = signal<TendenciaTemporalDTO[]>([])
  agrupacion = signal<'dia' | 'mes'>('dia')
  inversion = signal<InversionDepartamentoDTO[]>([])
  costos = signal<CostoCategoriaDTO[]>([])
  tiempo = signal<number | null>(null)
  ia = signal<DesempenoIADTO[]>([])
  verTodosDep = signal(false)

  // Tabla de desempeño de IA con paginador
  columnasIA = ['categoria', 'modelo', 'confianza']
  tablaIA = new MatTableDataSource<DesempenoIADTO>([])
  paginadorIA = viewChild(MatPaginator)

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

  // ----- Donas (partes de un total, 6 o menos) -----
  donaEstados = computed<Porcion[]>(() => {
    const ts = this.datos()?.testimonios ?? []
    return ESTADOS.map(e => ({ label: e.label, valor: ts.filter(t => t.estado === e.key).length, color: colorEstado(e.key) }))
  })
  // Mayor a menor, cada categoria con su color fijo
  donaCategorias = computed<Porcion[]>(() => [...this.porCategoria()]
    .sort((a, b) => b.cantidadTestimonios - a.cantidadTestimonios)
    .map(c => ({ label: c.nombreCategoria, valor: c.cantidadTestimonios, color: colorCategoria(c.nombreCategoria) })))
  donaCosto = computed<Porcion[]>(() => [...this.costos()]
    .sort((a, b) => Number(b.totalCosto) - Number(a.totalCosto))
    .map(c => ({ label: c.categoria, valor: Number(c.totalCosto), texto: soles(c.totalCosto), color: colorCategoria(c.categoria) })))
  totalCostoCorto = computed(() => {
    const t = this.costos().reduce((s, c) => s + Number(c.totalCosto ?? 0), 0)
    return t >= 1e6 ? `S/ ${(t / 1e6).toFixed(2)} M` : t >= 1e3 ? `S/ ${Math.round(t / 1e3)} mil` : soles(t)
  })

  // ----- Barras (comparar muchas partes) -----
  barrasRanking = computed<Barra[]>(() => this.ranking().slice(0, 6).map(r => ({ label: r.nombreZona, valor: r.totalTestimonios })))
  barrasInversion = computed<Barra[]>(() => [...this.inversion()]
    .sort((a, b) => Number(b.totalInversion) - Number(a.totalInversion))
    .map(i => ({ label: i.departamento, valor: Number(i.totalInversion), texto: soles(i.totalInversion) })))

  // Costo promedio = costo total de la categoria / reclamos atendidos (en atencion o resueltos)
  promedios = computed(() => {
    const ts = this.datos()?.testimonios ?? []
    const cat = this.datos()?.cat
    return this.costos().map(c => {
      const atendidos = ts.filter(t => cat?.get(t.idCategoria)?.nombreCategoria === c.categoria && ['EN_PROCESO', 'RESUELTO'].includes(t.estado)).length
      return { label: c.categoria, valor: atendidos ? Number(c.totalCosto) / atendidos : 0 }
    }).filter(x => x.valor > 0).sort((a, b) => b.valor - a.valor)
  })
  barrasPromedio = computed<Barra[]>(() => this.promedios().map(p => ({ label: p.label, valor: p.valor, texto: soles(Math.round(p.valor)), color: colorCategoria(p.label) })))

  // ----- Lectura de cada grafico en una frase -----
  lecturas = computed(() => {
    const pct = (a: number, b: number) => b ? Math.round((a / b) * 100) : 0
    const k = this.kpis()
    const cats = this.donaCategorias(), totCat = cats.reduce((s, c) => s + c.valor, 0)
    const costo = this.donaCosto(), totCosto = costo.reduce((s, c) => s + c.valor, 0)
    const prom = this.promedios()
    const inv = this.barrasInversion(), totInv = inv.reduce((s, i) => s + i.valor, 0)
    const col = this.columnas()
    const pico = col.reduce((m, c) => c.totalTestimonios > (m?.totalTestimonios ?? -1) ? c : m, col[0])
    const promDia = col.length ? Math.round(col.reduce((s, c) => s + c.totalTestimonios, 0) / col.length) : 0
    const zona = this.ranking()[0]
    return {
      estado: k.total ? `<b>${k.pendientes.toLocaleString('es-PE')}</b> reclamos (${pct(k.pendientes, k.total)}%) todavía esperan su primera atención.` : '',
      categoria: cats[0] ? `<b>${cats[0].label}</b> concentra el ${pct(cats[0].valor, totCat)}% de los reclamos; junto con ${cats[1]?.label ?? ''} suman el ${pct(cats[0].valor + (cats[1]?.valor ?? 0), totCat)}%.` : '',
      tendencia: pico ? (this.agrupacion() === 'mes'
        ? `El mes con más reclamos fue <b>${pico.etiqueta}</b>, con ${pico.totalTestimonios}.`
        : `El día con más reclamos fue el <b>${pico.etiqueta}</b> (${pico.totalTestimonios}); el promedio es ${promDia} por día.`) : '',
      costo: costo[0] ? `<b>${costo[0].label}</b> se lleva el ${pct(costo[0].valor, totCosto)}% de todo lo invertido.` : '',
      promedio: prom.length > 1 ? `Resolver un reclamo de <b>${prom[0].label}</b> cuesta en promedio ${soles(Math.round(prom[0].valor))}, ${(prom[0].valor / prom[prom.length - 1].valor).toFixed(1)} veces más que uno de ${prom[prom.length - 1].label}.` : '',
      inversion: inv.length > 3 ? `<b>${inv[0].label}</b>, ${inv[1].label} y ${inv[2].label} reciben el ${pct(inv[0].valor + inv[1].valor + inv[2].valor, totInv)}% de la inversión.` : '',
      zonas: zona ? `<b>${zona.nombreZona}</b> lidera con ${zona.totalTestimonios} reclamos.` : '',
    }
  })

  // Por dia: ultimos 30 dias (los dias sin reportes salen en 0). Por mes: todos los meses.
  columnas = computed(() => {
    let t = this.tendencia()
    if (this.agrupacion() === 'dia') {
      const mapa = new Map(t.map(x => [x.periodo, x.totalTestimonios]))
      const fin = t.length ? new Date(t[t.length - 1].periodo + 'T00:00') : new Date()
      t = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(fin); d.setDate(fin.getDate() - 29 + i)
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        return { periodo: k, totalTestimonios: mapa.get(k) ?? 0 }
      })
    }
    const max = Math.max(1, ...t.map(x => x.totalTestimonios))
    return t.map(x => ({ ...x, pct: (x.totalTestimonios / max) * 100, etiqueta: this.etiqueta(x.periodo), pico: x.totalTestimonios === max }))
  })

  // "2026-11-05" -> "5 nov" ; "2026-11" -> "nov 26"
  private etiqueta(periodo: string) {
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic']
    const [a, m, d] = periodo.split('-')
    return d ? `${Number(d)} ${meses[Number(m) - 1]}` : `${meses[Number(m) - 1]} ${a.slice(2)}`
  }

  constructor() {
    effect(() => { this.tablaIA.data = this.ia() })
    effect(() => { this.tablaIA.paginator = this.paginadorIA() ?? null })
  }

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
