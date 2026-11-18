import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { TestimonioDTO } from '../models/TestimonioDTO';
import { CategoriaDTO } from '../models/CategoriaDTO';
import { ZonaDTO } from '../models/ZonaDTO';
import { Testimonioservice } from './testimonioservice';
import { Categoriaservice } from './categoriaservice';
import { Zonaservice } from './zonaservice';

export interface Datos {
  testimonios: TestimonioDTO[];
  categorias: CategoriaDTO[];
  zonas: ZonaDTO[];
  cat: Map<number, CategoriaDTO>;
  zona: Map<number, ZonaDTO>;
}

// Junta testimonios + categorias + zonas, que casi todas las vistas necesitan juntos
@Injectable({
  providedIn: 'root',
})
export class Datosservice {
  private tS = inject(Testimonioservice)
  private cS = inject(Categoriaservice)
  private zS = inject(Zonaservice)

  cargar(): Observable<Datos> {
    return forkJoin({ testimonios: this.tS.list(), categorias: this.cS.list(), zonas: this.zS.list() }).pipe(
      map(d => ({
        ...d,
        testimonios: [...d.testimonios].sort((a, b) => b.idTestimonio - a.idTestimonio),
        cat: new Map(d.categorias.map(c => [c.idCategoria, c])),
        zona: new Map(d.zonas.map(z => [z.idZona, z])),
      }))
    )
  }
}
