import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { Datos, Datosservice } from '../../services/datosservice';
import { Reporteservice } from '../../services/reporteservice';
import { colorCategoria, duracion, iconoCategoria } from '../../shared/ui';

// Pagina de inicio: presentacion con la Plaza de Armas de Lima y el mapa del Peru,
// y preguntas frecuentes
@Component({
  selector: 'app-homecomponent',
  imports: [MatChipsModule, MatCardModule, RouterLink, MatButtonModule, MatIconModule, MatExpansionModule],
  templateUrl: './homecomponent.html',
  styleUrl: './homecomponent.css',
})
export class Homecomponent implements OnInit {
  private dS = inject(Datosservice)
  private rS = inject(Reporteservice)
  iconoCategoria = iconoCategoria
  colorCategoria = colorCategoria

  datos = signal<Datos | null>(null)
  tiempo = signal('')

  ngOnInit(): void {
    this.dS.cargar().subscribe({ next: d => this.datos.set(d), error: () => {} })
    this.rS.tiempoAtencion().subscribe({ next: t => this.tiempo.set(t?.diasPromedio != null ? duracion(t.diasPromedio) : ''), error: () => {} })
  }
}
