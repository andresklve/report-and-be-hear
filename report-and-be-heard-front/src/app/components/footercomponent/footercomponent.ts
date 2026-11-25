import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Authservice } from '../../services/authservice';
import { Logocomponent } from '../logocomponent/logocomponent';

// Pie de pagina comun a toda la aplicacion
@Component({
  selector: 'app-footercomponent',
  imports: [RouterLink, MatIconModule, MatDividerModule, Logocomponent],
  templateUrl: './footercomponent.html',
  styleUrl: './footercomponent.css',
})
export class Footercomponent {
  auth = inject(Authservice)
  anio = new Date().getFullYear()
}
