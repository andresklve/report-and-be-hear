import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaDTO } from '../../../models/CategoriaDTO';
import { Categoriaservice } from '../../../services/categoriaservice';
import { Toastservice } from '../../../services/toastservice';

@Component({
  selector: 'app-categoriainsertcomponent',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './categoriainsertcomponent.html',
})
export class Categoriainsertcomponent {
  private s = inject(Categoriaservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private fb = inject(FormBuilder)

  guardando = signal(false)
  error = signal('')

  form = this.fb.group({
    nombreCategoria: ['', [Validators.required]],
    descripcionCategoria: ['', []],
    activo: [true, []],
  })

  mal(c: string): boolean {
    const ctrl = this.form.get(c)
    return !!ctrl && ctrl.invalid && ctrl.touched
  }

  registrar(seguir = false) {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    const v = this.form.value
    const obj: CategoriaDTO = {
      idCategoria: 0,
      nombreCategoria: v.nombreCategoria!,
      descripcionCategoria: v.descripcionCategoria!,
      activo: v.activo!,
    }
    this.guardando.set(true)
    this.error.set('')
    this.s.insert(obj).subscribe({
      next: () => {
        this.guardando.set(false)
        this.toast.ok('Categoría registrada correctamente')
        if (seguir) this.form.reset({ nombreCategoria: '', descripcionCategoria: '', activo: true })
        else this.router.navigate(['/panel/categorias'])
      },
      error: err => {
        this.guardando.set(false)
        this.error.set(err.error?.message ?? 'No se pudo registrar')
      },
    })
  }
}
