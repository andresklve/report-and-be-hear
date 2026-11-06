import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZonaDTO } from '../../../models/ZonaDTO';
import { Zonaservice } from '../../../services/zonaservice';
import { Toastservice } from '../../../services/toastservice';

@Component({
  selector: 'app-zonainsertcomponent',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './zonainsertcomponent.html',
})
export class Zonainsertcomponent {
  private s = inject(Zonaservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private fb = inject(FormBuilder)

  guardando = signal(false)
  error = signal('')

  form = this.fb.group({
    nombreZona: ['', [Validators.required]],
    provinciaZona: ['', [Validators.required]],
    departamentoZona: ['', [Validators.required]],
    latitudZona: [null as number | null, [Validators.required]],
    longitudZona: [null as number | null, [Validators.required]],
  })

  mal(c: string): boolean {
    const ctrl = this.form.get(c)
    return !!ctrl && ctrl.invalid && ctrl.touched
  }

  registrar(seguir = false) {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    const v = this.form.value
    const obj: ZonaDTO = {
      idZona: 0,
      nombreZona: v.nombreZona!,
      provinciaZona: v.provinciaZona!,
      departamentoZona: v.departamentoZona!,
      latitudZona: Number(v.latitudZona),
      longitudZona: Number(v.longitudZona),
    }
    this.guardando.set(true)
    this.error.set('')
    this.s.insert(obj).subscribe({
      next: () => {
        this.guardando.set(false)
        this.toast.ok('Zona registrada correctamente')
        if (seguir) this.form.reset({ nombreZona: '', provinciaZona: '', departamentoZona: '', latitudZona: null, longitudZona: null })
        else this.router.navigate(['/panel/zonas'])
      },
      error: err => {
        this.guardando.set(false)
        this.error.set(err.error?.message ?? 'No se pudo registrar')
      },
    })
  }
}
