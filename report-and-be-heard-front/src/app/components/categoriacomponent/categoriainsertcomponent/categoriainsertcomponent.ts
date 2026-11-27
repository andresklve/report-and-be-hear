import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  selector: 'app-categoriainsertcomponent',
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
  templateUrl: './categoriainsertcomponent.html',
  styleUrl: './categoriainsertcomponent.css',
})
export class Categoriainsertcomponent {
  categoriaForm: any
  mensaje: string = ''

  constructor(private cS: Categoriaservice, private fb: FormBuilder) {
    this.categoriaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      estado: [true]
    });
  }

  insertarCategoria(): void {
    if (this.categoriaForm.invalid) {
      this.mensaje = 'Por favor, complete todos los campos correctamente!!'
      return
    }
    this.mensaje = ''
    const categoria: CategoriaDTO = {
      // El id va vacio para que la base de datos lo genere (con 0 Hibernate busca un registro existente)
      idCategoria: null as any,
      nombreCategoria: this.categoriaForm.value.nombre,
      descripcionCategoria: this.categoriaForm.value.descripcion,
      activo: this.categoriaForm.value.estado,
    }

    this.cS.insert(categoria).subscribe({
      next: (data) => {
        this.mensaje = 'Categoría registrada correctamente!!'
        this.categoriaForm.reset(
          {
            estado: true
          }
        )
      },
      error: (error) => {
        this.mensaje = 'Error al registrar la categoría!!'
        console.log(error)
      }
    })
  }
}
