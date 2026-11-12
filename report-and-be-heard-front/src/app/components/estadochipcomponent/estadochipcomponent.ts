import { Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { estadoInfo } from '../../shared/ui';

// Etiqueta de estado de un reclamo (mat-chip con el color del estado)
@Component({
  selector: 'app-estadochipcomponent',
  imports: [MatChipsModule],
  templateUrl: './estadochipcomponent.html',
  styleUrl: './estadochipcomponent.css',
})
export class Estadochipcomponent {
  estado = input<string>('PENDIENTE')
  info = computed(() => estadoInfo(this.estado()))
}
