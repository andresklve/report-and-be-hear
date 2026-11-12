import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { Resultadosservice } from '../../../services/resultadosservice';
import { Estadochipcomponent } from '../../estadochipcomponent/estadochipcomponent';
import { colorCategoria, iconoCategoria, referencia } from '../../../shared/ui';

// /resultados/mas-apoyados: top de reportes con mas apoyos de la ciudadania
@Component({
  selector: 'app-resultadosapoyadoscomponent',
  imports: [MatProgressBarModule, RouterLink, MatCardModule, MatIconModule, MatRippleModule, Estadochipcomponent],
  templateUrl: './resultadosapoyadoscomponent.html',
  styleUrl: './resultadosapoyadoscomponent.css',
})
export class Resultadosapoyadoscomponent {
  r = inject(Resultadosservice)
  colorCategoria = colorCategoria
  iconoCategoria = iconoCategoria
  referencia = referencia

  top = computed(() => this.r.masApoyados().slice(0, 10))
  max = computed(() => this.top()[0]?.apoyos ?? 1)
}
