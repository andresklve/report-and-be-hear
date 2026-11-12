import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Resultadosservice } from '../../services/resultadosservice';

// Seccion publica "Resultados": encabezado comun + una pagina por tema (rutas hijas)
@Component({
  selector: 'app-resultadoscomponent',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule,
    MatTabsModule, MatProgressBarModule],
  providers: [Resultadosservice],
  templateUrl: './resultadoscomponent.html',
  styleUrl: './resultadoscomponent.css',
})
export class Resultadoscomponent implements OnInit {
  r = inject(Resultadosservice)

  paginas = [
    { ruta: '/resultados/tipos-de-problema', titulo: 'Tipos de problema', icono: 'category' },
    { ruta: '/resultados/avance-de-atencion', titulo: 'Avance de atención', icono: 'donut_large' },
    { ruta: '/resultados/inversion', titulo: 'Inversión', icono: 'payments' },
    { ruta: '/resultados/casos-resueltos', titulo: 'Casos resueltos', icono: 'task_alt' },
    { ruta: '/resultados/mas-apoyados', titulo: 'Más apoyados', icono: 'thumb_up' },
  ]

  ngOnInit(): void {
    this.r.cargar()
  }
}
