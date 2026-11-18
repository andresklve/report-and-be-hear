import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Datos, Datosservice } from './datosservice';
import { Moderacionservice } from './moderacionservice';
import { Reporteservice } from './reporteservice';
import { Apoyoservice } from './apoyoservice';
import { RankingApoyoDTO } from '../models/ApoyoDTO';
import { ModeracionDTO } from '../models/ModeracionDTO';
import { InversionDepartamentoDTO } from '../models/ReporteDTO';
import { Porcion } from '../components/donacomponent/donacomponent';
import { Barra } from '../components/barrascomponent/barrascomponent';
import { ESTADOS, colorCategoria, colorEstado } from '../shared/ui';

// Datos de la seccion publica "Resultados". Lo provee Resultadoscomponent, asi todas
// sus paginas hijas comparten los mismos datos y el mismo filtro de departamento.
@Injectable()
export class Resultadosservice {
  private dS = inject(Datosservice)
  private mS = inject(Moderacionservice)
  private rS = inject(Reporteservice)
  private aS = inject(Apoyoservice)

  datos = signal<Datos | null>(null)
  moderaciones = signal<ModeracionDTO[]>([])
  inversion = signal<InversionDepartamentoDTO[]>([])
  apoyos = signal<RankingApoyoDTO[]>([])
  error = signal(false)
  departamento = signal<string>('')   // '' = todo el Peru

  cargar() {
    if (this.datos()) return
    forkJoin({ d: this.dS.cargar(), m: this.mS.list(), i: this.rS.inversionPorDepartamento(), a: this.aS.ranking() }).subscribe({
      next: ({ d, m, i, a }) => { this.datos.set(d); this.moderaciones.set(m); this.inversion.set(i); this.apoyos.set(a) },
      error: () => this.error.set(true),
    })
  }

  pctDe(a: number, b: number) { return b ? Math.round((a / b) * 100) : 0 }

  // Porcentaje legible: con un decimal si es menor que 10 (p. ej. 0,4 %), entero si no
  porcentaje(p: number) {
    return p.toLocaleString('es-PE', { maximumFractionDigits: p < 10 ? 1 : 0, minimumFractionDigits: p < 10 ? 1 : 0 }) + '%'
  }

  departamentos = computed(() =>
    [...new Set((this.datos()?.zonas ?? []).map(z => z.departamentoZona).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')))

  // Reclamos del departamento elegido
  reclamos = computed(() => {
    const d = this.datos()
    if (!d) return []
    const dep = this.departamento()
    return dep ? d.testimonios.filter(t => d.zona.get(t.idZona)?.departamentoZona === dep) : d.testimonios
  })

  cifras = computed(() => {
    const l = this.reclamos()
    const n = (e: string) => l.filter(t => t.estado === e).length
    const resueltos = n('RESUELTO')
    return { total: l.length, resueltos, atencion: n('EN_PROCESO'), pendientes: n('PENDIENTE'), pct: this.pctDe(resueltos, l.length) }
  })

  porCategoria = computed(() => {
    const d = this.datos()
    if (!d) return []
    const m = new Map<string, { total: number; resueltos: number }>()
    for (const t of this.reclamos()) {
      const nom = d.cat.get(t.idCategoria)?.nombreCategoria ?? 'Otros'
      const x = m.get(nom) ?? { total: 0, resueltos: 0 }
      x.total++
      if (t.estado === 'RESUELTO') x.resueltos++
      m.set(nom, x)
    }
    return [...m.entries()].map(([nombre, v]) => ({ nombre, ...v })).sort((a, b) => b.total - a.total)
  })

  // Columnas por tipo de problema: cantidad y porcentaje del total
  columnasCategorias = computed<Barra[]>(() => {
    const total = this.cifras().total
    return this.porCategoria().map(c => ({
      label: c.nombre, valor: c.total, color: colorCategoria(c.nombre),
      texto: `${c.total.toLocaleString('es-PE')} · ${this.pctDe(c.total, total)}%`,
    }))
  })

  donaCategorias = computed<Porcion[]>(() =>
    this.porCategoria().map(c => ({ label: c.nombre, valor: c.total, color: colorCategoria(c.nombre) })))

  donaEstados = computed<Porcion[]>(() => {
    const l = this.reclamos()
    return ESTADOS.map(e => ({ label: e.label, valor: l.filter(t => t.estado === e.key).length, color: colorEstado(e.key) }))
  })

  // % resuelto de cada tipo de problema (escala fija de 0 a 100)
  barrasResueltas = computed<Barra[]>(() => this.porCategoria().map(c => {
    const p = this.pctDe(c.resueltos, c.total)
    return { label: c.nombre, valor: p, texto: `${p}%`, color: colorCategoria(c.nombre) }
  }))

  private invOrdenada = computed(() => [...this.inversion()].sort((a, b) => Number(b.totalInversion) - Number(a.totalInversion)))

  // Inversion como porcentaje del pais (sin mostrar montos)
  barrasInversion = computed<Barra[]>(() => {
    const inv = this.invOrdenada()
    const total = inv.reduce((s, i) => s + Number(i.totalInversion ?? 0), 0) || 1
    const dep = this.departamento()
    return inv.map(i => {
      const p = (Number(i.totalInversion) / total) * 100
      return {
        label: i.departamento, valor: p, texto: this.porcentaje(p),
        color: dep && i.departamento === dep ? 'var(--signal)' : 'var(--chart-dinero)',
      }
    })
  })

  top3Inversion = computed(() => {
    const inv = this.invOrdenada().map(i => Number(i.totalInversion ?? 0))
    const total = inv.reduce((s, x) => s + x, 0)
    return total ? Math.round(((inv[0] ?? 0) + (inv[1] ?? 0) + (inv[2] ?? 0)) / total * 100) : 0
  })

  inversionElegido = computed(() => {
    const dep = this.departamento()
    if (!dep) return null
    const i = this.invOrdenada().findIndex(x => x.departamento === dep)
    return { dep, puesto: i + 1, de: this.invOrdenada().length }
  })

  // Casos resueltos: moderaciones "Resuelto" con su nota publica, del mas reciente al mas antiguo
  resueltos = computed(() => {
    const d = this.datos()
    if (!d) return []
    const ids = new Set(this.reclamos().map(t => t.idTestimonio))
    const tMap = new Map(d.testimonios.map(t => [t.idTestimonio, t]))
    return this.moderaciones()
      .filter(m => m.accion === 'RESUELTO' && ids.has(m.idTestimonio))
      .sort((a, b) => (b.fechaAccion ?? '').localeCompare(a.fechaAccion ?? ''))
      .map(m => {
        const t = tMap.get(m.idTestimonio)!
        const z = d.zona.get(t.idZona)
        return { m, t, categoria: d.cat.get(t.idCategoria)?.nombreCategoria ?? '', lugar: z ? `${z.nombreZona}, ${z.departamentoZona}` : '' }
      })
  })

  // Reportes con mas apoyos de la ciudadania en el departamento elegido (ya vienen ordenados)
  masApoyados = computed(() => {
    const d = this.datos()
    if (!d) return []
    const tMap = new Map(this.reclamos().map(t => [t.idTestimonio, t]))
    return this.apoyos()
      .filter(a => tMap.has(a.idTestimonio))
      .map(a => {
        const t = tMap.get(a.idTestimonio)!
        const z = d.zona.get(t.idZona)
        return { t, apoyos: a.totalApoyos, categoria: d.cat.get(t.idCategoria)?.nombreCategoria ?? '', lugar: z ? `${z.nombreZona}, ${z.departamentoZona}` : '' }
      })
  })
}
