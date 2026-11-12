import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logocomponent',
  templateUrl: './logocomponent.html',
  styleUrl: './logocomponent.css',
})
export class Logocomponent {
  size = input(30)
  claro = input(false)
}
