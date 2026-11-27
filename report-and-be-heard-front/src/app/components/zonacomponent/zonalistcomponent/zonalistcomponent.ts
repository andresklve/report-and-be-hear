import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ZonaDTO } from '../../../models/ZonaDTO';
import { Zonaservice } from '../../../services/zonaservice';

@Component({
  selector: 'app-zonalistcomponent',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink
  ],
  templateUrl: './zonalistcomponent.html',
  styleUrl: './zonalistcomponent.css',
})
export class Zonalistcomponent implements OnInit {
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7']
  dataSource: MatTableDataSource<ZonaDTO> = new MatTableDataSource()
  mensaje: string = ''

  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor(private zS: Zonaservice,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.listarZonas()
  }

  listarZonas(): void {
    this.zS.list().subscribe({
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

  eliminarZona(id: number): void {
    this.zS.delete(id).subscribe({
      next: () => {
        this.mensaje = ''
        this.listarZonas()
        this.cdr.detectChanges()
      }, error: err => {
        console.log('Ocurrió un error al eliminar el registro', err)
        this.mensaje = 'No se puede eliminar: la zona tiene reportes relacionados.'
        this.cdr.detectChanges()
      }
    })
  }

  // Filtro de la tabla de Angular Material
  filtrar(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase()
  }
}
