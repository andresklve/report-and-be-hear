import { Component, ElementRef, OnDestroy, ViewChild, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import type * as Leaflet from 'leaflet';
import { Datos, Datosservice } from '../../services/datosservice';
import { COLOR, Geoservice, NivelQueja, escala } from '../../services/geoservice';
import { GeoColeccion, GeoFeature, GeoIndice, Nivel } from '../../models/GeoDTO';
import { TestimonioDTO } from '../../models/TestimonioDTO';
import { ESTADOS, estadoInfo, iconoCategoria, referencia } from '../../shared/ui';

interface Seleccion {
  nivel: Nivel;
  id: string;
  nombre: string;
  sub: string;
  bbox?: [number, number, number, number];
  centro?: [number, number];
  dep?: string;
  prov?: string;
}

interface Ubicado { t: TestimonioDTO; dep: string; prov: string; dist?: string; }

const PERU: Seleccion = { nivel: 'pais', id: 'PE', nombre: 'Perú', sub: '25 departamentos · 196 provincias' }
const LIMITES: Leaflet.LatLngBoundsExpression = [[-18.45, -81.4], [-0.03, -68.65]]

// US07 / US35 - Mapa de calor del Peru (Leaflet + limites INEI de GeoIDEP).
// Departamentos -> provincias -> distritos segun el zoom; color segun cantidad de quejas.
@Component({
  selector: 'app-mapaperucomponent',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './mapaperucomponent.html',
})
export class Mapaperucomponent implements OnDestroy {
  @ViewChild('lienzo', { static: true }) lienzo!: ElementRef<HTMLDivElement>

  private geo = inject(Geoservice)
  private dS = inject(Datosservice)

  // ----- estado -----
  cargando = signal(true)
  error = signal(false)
  datos = signal<Datos | null>(null)
  sel = signal<Seleccion>(PERU)
  nivelVista = signal<'departamentos' | 'provincias' | 'distritos'>('departamentos')
  version = signal(0)             // se incrementa al clasificar distritos
  busqueda = signal('')
  resultados = signal<GeoIndice[]>([])
  activo = signal(0)
  escribiendo = signal(false)
  panelAbierto = signal(true)

  estadoInfo = estadoInfo
  iconoCategoria = iconoCategoria
  referencia = referencia
  colores = COLOR

  // ----- geografia -----
  private deps?: GeoColeccion
  private provs?: GeoColeccion
  private indice: GeoIndice[] = []
  private ubicados: Ubicado[] = []
  private distOf = new Map<number, string>()

  // ----- leaflet -----
  private L?: typeof Leaflet
  private mapa?: Leaflet.Map
  private capaDep?: Leaflet.GeoJSON
  private capaProv?: Leaflet.GeoJSON
  private capasDist = new Map<string, Leaflet.GeoJSON>()
  private grupoDist?: Leaflet.LayerGroup
  private grupoEtq?: Leaflet.LayerGroup
  private volando = false
  private zoomSel: number | null = null

  constructor() {
    afterNextRender(() => this.iniciar())
  }

  ngOnDestroy(): void {
    this.mapa?.remove()
  }

  // ================= datos =================

  private conteo(clave: 'dep' | 'prov' | 'dist'): Map<string, number> {
    this.version()
    const m = new Map<string, number>()
    for (const u of this.ubicados) {
      const k = clave === 'dist' ? this.distOf.get(u.t.idTestimonio) : u[clave]
      if (k) m.set(k, (m.get(k) ?? 0) + 1)
    }
    return m
  }

  porDep = computed(() => { this.datos(); return this.conteo('dep') })
  porProv = computed(() => { this.datos(); return this.conteo('prov') })
  porDist = computed(() => { this.datos(); return this.conteo('dist') })

  private escDep = computed(() => escala([...this.porDep().values()]))
  private escProv = computed(() => escala([...this.porProv().values()]))
  private escDist = computed(() => escala([...this.porDist().values()]))

  // Testimonios dentro de la seleccion actual
  private enSeleccion = computed(() => {
    this.version(); this.datos()
    const s = this.sel()
    switch (s.nivel) {
      case 'pais': return this.ubicados
      case 'departamento': return this.ubicados.filter(u => u.dep === s.id)
      case 'provincia': return this.ubicados.filter(u => u.prov === s.id)
      case 'distrito': return this.ubicados.filter(u => this.distOf.get(u.t.idTestimonio) === s.id)
    }
  })

  resumen = computed(() => {
    const lista = this.enSeleccion()
    const d = this.datos()
    const total = lista.length
    const estados = ESTADOS.map(e => ({ ...e, n: lista.filter(u => u.t.estado === e.key).length }))
      .map(e => ({ ...e, pct: total ? (e.n / total) * 100 : 0 }))
    const cats = new Map<number, number>()
    lista.forEach(u => cats.set(u.t.idCategoria, (cats.get(u.t.idCategoria) ?? 0) + 1))
    const categorias = [...cats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([id, n]) => ({ nombre: d?.cat.get(id)?.nombreCategoria ?? '—', n, pct: total ? (n / total) * 100 : 0 }))
    const ultimos = [...lista].sort((a, b) => b.t.idTestimonio - a.t.idTestimonio).slice(0, 5).map(u => ({
      t: u.t, zona: d?.zona.get(u.t.idZona)?.nombreZona ?? '', categoria: d?.cat.get(u.t.idCategoria)?.nombreCategoria ?? '',
    }))
    return { total, estados, categorias, ultimos, resueltos: estados.find(e => e.key === 'RESUELTO')?.pct ?? 0 }
  })

  // Sub-zonas de la seleccion (ranking)
  hijos = computed(() => {
    this.version()
    const s = this.sel()
    let feats: GeoFeature[] = []
    let cuenta = new Map<string, number>()
    let esc = this.escDep()
    if (s.nivel === 'pais' && this.deps) { feats = this.deps.features; cuenta = this.porDep(); esc = this.escDep() }
    else if (s.nivel === 'departamento' && this.provs) { feats = this.provs.features.filter(f => f.properties.dep === s.id); cuenta = this.porProv(); esc = this.escProv() }
    else if (s.nivel === 'provincia') { feats = this.geo.distritosCargados(s.id)?.features ?? []; cuenta = this.porDist(); esc = this.escDist() }
    const lista = feats.map(f => ({ f, n: cuenta.get(f.properties.id) ?? 0 })).sort((a, b) => b.n - a.n)
    const max = Math.max(1, ...lista.map(x => x.n))
    return lista.slice(0, 10).map(x => ({ ...x, pct: (x.n / max) * 100, nivel: esc(x.n) }))
  })

  tituloHijos = computed(() => ({ pais: 'Departamentos', departamento: 'Provincias', provincia: 'Distritos', distrito: '' })[this.sel().nivel])

  migas = computed(() => {
    const s = this.sel()
    const m: Seleccion[] = [PERU]
    if (s.nivel === 'pais') return m
    const dep = s.nivel === 'departamento' ? s.id : s.dep
    const depF = this.deps?.features.find(f => f.properties.id === dep)
    if (depF && s.nivel !== 'departamento') m.push(this.seleccionDe(depF))
    if (s.nivel === 'distrito') {
      const provF = this.provs?.features.find(f => f.properties.id === s.prov)
      if (provF) m.push(this.seleccionDe(provF))
    }
    return m
  })

  reportarParams = computed(() => {
    const s = this.sel()
    return s.nivel === 'distrito' && s.centro ? { lat: s.centro[0], lng: s.centro[1] } : {}
  })

  // ================= inicio =================

  private async iniciar() {
    const mod = await import('leaflet')
    const L = ((mod as any).default ?? mod) as typeof Leaflet
    this.L = L

    this.mapa = L.map(this.lienzo.nativeElement, {
      zoomControl: false, minZoom: 5, maxZoom: 16, maxBounds: L.latLngBounds([[-21, -84], [2.5, -66]]),
      maxBoundsViscosity: 0.8, zoomSnap: 0.5, attributionControl: true,
    }).fitBounds(LIMITES)
    L.control.zoom({ position: 'bottomright' }).addTo(this.mapa)
    this.mapa.attributionControl.setPrefix(false)

    // Solo el Peru: sin mapa base de otros paises, fondo blanco y etiquetas propias
    this.mapa.attributionControl.addAttribution('Límites: <a href="https://www.geoidep.gob.pe/" target="_blank" rel="noopener">INEI · GeoIDEP</a>')
    this.mapa.createPane('etiquetas')
    const pane = this.mapa.getPane('etiquetas')!
    pane.style.zIndex = '450'
    pane.style.pointerEvents = 'none'
    this.grupoEtq = L.layerGroup().addTo(this.mapa)

    this.grupoDist = L.layerGroup().addTo(this.mapa)

    forkJoin({ deps: this.geo.departamentos(), provs: this.geo.provincias(), indice: this.geo.indice(), datos: this.dS.cargar() })
      .subscribe({
        next: ({ deps, provs, indice, datos }) => {
          this.deps = deps
          this.provs = provs
          this.indice = indice
          this.ubicar(datos.testimonios)
          this.datos.set(datos)
          this.crearCapas()
          this.cargando.set(false)
        },
        error: () => { this.error.set(true); this.cargando.set(false) },
      })

    this.mapa.on('zoomend moveend', () => this.actualizarCapas())
    // Si la persona se aleja de lo que selecciono, el mapa vuelve a la normalidad
    this.mapa.on('zoomend', () => {
      if (this.volando || this.sel().nivel === 'pais' || this.zoomSel == null) return
      if (this.mapa!.getZoom() < this.zoomSel - 0.75) this.quitarSeleccion()
    })
  }

  // Clasifica cada testimonio en su provincia/departamento por sus coordenadas
  private ubicar(ts: TestimonioDTO[]) {
    const feats = this.provs!.features
    this.ubicados = []
    for (const t of ts) {
      const f = Geoservice.ubicar(Number(t.latitud), Number(t.longitud), feats)
      if (f) this.ubicados.push({ t, prov: f.properties.id, dep: f.properties.dep! })
    }
  }

  private clasificarDistritos(idProv: string, col: GeoColeccion) {
    let cambios = 0
    for (const u of this.ubicados) {
      if (u.prov !== idProv || this.distOf.has(u.t.idTestimonio)) continue
      const f = Geoservice.ubicar(Number(u.t.latitud), Number(u.t.longitud), col.features)
      if (f) { this.distOf.set(u.t.idTestimonio, f.properties.id); cambios++ }
    }
    if (cambios || !this.version()) this.version.update(v => v + 1)
  }

  // ================= capas =================

  private estilo(nivel: NivelQueja, seleccionado: boolean, tenue = false): Leaflet.PathOptions {
    return {
      fillColor: COLOR[nivel],
      fillOpacity: tenue ? 0 : nivel === 'sin' ? 1 : 0.85,
      color: seleccionado ? '#111418' : tenue ? '#5B636D' : '#FFFFFF',
      weight: seleccionado ? 3 : tenue ? 1.2 : 1,
      opacity: tenue ? 0.9 : 1,
      dashArray: tenue ? '4 4' : undefined,
    }
  }

  private crearCapas() {
    const L = this.L!
    const tooltip = (n: number) => `<b>${n.toLocaleString('es-PE')}</b> ${n === 1 ? 'queja' : 'quejas'}`

    this.capaDep = L.geoJSON(this.deps as any, {
      style: f => this.estiloDep(f as GeoFeature),
      onEachFeature: (f, layer) => {
        layer.bindTooltip(() => `<span>${f.properties.nombre}</span>${tooltip(this.porDep().get(f.properties.id) ?? 0)}`, { sticky: true, className: 'mp-tip', direction: 'top', offset: [0, -8] })
        layer.on('click', () => this.elegir(this.seleccionDe(f as GeoFeature), true))
        layer.on('mouseover', () => (layer as Leaflet.Path).setStyle({ weight: 2.5, color: '#111418' }))
        layer.on('mouseout', () => this.capaDep?.resetStyle(layer))
      },
    })

    this.capaProv = L.geoJSON(this.provs as any, {
      style: f => this.estiloProv(f as GeoFeature),
      onEachFeature: (f, layer) => {
        layer.bindTooltip(() => `<span>${f.properties.nombre}</span><small>${f.properties.depNombre}</small>${tooltip(this.porProv().get(f.properties.id) ?? 0)}`, { sticky: true, className: 'mp-tip', direction: 'top', offset: [0, -8] })
        layer.on('click', () => this.elegir(this.seleccionDe(f as GeoFeature), true))
        layer.on('mouseover', () => (layer as Leaflet.Path).setStyle({ weight: 2.5, color: '#111418' }))
        layer.on('mouseout', () => (layer as Leaflet.Path).setStyle(this.estiloProv(f as GeoFeature)))
      },
    })
    this.actualizarCapas()
  }

  private estiloProv(f: GeoFeature): Leaflet.PathOptions {
    const tenue = this.capasDist.has(f.properties.id) && this.nivelVista() === 'distritos'
    return this.foco(f, this.estilo(this.escProv()(this.porProv().get(f.properties.id) ?? 0), this.sel().id === f.properties.id, tenue))
  }

  private estiloDep(f: GeoFeature): Leaflet.PathOptions {
    return this.foco(f, this.estilo(this.escDep()(this.porDep().get(f.properties.id) ?? 0), this.sel().id === f.properties.id))
  }

  private estiloDist(f: GeoFeature): Leaflet.PathOptions {
    return this.foco(f, this.estilo(this.escDist()(this.porDist().get(f.properties.id) ?? 0), this.sel().id === f.properties.id))
  }

  // Relacion de un poligono con la seleccion actual
  private relacion(f: GeoFeature): 'dentro' | 'contenedor' | 'fuera' {
    const s = this.sel(), p = f.properties
    if (s.nivel === 'pais') return 'dentro'
    if (s.nivel === 'departamento') return (p.nivel === 'departamento' ? p.id : p.dep) === s.id ? 'dentro' : 'fuera'
    if (s.nivel === 'provincia') {
      if (p.nivel === 'departamento') return p.id === s.dep ? 'contenedor' : 'fuera'
      return (p.nivel === 'provincia' ? p.id : p.prov) === s.id ? 'dentro' : 'fuera'
    }
    // distrito
    if (p.nivel === 'distrito') return p.id === s.id ? 'dentro' : 'fuera'
    if (p.nivel === 'provincia') return p.id === s.prov ? 'contenedor' : 'fuera'
    return p.id === s.dep ? 'contenedor' : 'fuera'
  }

  // Al seleccionar algo, todo lo que queda fuera se pinta de blanco
  private foco(f: GeoFeature, base: Leaflet.PathOptions): Leaflet.PathOptions {
    const r = this.relacion(f)
    if (r === 'dentro') return base
    const relleno = base.fillOpacity === 0 ? 0 : 1
    return r === 'contenedor'
      ? { ...base, fillColor: '#FFFFFF', fillOpacity: relleno, color: '#9AA1AB', weight: 1.4, dashArray: undefined, opacity: 1 }
      : { ...base, fillColor: '#FFFFFF', fillOpacity: relleno, color: '#E4E7EB', weight: 0.8, dashArray: undefined, opacity: 1 }
  }

  private actualizarCapas() {
    if (!this.mapa || !this.capaDep || !this.capaProv) return
    const z = this.mapa.getZoom()
    const vista = z < 7 ? 'departamentos' : z < 9 ? 'provincias' : 'distritos'
    this.nivelVista.set(vista)

    this.alternar(this.capaDep, vista === 'departamentos')
    this.alternar(this.capaProv, vista !== 'departamentos')

    if (vista === 'distritos') {
      const b = this.mapa.getBounds()
      const visibles = this.provs!.features.filter(f => {
        const [x0, y0, x1, y1] = f.properties.bbox
        return b.intersects([[y0, x0], [y1, x1]])
      }).slice(0, 14)
      visibles.forEach(f => this.mostrarDistritos(f.properties.id))
      if (!this.mapa.hasLayer(this.grupoDist!)) this.grupoDist!.addTo(this.mapa)
    } else {
      this.grupoDist?.remove()
    }
    this.refrescarEstilos()
    this.actualizarEtiquetas()
  }

  // Nombres de los lugares (reemplazan las etiquetas del mapa base)
  private actualizarEtiquetas() {
    const L = this.L, mapa = this.mapa, g = this.grupoEtq
    if (!L || !mapa || !g) return
    g.clearLayers()
    const z = mapa.getZoom()
    const b = mapa.getBounds().pad(0.1)
    let feats: GeoFeature[] = []
    let clase = 'dep'
    if (z < 7) feats = this.deps?.features ?? []
    else if (z < 10) { feats = this.provs?.features ?? []; clase = 'prov' }
    else { this.capasDist.forEach((_, id) => feats.push(...(this.geo.distritosCargados(id)?.features ?? []))); clase = 'dist' }
    feats.filter(f => b.contains(f.properties.centro) && this.relacion(f) === 'dentro').slice(0, 220).forEach(f => {
      L.marker(f.properties.centro, {
        pane: 'etiquetas', interactive: false, keyboard: false,
        icon: L.divIcon({ className: 'mp-etq mp-etq-' + clase, html: `<span>${f.properties.nombre}</span>`, iconSize: [0, 0] }),
      }).addTo(g)
    })
  }

  private alternar(capa: Leaflet.Layer, mostrar: boolean) {
    if (mostrar && !this.mapa!.hasLayer(capa)) capa.addTo(this.mapa!)
    if (!mostrar && this.mapa!.hasLayer(capa)) capa.remove()
  }

  private mostrarDistritos(idProv: string, alCargar?: () => void) {
    if (this.capasDist.has(idProv)) { alCargar?.(); return }
    this.geo.distritosDe(idProv).subscribe(col => {
      if (this.capasDist.has(idProv)) { alCargar?.(); return }
      this.clasificarDistritos(idProv, col)
      const L = this.L!
      const capa = L.geoJSON(col as any, {
        style: f => this.estiloDist(f as GeoFeature),
        onEachFeature: (f, layer) => {
          layer.bindTooltip(() => {
            const n = this.porDist().get(f.properties.id) ?? 0
            return `<span>${f.properties.nombre}</span><small>${f.properties.provNombre}, ${f.properties.depNombre}</small><b>${n.toLocaleString('es-PE')}</b> ${n === 1 ? 'queja' : 'quejas'}`
          }, { sticky: true, className: 'mp-tip', direction: 'top', offset: [0, -8] })
          layer.on('click', () => this.elegir(this.seleccionDe(f as GeoFeature), true))
          layer.on('mouseover', () => (layer as Leaflet.Path).setStyle({ weight: 2.5, color: '#111418' }))
          layer.on('mouseout', () => capa.resetStyle(layer))
        },
      })
      this.capasDist.set(idProv, capa)
      capa.addTo(this.grupoDist!)
      this.refrescarEstilos()
      this.actualizarEtiquetas()
      alCargar?.()
    })
  }

  private refrescarEstilos() {
    this.capaDep?.setStyle(f => this.estiloDep(f as GeoFeature))
    this.capaProv?.setStyle(f => this.estiloProv(f as GeoFeature))
    this.capasDist.forEach(c => c.setStyle(f => this.estiloDist(f as GeoFeature)))
  }

  // ================= seleccion =================

  private seleccionDe(f: GeoFeature): Seleccion {
    const p = f.properties
    const sub = p.nivel === 'departamento' ? 'Departamento'
      : p.nivel === 'provincia' ? `Provincia · ${p.depNombre}`
        : `Distrito · ${p.provNombre}, ${p.depNombre}`
    return { nivel: p.nivel, id: p.id, nombre: p.nombre, sub, bbox: p.bbox, centro: p.centro, dep: p.dep, prov: p.prov }
  }

  elegir(s: Seleccion, mover = false) {
    this.sel.set(s)
    this.panelAbierto.set(true)
    if (s.nivel === 'provincia') this.mostrarDistritos(s.id)
    if (s.nivel === 'distrito' && s.prov) this.mostrarDistritos(s.prov)
    this.zoomSel = this.mapa?.getZoom() ?? null
    if (mover && this.mapa) {
      this.volando = true
      this.mapa.once('moveend', () => {
        this.volando = false
        this.zoomSel = this.mapa!.getZoom()
      })
      if (s.nivel === 'pais') this.mapa.flyToBounds(LIMITES, { duration: 0.8 })
      else if (s.bbox) {
        const [x0, y0, x1, y1] = s.bbox
        this.mapa.flyToBounds([[y0, x0], [y1, x1]], { duration: 0.8, maxZoom: s.nivel === 'distrito' ? 13 : 11, paddingTopLeft: [20, 90], paddingBottomRight: [this.panelAbierto() ? 400 : 20, 20] })
      }
    }
    this.refrescarEstilos()
    this.actualizarEtiquetas()
  }

  elegirHijo(f: GeoFeature) {
    this.elegir(this.seleccionDe(f), true)
  }

  // ================= buscador =================

  buscar(texto: string) {
    this.busqueda.set(texto)
    this.escribiendo.set(true)
    this.resultados.set(this.geo.buscar(texto, this.indice))
    this.activo.set(0)
  }

  teclado(ev: KeyboardEvent) {
    const n = this.resultados().length
    if (!n) return
    if (ev.key === 'ArrowDown') { this.activo.set((this.activo() + 1) % n); ev.preventDefault() }
    if (ev.key === 'ArrowUp') { this.activo.set((this.activo() - 1 + n) % n); ev.preventDefault() }
    if (ev.key === 'Enter') { this.irA(this.resultados()[this.activo()]); ev.preventDefault() }
    if (ev.key === 'Escape') { this.resultados.set([]) }
  }

  irA(e: GeoIndice) {
    this.busqueda.set(e.n)
    this.escribiendo.set(false)
    this.resultados.set([])
    if (e.t === 'd') {
      const f = this.deps?.features.find(x => x.properties.id === e.id)
      if (f) this.elegir(this.seleccionDe(f), true)
    } else if (e.t === 'p') {
      const f = this.provs?.features.find(x => x.properties.id === e.id)
      if (f) this.elegir(this.seleccionDe(f), true)
    } else if (e.pr) {
      this.mostrarDistritos(e.pr, () => {
        const f = this.geo.distritosCargados(e.pr!)?.features.find(x => x.properties.id === e.id)
        if (f) this.elegir(this.seleccionDe(f), true)
      })
    }
  }

  limpiarBusqueda() {
    this.busqueda.set('')
    this.resultados.set([])
  }

  tipo(t: GeoIndice['t']) {
    return t === 'd' ? 'Departamento' : t === 'p' ? 'Provincia' : 'Distrito'
  }

  // Vuelve a "Peru" sin mover el mapa
  private quitarSeleccion() {
    this.zoomSel = null
    this.sel.set(PERU)
    this.limpiarBusqueda()
    this.refrescarEstilos()
    this.actualizarEtiquetas()
  }

  volverPeru() {
    this.limpiarBusqueda()
    this.elegir(PERU, true)
  }
}
