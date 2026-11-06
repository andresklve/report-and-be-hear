import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ZonaDTO } from '../../../models/ZonaDTO';
import { Zonaservice } from '../../../services/zonaservice';
import { Toastservice } from '../../../services/toastservice';

@Component({
  selector: 'app-zonalistcomponent',
  imports: [RouterLink],
  templateUrl: './zonalistcomponent.html',
})
export class Zonalistcomponent implements OnInit {
  private s = inject(Zonaservice)
  private toast = inject(Toastservice)

  dataSource = signal<ZonaDTO[]>([])
  cargando = signal(true)
  error = signal(false)
  texto = signal('')
  confirmando = signal<number | null>(null)

  filtrados = computed(() => {
    const q = this.texto().trim().toLowerCase()
    return q ? this.dataSource().filter(x => JSON.stringify(x).toLowerCase().includes(q)) : this.dataSource()
  })

  ngOnInit(): void {
    this.listar()
  }

  listar() {
    this.s.list().subscribe({
      next: data => { this.dataSource.set(data); this.cargando.set(false) },
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
        this.dataSource.update(l => l.filter(x => x.idZona !== id))
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
