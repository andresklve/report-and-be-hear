import { Component, computed, input } from '@angular/core';

export interface Barra { label: string; valor: number; texto?: string; }

// Grafico de barras horizontales reutilizable para los reportes
@Component({
  selector: 'app-barras',
  templateUrl: './barrascomponent.html',
})
export class Barrascomponent {
  items = input<Barra[]>([])
  tono = input<'signal' | 'ink' | 'ok'>('signal')
  vacio = input('Sin datos todavía')
  max = computed(() => Math.max(1, ...this.items().map(i => i.valor)))
}
