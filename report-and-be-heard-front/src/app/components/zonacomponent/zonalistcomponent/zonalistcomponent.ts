import { Component, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ZonaDTO } from '../../../models/ZonaDTO';
import { Zonaservice } from '../../../services/zonaservice';
import { Toastservice } from '../../../services/toastservice';

@Component({
  selector: 'app-zonalistcomponent',
  imports: [RouterLink, MatTableModule, MatPaginatorModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule, MatProgressBarModule, MatSortModule],
  templateUrl: './zonalistcomponent.html',
  styleUrl: './zonalistcomponent.css',
})
export class Zonalistcomponent implements OnInit {
  private s = inject(Zonaservice)
  private toast = inject(Toastservice)

  lista = signal<ZonaDTO[]>([])
  cargando = signal(true)
  error = signal(false)
  texto = signal('')
  confirmando = signal<number | null>(null)

  // Tabla de Angular Material con paginador
  columnas = ['idZona', 'nombreZona', 'provinciaZona', 'departamentoZona', 'coordenadas', 'acciones']
  tabla = new MatTableDataSource<ZonaDTO>([])
  paginador = viewChild(MatPaginator)
  orden = viewChild(MatSort)

  filtrados = computed(() => {
    const q = this.texto().trim().toLowerCase()
    return q ? this.lista().filter(x => JSON.stringify(x).toLowerCase().includes(q)) : this.lista()
  })

  constructor() {
    effect(() => { this.tabla.data = this.filtrados() })
    effect(() => { this.tabla.paginator = this.paginador() ?? null })
    effect(() => { this.tabla.sort = this.orden() ?? null })
  }

  ngOnInit(): void {
    this.listar()
  }

  listar() {
    this.s.list().subscribe({
      next: data => { this.lista.set(data); this.cargando.set(false) },
      error: () => { this.error.set(true); this.cargando.set(false) },
    })
  }

  // Primer clic pide confirmacion, el segundo elimina
  eliminar(id: number) {
    if (this.confirmando() !== id) {
      this.confirmando.set(id)
      setTimeout(() => { if (this.confirmando() === id) this.confirmando.set(null) }, 3500)
      return
    }
    this.s.delete(id).subscribe({
      next: () => {
        this.lista.update(l => l.filter(x => x.idZona !== id))
        this.confirmando.set(null)
        this.toast.ok('Zona eliminada')
      },
      error: () => {
        this.confirmando.set(null)
        this.toast.error('No se puede eliminar: tiene registros relacionados.')
      },
    })
  }
}
