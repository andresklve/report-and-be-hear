import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolDTO } from '../../../models/RolDTO';
import { Rolservice } from '../../../services/rolservice';
import { Toastservice } from '../../../services/toastservice';

@Component({
  selector: 'app-rolinsertcomponent',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './rolinsertcomponent.html',
})
export class Rolinsertcomponent {
  private s = inject(Rolservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private fb = inject(FormBuilder)

  guardando = signal(false)
  error = signal('')

  form = this.fb.group({
    nombreRol: ['', [Validators.required]],
    descripcionRol: ['', []],
  })

  mal(c: string): boolean {
    const ctrl = this.form.get(c)
    return !!ctrl && ctrl.invalid && ctrl.touched
  }

  registrar(seguir = false) {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    const v = this.form.value
    const obj: RolDTO = {
      idRol: 0,
      nombreRol: v.nombreRol!,
      descripcionRol: v.descripcionRol!,
    }
    this.guardando.set(true)
    this.error.set('')
    this.s.insert(obj).subscribe({
      next: () => {
        this.guardando.set(false)
        this.toast.ok('Rol registrado correctamente')
        if (seguir) this.form.reset({ nombreRol: '', descripcionRol: '' })
        else this.router.navigate(['/panel/roles'])
      },
      error: err => {
        this.guardando.set(false)
        this.error.set(err.error?.message ?? 'No se pudo registrar')
      },
    })
  }
}
