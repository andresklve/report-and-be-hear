import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ZonaDTO } from '../../../models/ZonaDTO';
import { Zonaservice } from '../../../services/zonaservice';

@Component({
  selector: 'app-zonainsertcomponent',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './zonainsertcomponent.html',
  styleUrl: './zonainsertcomponent.css',
})
export class Zonainsertcomponent {
  zonaForm: any
  mensaje: string = ''

  constructor(private zS: Zonaservice, private fb: FormBuilder) {
    this.zonaForm = this.fb.group({
      nombre: ['', Validators.required],
      provincia: ['', Validators.required],
      departamento: ['', Validators.required],
      latitud: [0, Validators.required],
      longitud: [0, Validators.required]
    });
  }

  insertarZona(): void {
    if (this.zonaForm.invalid) {
      this.mensaje = 'Por favor, complete todos los campos correctamente!!'
      return
    }
    this.mensaje = ''
    const zona: ZonaDTO = {
      // El id va vacio para que la base de datos lo genere (con 0 Hibernate busca un registro existente)
      idZona: null as any,
      nombreZona: this.zonaForm.value.nombre,
      provinciaZona: this.zonaForm.value.provincia,
      departamentoZona: this.zonaForm.value.departamento,
      latitudZona: Number(this.zonaForm.value.latitud),
      longitudZona: Number(this.zonaForm.value.longitud),
    }

    this.zS.insert(zona).subscribe({
      next: (data) => {
        this.mensaje = 'Zona registrada correctamente!!'
        this.zonaForm.reset(
          {
            latitud: 0,
            longitud: 0
          }
        )
      },
      error: (error) => {
        this.mensaje = 'Error al registrar la zona!!'
        console.log(error)
      }
    })
  }
}
