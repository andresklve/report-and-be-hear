import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { colorCategoria, iconoCategoria } from '../../../shared/ui';
import { CategoriaDTO } from '../../../models/CategoriaDTO';
import { Categoriaservice } from '../../../services/categoriaservice';

@Component({
  selector: 'app-categorialistcomponent',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    RouterLink
  ],
  templateUrl: './categorialistcomponent.html',
  styleUrl: './categorialistcomponent.css',
})
export class Categorialistcomponent implements OnInit {
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6']
  dataSource: MatTableDataSource<CategoriaDTO> = new MatTableDataSource()
  mensaje: string = ''
  iconoCategoria = iconoCategoria
  colorCategoria = colorCategoria

  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor(private cS: Categoriaservice,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.listarCategorias()
  }

  listarCategorias(): void {
    this.cS.list().subscribe({
      next: data => {
        this.dataSource = new MatTableDataSource(data)
        this.dataSource.paginator = this.paginator
        this.cdr.detectChanges()
      }, error: err => {
        console.log('Ocurrió un error al obtener los registros', err)
        this.mensaje = 'No se pudo conectar con el servidor.'
        this.cdr.detectChanges()
      }
    })
  }

  eliminarCategoria(id: number): void {
    this.cS.delete(id).subscribe({
      next: () => {
        this.mensaje = ''
        this.listarCategorias()
        this.cdr.detectChanges()
      }, error: err => {
        console.log('Ocurrió un error al eliminar el registro', err)
        this.mensaje = 'No se puede eliminar: la categoría tiene reportes relacionados.'
        this.cdr.detectChanges()
      }
    })
  }

  // Filtro de la tabla de Angular Material
  filtrar(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase()
  }
}
