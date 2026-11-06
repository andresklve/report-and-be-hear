import { Component, computed, input } from '@angular/core';
import { estadoInfo } from '../../shared/ui';

// Seguimiento visual: Recibido -> En atencion -> Resuelto (o Descartado)
@Component({
  selector: 'app-estado-track',
  templateUrl: './estadotrackcomponent.html',
})
export class Estadotrackcomponent {
  estado = input<string>('PENDIENTE')
  compacto = input(false)
  info = computed(() => estadoInfo(this.estado()))
  pasos = ['Recibido', 'En atención', 'Resuelto']
}
