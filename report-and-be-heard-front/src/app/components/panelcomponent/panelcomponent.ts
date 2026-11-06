import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Authservice } from '../../services/authservice';

@Component({
  selector: 'app-panelcomponent',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './panelcomponent.html',
})
export class Panelcomponent {
  auth = inject(Authservice)
}
