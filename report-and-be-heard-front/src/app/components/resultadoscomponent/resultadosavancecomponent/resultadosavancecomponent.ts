import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Resultadosservice } from '../../../services/resultadosservice';
import { Donacomponent } from '../../donacomponent/donacomponent';
import { Barrascomponent } from '../../barrascomponent/barrascomponent';

// /resultados/avance-de-atencion
@Component({
  selector: 'app-resultadosavancecomponent',
  imports: [MatCardModule, Donacomponent, Barrascomponent],
  templateUrl: './resultadosavancecomponent.html',
  styleUrl: './resultadosavancecomponent.css',
})
export class Resultadosavancecomponent {
  r = inject(Resultadosservice)
}
