import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Authservice } from '../../../services/authservice';
import { Toastservice } from '../../../services/toastservice';

@Component({
  selector: 'app-logincomponent',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './logincomponent.html',
})
export class Logincomponent {
  private auth = inject(Authservice)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private toast = inject(Toastservice)
  private fb = inject(FormBuilder)

  cargando = signal(false)
  error = signal('')
  verPass = signal(false)
  volver = this.route.snapshot.queryParamMap.get('volver')

  form = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  })

  demo(correo: string) {
    this.form.setValue({ correo, password: 'Demo1234' })
  }

  ingresar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    this.cargando.set(true)
    this.error.set('')
    const { correo, password } = this.form.value
    this.auth.login(correo!, password!).subscribe({
      next: s => {
        this.toast.ok(`Hola de nuevo, ${s.nombres}`)
        this.router.navigateByUrl(this.volver ?? (this.auth.esEquipo() ? '/panel' : '/'))
      },
      error: err => {
        this.cargando.set(false)
        this.error.set(Authservice.mensajeError(err))
      }
    })
  }
}
