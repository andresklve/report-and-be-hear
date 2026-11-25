import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menucomponent } from './components/menucomponent/menucomponent';
import { Footercomponent } from './components/footercomponent/footercomponent';

@Component({
  imports: [RouterOutlet, Menucomponent, Footercomponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
}
