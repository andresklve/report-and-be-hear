import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Logocomponent } from '../logocomponent/logocomponent';

// Layout de pantalla dividida para ingreso y registro
@Component({
  selector: 'app-authcomponent',
  imports: [RouterOutlet, RouterLink, Logocomponent],
  templateUrl: './authcomponent.html',
})
export class Authcomponent {}
