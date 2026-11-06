import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  templateUrl: './logocomponent.html',
})
export class Logocomponent {
  size = input(30)
  claro = input(false)
}
