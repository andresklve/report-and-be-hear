import { Component, ElementRef, OnDestroy, ViewChild, afterNextRender, effect, input, output } from '@angular/core';
import type * as Leaflet from 'leaflet';

// Mapa pequeño (Leaflet) para marcar el punto exacto de un reporte o mostrarlo en el detalle
@Component({
  selector: 'app-mapa-picker',
  templateUrl: './mapapickercomponent.html',
})
export class Mapapickercomponent implements OnDestroy {
  @ViewChild('lienzo', { static: true }) lienzo!: ElementRef<HTMLDivElement>

  lat = input<number | null>(null)
  lng = input<number | null>(null)
  editable = input(false)
  encuadre = input<[number, number, number, number] | null>(null)   // bbox [minLng, minLat, maxLng, maxLat]
  punto = output<{ lat: number; lng: number }>()

  private L?: typeof Leaflet
  private mapa?: Leaflet.Map
  private marca?: Leaflet.Marker

  constructor() {
    afterNextRender(() => this.iniciar())
    effect(() => this.pintar(this.lat(), this.lng()))
    effect(() => {
      const b = this.encuadre()
      if (b && this.mapa) this.mapa.flyToBounds([[b[1], b[0]], [b[3], b[2]]], { duration: 0.6, maxZoom: 15 })
    })
  }

  ngOnDestroy(): void {
    this.mapa?.remove()
  }

  private async iniciar() {
    const mod = await import('leaflet')
    const L = ((mod as any).default ?? mod) as typeof Leaflet
    this.L = L
    this.mapa = L.map(this.lienzo.nativeElement, {
      zoomControl: true, minZoom: 5, maxZoom: 18, attributionControl: true,
      maxBounds: L.latLngBounds([[-21, -84], [2.5, -66]]),
    }).fitBounds([[-18.45, -81.4], [-0.03, -68.65]])
    this.mapa.attributionControl.setPrefix(false)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.mapa)
    if (this.editable()) {
      this.mapa.on('click', e => this.punto.emit({ lat: +e.latlng.lat.toFixed(6), lng: +e.latlng.lng.toFixed(6) }))
    }
    this.pintar(this.lat(), this.lng(), true)
    setTimeout(() => this.mapa?.invalidateSize(), 50)
  }

  private pintar(lat: number | null, lng: number | null, centrar = false) {
    const L = this.L, mapa = this.mapa
    if (!L || !mapa || lat == null || lng == null || !isFinite(lat) || !isFinite(lng)) return
    const icono = L.divIcon({ className: 'pin', html: '<span></span>', iconSize: [28, 36], iconAnchor: [14, 34] })
    if (!this.marca) {
      this.marca = L.marker([lat, lng], { icon: icono, draggable: this.editable(), keyboard: false }).addTo(mapa)
      this.marca.on('dragend', () => {
        const p = this.marca!.getLatLng()
        this.punto.emit({ lat: +p.lat.toFixed(6), lng: +p.lng.toFixed(6) })
      })
      centrar = true
    } else {
      this.marca.setLatLng([lat, lng])
    }
    if (centrar || !mapa.getBounds().contains([lat, lng])) mapa.setView([lat, lng], Math.max(mapa.getZoom(), 15))
  }
}
