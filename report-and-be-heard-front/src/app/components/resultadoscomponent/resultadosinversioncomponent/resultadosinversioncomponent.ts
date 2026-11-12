import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Resultadosservice } from '../../../services/resultadosservice';
import { Columnascomponent } from '../../columnascomponent/columnascomponent';

// /resultados/inversion (porcentajes, sin montos)
@Component({
  selector: 'app-resultadosinversioncomponent',
  imports: [MatCardModule, MatButtonModule, Columnascomponent],
  templateUrl: './resultadosinversioncomponent.html',
  styleUrl: './resultadosinversioncomponent.css',
})
export class Resultadosinversioncomponent {
  r = inject(Resultadosservice)
}
