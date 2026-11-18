import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Resultadosservice } from '../../../services/resultadosservice';
import { Columnascomponent } from '../../columnascomponent/columnascomponent';

// /resultados/tipos-de-problema
@Component({
  selector: 'app-resultadostiposcomponent',
  imports: [MatCardModule, Columnascomponent],
  templateUrl: './resultadostiposcomponent.html',
  styleUrl: './resultadostiposcomponent.css',
})
export class Resultadostiposcomponent {
  r = inject(Resultadosservice)
}
