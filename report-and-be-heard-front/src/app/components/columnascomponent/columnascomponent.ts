import { Component, computed, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Barra } from '../barrascomponent/barrascomponent';

// Grafico de columnas (barras verticales) con el valor encima de cada barra.
// Con muchas columnas, las etiquetas se escriben en vertical para que no se monten.
@Component({
  selector: 'app-columnascomponent',
  imports: [MatTooltipModule],
  templateUrl: './columnascomponent.html',
  styleUrl: './columnascomponent.css',
})
export class Columnascomponent {
  items = input<Barra[]>([])
  color = input('var(--chart-tendencia)')
  alto = input(240)                        // alto del area de barras en px
  vacio = input('Sin datos todavía')
  detalle = input<(b: Barra) => string>()  // texto del tooltip (opcional)

  max = computed(() => Math.max(1, ...this.items().map(i => i.valor)))
  muchas = computed(() => this.items().length > 8)

  tip(b: Barra) {
    const f = this.detalle()
    return f ? f(b) : `${b.label}: ${b.texto ?? b.valor}`
  }
}
