import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolDTO } from '../../../models/RolDTO';
import { Rolservice } from '../../../services/rolservice';
import { Toastservice } from '../../../services/toastservice';

@Component({
  selector: 'app-rolinsertcomponent',
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './rolinsertcomponent.html',
  styleUrl: './rolinsertcomponent.css',
})
// Sirve para crear y para editar (ruta /panel/roles/ediciones/:id)
export class Rolinsertcomponent implements OnInit {
  private s = inject(Rolservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private fb = inject(FormBuilder)
  private route = inject(ActivatedRoute)

  id = Number(this.route.snapshot.paramMap.get('id') ?? 0)
  edicion = this.id > 0

  guardando = signal(false)
  error = signal('')

  form = this.fb.group({
    nombreRol: ['', [Validators.required]],
    descripcionRol: ['', []],
  })

  ngOnInit(): void {
    if (this.edicion) {
      this.s.listId(this.id).subscribe({
        next: x => this.form.patchValue(x as any),
        error: () => this.error.set('No se encontró el registro.'),
      })
    }
  }

  mal(c: string): boolean {
    const ctrl = this.form.get(c)
    return !!ctrl && ctrl.invalid && ctrl.touched
  }

  registrar(seguir = false) {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    const v = this.form.value
    const obj: RolDTO = {
      // Al crear, el id va vacio para que la base de datos lo genere (con 0 Hibernate busca un registro existente)
      idRol: this.edicion ? this.id : null as unknown as number,
      nombreRol: v.nombreRol!,
      descripcionRol: v.descripcionRol!,
    }
    this.guardando.set(true)
    this.error.set('')
    const peticion = this.edicion ? this.s.update(obj) : this.s.insert(obj)
    peticion.subscribe({
      next: () => {
        this.guardando.set(false)
        this.toast.ok(this.edicion ? 'Rol actualizado' : 'Rol registrado correctamente')
        if (seguir && !this.edicion) this.form.reset({ nombreRol: '', descripcionRol: '' })
        else this.router.navigate(['/panel/roles'])
      },
      error: err => {
        this.guardando.set(false)
        this.error.set(err.error?.message ?? 'No se pudo registrar')
      },
    })
  }
}
