import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RolDTO } from '../../../models/RolDTO';
import { Rolservice } from '../../../services/rolservice';

@Component({
  selector: 'app-rolinsertcomponent',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './rolinsertcomponent.html',
  styleUrl: './rolinsertcomponent.css',
})
export class Rolinsertcomponent {
  rolForm: any
  mensaje: string = ''

  constructor(private rS: Rolservice, private fb: FormBuilder) {
    this.rolForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['']
    });
  }

  insertarRol(): void {
    if (this.rolForm.invalid) {
      this.mensaje = 'Por favor, complete todos los campos correctamente!!'
      return
    }
    this.mensaje = ''
    const rol: RolDTO = {
      // El id va vacio para que la base de datos lo genere (con 0 Hibernate busca un registro existente)
      idRol: null as any,
      nombreRol: this.rolForm.value.nombre,
      descripcionRol: this.rolForm.value.descripcion,
    }

    this.rS.insert(rol).subscribe({
      next: (data) => {
        this.mensaje = 'Rol registrado correctamente!!'
        this.rolForm.reset()
      },
      error: (error) => {
        this.mensaje = 'Error al registrar el rol!!'
        console.log(error)
      }
    })
  }
}
