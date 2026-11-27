import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Component, computed, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface Barra { label: string; valor: number; texto?: string; color?: string; }

// Grafico de barras horizontales reutilizable para los reportes.
// Cada barra puede traer su propio color (por ejemplo, el de su categoria).
@Component({
  selector: 'app-barrascomponent',
  imports: [MatProgressBarModule, MatTooltipModule],
  templateUrl: './barrascomponent.html',
  styleUrl: './barrascomponent.css',
})
export class Barrascomponent {
  items = input<Barra[]>([])
  color = input('var(--chart-ranking)')
  vacio = input('Sin datos todavía')
  tope = input<number | null>(null)   // escala fija (p. ej. 100 para porcentajes)
  max = computed(() => this.tope() ?? Math.max(1, ...this.items().map(i => i.valor)))
}
