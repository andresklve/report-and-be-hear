import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay, tap } from 'rxjs';
import { GeoColeccion, GeoFeature, GeoIndice } from '../models/GeoDTO';

// Capas geograficas del Peru (INEI via GeoIDEP) servidas desde /geo
@Injectable({
  providedIn: 'root',
})
export class Geoservice {
  private http = inject(HttpClient)
  private deps$?: Observable<GeoColeccion>
  private provs$?: Observable<GeoColeccion>
  private indice$?: Observable<GeoIndice[]>
  private distritos = new Map<string, GeoColeccion>()

  departamentos(): Observable<GeoColeccion> {
    return this.deps$ ??= this.http.get<GeoColeccion>('/geo/departamentos.json').pipe(shareReplay(1))
  }

  provincias(): Observable<GeoColeccion> {
    return this.provs$ ??= this.http.get<GeoColeccion>('/geo/provincias.json').pipe(shareReplay(1))
  }

  indice(): Observable<GeoIndice[]> {
    return this.indice$ ??= this.http.get<GeoIndice[]>('/geo/indice.json').pipe(shareReplay(1))
  }

  // Distritos de una provincia (carga diferida y en cache)
  distritosDe(idProv: string): Observable<GeoColeccion> {
    const c = this.distritos.get(idProv)
    if (c) return of(c)
    return this.http.get<GeoColeccion>(`/geo/distritos/${idProv}.json`).pipe(tap(d => this.distritos.set(idProv, d)))
  }

  distritosCargados(idProv: string): GeoColeccion | undefined {
    return this.distritos.get(idProv)
  }

  buscar(texto: string, lista: GeoIndice[], max = 8): GeoIndice[] {
    const q = Geoservice.norm(texto)
    if (q.length < 2) return []
    const orden = { d: 0, p: 1, x: 2 }
    return lista
      .map(e => ({ e, n: Geoservice.norm(e.n) }))
      .filter(x => x.n.includes(q))
      .sort((a, b) => (a.n.startsWith(q) ? 0 : 1) - (b.n.startsWith(q) ? 0 : 1) || orden[a.e.t] - orden[b.e.t] || a.n.length - b.n.length)
      .slice(0, max)
      .map(x => x.e)
  }

  // Provincia (y su departamento) donde cae un punto
  provinciaDe(lat: number, lng: number, provs: GeoColeccion): GeoFeature | null {
    return Geoservice.ubicar(lat, lng, provs.features)
  }

  static ubicar(lat: number, lng: number, feats: GeoFeature[]): GeoFeature | null {
    for (const f of feats) {
      const [x0, y0, x1, y1] = f.properties.bbox
      if (lng < x0 || lng > x1 || lat < y0 || lat > y1) continue
      if (Geoservice.dentro(lng, lat, f)) return f
    }
    return null
  }

  static dentro(x: number, y: number, f: GeoFeature): boolean {
    for (const poly of f.geometry.coordinates) {
      let adentro = false
      for (let r = 0; r < poly.length; r++) {
        const ring = poly[r]
        let c = false
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          const [xi, yi] = ring[i], [xj, yj] = ring[j]
          if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
        }
        if (r === 0) adentro = c
        else if (c) adentro = false   // dentro de un hueco
      }
      if (adentro) return true
    }
    return false
  }

  static norm(s: string | null | undefined): string {
    return (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim()
  }
}

// Nivel de quejas -> color del mapa (verde / naranja / rojo)
export type NivelQueja = 'sin' | 'bajo' | 'medio' | 'alto';

export function escala(valores: number[]): (n: number) => NivelQueja {
  const v = valores.filter(x => x > 0).sort((a, b) => a - b)
  const q = (p: number) => v.length ? v[Math.min(v.length - 1, Math.floor(p * v.length))] : 0
  const t1 = q(0.4), t2 = q(0.75)
  return n => n <= 0 ? 'sin' : n <= t1 ? 'bajo' : n <= t2 ? 'medio' : 'alto'
}

export const COLOR: Record<NivelQueja, string> = {
  sin: '#E9ECEF',
  bajo: '#3FA34D',
  medio: '#F2A007',
  alto: '#D62828',
}

