import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ZonaDTO } from '../../../models/ZonaDTO';
import { Zonaservice } from '../../../services/zonaservice';

@Component({
  selector: 'app-zonaupdatecomponent',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './zonaupdatecomponent.html',
  styleUrl: './zonaupdatecomponent.css',
})
export class Zonaupdatecomponent implements OnInit {
  idZona: any = null
  formZona: any
  mensaje: string = ''

  constructor(
    private zS: Zonaservice,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Recuperar ID desde la URL
    this.idZona = Number(this.route.snapshot.paramMap.get('id'));

    this.formZona = this.fb.group({
      codigo: [this.idZona],
      nombre: ['', Validators.required],
      provincia: ['', Validators.required],
      departamento: ['', Validators.required],
      latitud: [0, Validators.required],
      longitud: [0, Validators.required]
    });

    if (!this.idZona || isNaN(this.idZona)) {
      this.mensaje = 'ID inválido';
      return;
    }

    this.buscarPorId();
  }

  buscarPorId(): void {
    this.zS.listId(this.idZona).subscribe({
      next: (data: ZonaDTO) => {
        this.formZona.patchValue({
          codigo: data.idZona,
          nombre: data.nombreZona,
          provincia: data.provinciaZona,
          departamento: data.departamentoZona,
          latitud: data.latitudZona,
          longitud: data.longitudZona
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

  actualizarZona(): void {
    if (this.formZona.invalid) {
      this.mensaje = 'Por favor, complete todos los campos correctamente!!'
      return
    }
    const dto: ZonaDTO = {
      idZona: this.formZona.value.codigo,
      nombreZona: this.formZona.value.nombre,
      provinciaZona: this.formZona.value.provincia,
      departamentoZona: this.formZona.value.departamento,
      latitudZona: Number(this.formZona.value.latitud),
      longitudZona: Number(this.formZona.value.longitud)
    };

    this.zS.update(dto).subscribe({
      next: () => {
        this.mensaje = 'Actualizado correctamente!!';
        this.router.navigate(['/panel/zonas/listar']);
      },
      error: (error) => {
        console.error(error);
        this.mensaje = 'Error al actualizar!!';
        this.cdr.detectChanges()
      }
    });
  }
}
