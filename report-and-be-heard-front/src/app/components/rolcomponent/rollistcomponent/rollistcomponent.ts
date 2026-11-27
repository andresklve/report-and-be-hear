import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RolDTO } from '../../../models/RolDTO';
import { Rolservice } from '../../../services/rolservice';

@Component({
  selector: 'app-rollistcomponent',
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
  templateUrl: './rollistcomponent.html',
  styleUrl: './rollistcomponent.css',
})
export class Rollistcomponent implements OnInit {
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5']
  dataSource: MatTableDataSource<RolDTO> = new MatTableDataSource()
  mensaje: string = ''

  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor(private rS: Rolservice,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.listarRoles()
  }

  listarRoles(): void {
    this.rS.list().subscribe({
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

  eliminarRol(id: number): void {
    this.rS.delete(id).subscribe({
      next: () => {
        this.mensaje = ''
        this.listarRoles()
        this.cdr.detectChanges()
      }, error: err => {
        console.log('Ocurrió un error al eliminar el registro', err)
        this.mensaje = 'No se puede eliminar: el rol tiene usuarios relacionados.'
        this.cdr.detectChanges()
      }
    })
  }

  // Filtro de la tabla de Angular Material
  filtrar(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase()
  }
}
