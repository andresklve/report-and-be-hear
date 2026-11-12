import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export interface Porcion { label: string; valor: number; color: string; texto?: string; }

// Grafico circular (dona) en SVG para ver como se reparte un total.
// Al pasar el mouse por un segmento o por la leyenda, el centro muestra ese dato.
@Component({
  selector: 'app-donacomponent',
  imports: [DecimalPipe],
  templateUrl: './donacomponent.html',
  styleUrl: './donacomponent.css',
})
export class Donacomponent {
  items = input<Porcion[]>([])
  centroValor = input('')         // lo que se ve en el centro sin hover (p. ej. el total)
  centroEtiqueta = input('total')
  vacio = input('Sin datos todavía')

  activo = signal<number | null>(null)

  // Geometria: circunferencia de radio 70 (viewBox 200x200), grosor 24
  readonly r = 70
  readonly c = 2 * Math.PI * 70
  private readonly gap = 2.5   // separacion entre segmentos

  total = computed(() => this.items().reduce((s, i) => s + i.valor, 0))

  segmentos = computed(() => {
    const total = this.total() || 1
    let acumulado = 0
    return this.items().map((it, i) => {
      const largo = (it.valor / total) * this.c
      const seg = {
        ...it, i,
        pct: (it.valor / total) * 100,
        dash: `${Math.max(largo - this.gap, 0.5)} ${this.c}`,
        offset: -acumulado,
      }
      acumulado += largo
      return seg
    })
  })

  centro = computed(() => {
    const a = this.activo()
    if (a === null) return { valor: this.centroValor(), etiqueta: this.centroEtiqueta(), pct: null as number | null }
    const s = this.segmentos()[a]
    return { valor: s.texto ?? s.valor.toLocaleString('es-PE'), etiqueta: s.label, pct: s.pct }
  })
}
