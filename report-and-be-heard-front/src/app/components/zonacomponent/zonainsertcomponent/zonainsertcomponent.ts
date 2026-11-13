import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZonaDTO } from '../../../models/ZonaDTO';
import { Zonaservice } from '../../../services/zonaservice';
import { Toastservice } from '../../../services/toastservice';

@Component({
  selector: 'app-zonainsertcomponent',
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './zonainsertcomponent.html',
  styleUrl: './zonainsertcomponent.css',
})
// Sirve para crear y para editar (ruta /panel/zonas/ediciones/:id)
export class Zonainsertcomponent implements OnInit {
  private s = inject(Zonaservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private fb = inject(FormBuilder)
  private route = inject(ActivatedRoute)

  id = Number(this.route.snapshot.paramMap.get('id') ?? 0)
  edicion = this.id > 0

  guardando = signal(false)
  error = signal('')

  form = this.fb.group({
    nombreZona: ['', [Validators.required]],
    provinciaZona: ['', [Validators.required]],
    departamentoZona: ['', [Validators.required]],
    latitudZona: [null as number | null, [Validators.required]],
    longitudZona: [null as number | null, [Validators.required]],
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
    const obj: ZonaDTO = {
      // Al crear, el id va vacio para que la base de datos lo genere (con 0 Hibernate busca un registro existente)
      idZona: this.edicion ? this.id : null as unknown as number,
      nombreZona: v.nombreZona!,
      provinciaZona: v.provinciaZona!,
      departamentoZona: v.departamentoZona!,
      latitudZona: Number(v.latitudZona),
      longitudZona: Number(v.longitudZona),
    }
    this.guardando.set(true)
    this.error.set('')
    const peticion = this.edicion ? this.s.update(obj) : this.s.insert(obj)
    peticion.subscribe({
      next: () => {
        this.guardando.set(false)
        this.toast.ok(this.edicion ? 'Zona actualizada' : 'Zona registrada correctamente')
        if (seguir && !this.edicion) this.form.reset({ nombreZona: '', provinciaZona: '', departamentoZona: '', latitudZona: null, longitudZona: null })
        else this.router.navigate(['/panel/zonas'])
      },
      error: err => {
        this.guardando.set(false)
        this.error.set(err.error?.message ?? 'No se pudo registrar')
      },
    })
  }
}
