import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { Resultadosservice } from '../../../services/resultadosservice';
import { colorCategoria, iconoCategoria, referencia } from '../../../shared/ui';

// /resultados/casos-resueltos (tarjetas con paginador)
@Component({
  selector: 'app-resultadoscasoscomponent',
  imports: [DatePipe, RouterLink, MatCardModule, MatIconModule, MatPaginatorModule, MatRippleModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatChipsModule],
  templateUrl: './resultadoscasoscomponent.html',
  styleUrl: './resultadoscasoscomponent.css',
})
export class Resultadoscasoscomponent {
  r = inject(Resultadosservice)
  colorCategoria = colorCategoria
  iconoCategoria = iconoCategoria
  referencia = referencia

  // Busqueda por texto, tipo de problema, lugar, nota o codigo RYA-
  texto = signal('')
  categoria = signal('')   // '' = todas

  // Tipos de problema con su cantidad de casos resueltos (para los filtros)
  categorias = computed(() => {
    const m = new Map<string, number>()
    this.r.resueltos().forEach(h => m.set(h.categoria, (m.get(h.categoria) ?? 0) + 1))
    return [...m.entries()].map(([nombre, n]) => ({ nombre, n })).sort((a, b) => b.n - a.n)
  })

  filtrados = computed(() => {
    const q = this.texto().trim().toLowerCase()
    const cat = this.categoria()
    return this.r.resueltos().filter(h =>
      (!cat || h.categoria === cat) &&
      (!q || `${h.t.descripcionTexto} ${h.categoria} ${h.lugar} ${h.m.motivo} ${referencia(h.t.idTestimonio)}`.toLowerCase().includes(q)))
  })

  pageIndex = signal(0)
  pageSize = signal(9)
  pagina = computed(() => {
    const ini = this.pageIndex() * this.pageSize()
    return this.filtrados().slice(ini, ini + this.pageSize())
  })

  constructor() {
    // Al cambiar de departamento se vuelve a la primera pagina
    effect(() => { this.r.departamento(); this.texto(); this.categoria(); this.pageIndex.set(0) })
  }

  cambiarPagina(e: PageEvent) {
    this.pageIndex.set(e.pageIndex)
    this.pageSize.set(e.pageSize)
  }
}
