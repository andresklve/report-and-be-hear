import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbarcomponent } from './components/navbarcomponent/navbarcomponent';
import { Toastcomponent } from './components/toastcomponent/toastcomponent';

@Component({
  imports: [RouterOutlet, Navbarcomponent, Toastcomponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
