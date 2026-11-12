import { Component, input } from '@angular/core';

// Logo de la app (imagen public/img/logo.png + nombre). Lo usan el menu, el login y el footer.
@Component({
  selector: 'app-logocomponent',
  templateUrl: './logocomponent.html',
  styleUrl: './logocomponent.css',
})
export class Logocomponent {
  size = input(30)
  claro = input(false)
}
