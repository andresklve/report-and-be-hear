import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaDTO } from '../../../models/CategoriaDTO';
import { Categoriaservice } from '../../../services/categoriaservice';
import { Toastservice } from '../../../services/toastservice';

@Component({
  selector: 'app-categoriainsertcomponent',
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSlideToggleModule],
  templateUrl: './categoriainsertcomponent.html',
  styleUrl: './categoriainsertcomponent.css',
})
// Sirve para crear y para editar (ruta /panel/categorias/ediciones/:id)
export class Categoriainsertcomponent implements OnInit {
  private s = inject(Categoriaservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private fb = inject(FormBuilder)
  private route = inject(ActivatedRoute)

  id = Number(this.route.snapshot.paramMap.get('id') ?? 0)
  edicion = this.id > 0

  guardando = signal(false)
  error = signal('')

  form = this.fb.group({
    nombreCategoria: ['', [Validators.required]],
    descripcionCategoria: ['', []],
    activo: [true, []],
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
    const obj: CategoriaDTO = {
      // Al crear, el id va vacio para que la base de datos lo genere (con 0 Hibernate busca un registro existente)
      idCategoria: this.edicion ? this.id : null as unknown as number,
      nombreCategoria: v.nombreCategoria!,
      descripcionCategoria: v.descripcionCategoria!,
      activo: v.activo!,
    }
    this.guardando.set(true)
    this.error.set('')
    const peticion = this.edicion ? this.s.update(obj) : this.s.insert(obj)
    peticion.subscribe({
      next: () => {
        this.guardando.set(false)
        this.toast.ok(this.edicion ? 'Categoría actualizada' : 'Categoría registrada correctamente')
        if (seguir && !this.edicion) this.form.reset({ nombreCategoria: '', descripcionCategoria: '', activo: true })
        else this.router.navigate(['/panel/categorias'])
      },
      error: err => {
        this.guardando.set(false)
        this.error.set(err.error?.message ?? 'No se pudo registrar')
      },
    })
  }
}
