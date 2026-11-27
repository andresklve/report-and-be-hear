import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CategoriaDTO } from '../../../models/CategoriaDTO';
import { Categoriaservice } from '../../../services/categoriaservice';

@Component({
  selector: 'app-categoriaupdatecomponent',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './categoriaupdatecomponent.html',
  styleUrl: './categoriaupdatecomponent.css',
})
export class Categoriaupdatecomponent implements OnInit {
  idCategoria: any = null
  formCategoria: any
  mensaje: string = ''

  constructor(
    private cS: Categoriaservice,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Recuperar ID desde la URL
    this.idCategoria = Number(this.route.snapshot.paramMap.get('id'));

    this.formCategoria = this.fb.group({
      codigo: [this.idCategoria],
      nombre: ['', Validators.required],
      descripcion: [''],
      estado: [true]
    });

    if (!this.idCategoria || isNaN(this.idCategoria)) {
      this.mensaje = 'ID inválido';
      return;
    }

    this.buscarPorId();
  }

  buscarPorId(): void {
    this.cS.listId(this.idCategoria).subscribe({
      next: (data: CategoriaDTO) => {
        this.formCategoria.patchValue({
          codigo: data.idCategoria,
          nombre: data.nombreCategoria,
          descripcion: data.descripcionCategoria,
          estado: data.activo
        });
        this.cdr.detectChanges()
      },
      error: (error) => {
        console.error('Error al buscar !!!', error);
        this.mensaje = 'No se encontró !!!';
        this.cdr.detectChanges()
      }
    });
  }

  actualizarCategoria(): void {
    if (this.formCategoria.invalid) {
      this.mensaje = 'Por favor, complete todos los campos correctamente!!'
      return
    }
    const dto: CategoriaDTO = {
      idCategoria: this.formCategoria.value.codigo,
      nombreCategoria: this.formCategoria.value.nombre,
      descripcionCategoria: this.formCategoria.value.descripcion,
      activo: this.formCategoria.value.estado
    };

    this.cS.update(dto).subscribe({
      next: () => {
        this.mensaje = 'Actualizado correctamente!!';
        this.router.navigate(['/panel/categorias/listar']);
      },
      error: (error) => {
        console.error(error);
        this.mensaje = 'Error al actualizar!!';
        this.cdr.detectChanges()
      }
    });
  }
}
