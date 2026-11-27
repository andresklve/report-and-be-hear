import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RolDTO } from '../../../models/RolDTO';
import { Rolservice } from '../../../services/rolservice';

@Component({
  selector: 'app-rolupdatecomponent',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './rolupdatecomponent.html',
  styleUrl: './rolupdatecomponent.css',
})
export class Rolupdatecomponent implements OnInit {
  idRol: any = null
  formRol: any
  mensaje: string = ''

  constructor(
    private rS: Rolservice,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Recuperar ID desde la URL
    this.idRol = Number(this.route.snapshot.paramMap.get('id'));

    this.formRol = this.fb.group({
      codigo: [this.idRol],
      nombre: ['', Validators.required],
      descripcion: ['']
    });

    if (!this.idRol || isNaN(this.idRol)) {
      this.mensaje = 'ID inválido';
      return;
    }

    this.buscarPorId();
  }

  buscarPorId(): void {
    this.rS.listId(this.idRol).subscribe({
      next: (data: RolDTO) => {
        this.formRol.patchValue({
          codigo: data.idRol,
          nombre: data.nombreRol,
          descripcion: data.descripcionRol
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

  actualizarRol(): void {
    if (this.formRol.invalid) {
      this.mensaje = 'Por favor, complete todos los campos correctamente!!'
      return
    }
    const dto: RolDTO = {
      idRol: this.formRol.value.codigo,
      nombreRol: this.formRol.value.nombre,
      descripcionRol: this.formRol.value.descripcion
    };

    this.rS.update(dto).subscribe({
      next: () => {
        this.mensaje = 'Actualizado correctamente!!';
        this.router.navigate(['/panel/roles/listar']);
      },
      error: (error) => {
        console.error(error);
        this.mensaje = 'Error al actualizar!!';
        this.cdr.detectChanges()
      }
    });
  }
}
