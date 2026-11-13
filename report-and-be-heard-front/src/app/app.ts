import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { Menucomponent } from './components/menucomponent/menucomponent';
import { Footercomponent } from './components/footercomponent/footercomponent';

@Component({
  imports: [RouterOutlet, Menucomponent, Footercomponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  constructor() {
    // Todos los <mat-icon> usan la fuente Material Symbols Rounded (cargada en index.html)
    inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-rounded')
  }
}
