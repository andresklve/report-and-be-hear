import { MatCardModule } from '@angular/material/card';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Authservice } from '../../services/authservice';

@Component({
  selector: 'app-panelcomponent',
  imports: [MatCardModule, RouterOutlet, RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './panelcomponent.html',
  styleUrl: './panelcomponent.css',
})
export class Panelcomponent {
  auth = inject(Authservice)
}
