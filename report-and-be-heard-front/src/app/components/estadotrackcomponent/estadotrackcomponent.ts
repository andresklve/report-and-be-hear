import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { estadoInfo } from '../../shared/ui';

// Seguimiento visual: Recibido -> En atencion -> Resuelto (o Descartado)
@Component({
  selector: 'app-estadotrackcomponent',
  imports: [MatChipsModule, MatStepperModule, MatIconModule],
  templateUrl: './estadotrackcomponent.html',
  styleUrl: './estadotrackcomponent.css',
})
export class Estadotrackcomponent {
  estado = input<string>('PENDIENTE')
  info = computed(() => estadoInfo(this.estado()))
  pasos = ['Recibido', 'En atención', 'Resuelto']
}
