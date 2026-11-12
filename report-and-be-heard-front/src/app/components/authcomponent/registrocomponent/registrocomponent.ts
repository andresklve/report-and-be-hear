import { MatCardModule } from '@angular/material/card';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Authservice } from '../../../services/authservice';
import { Toastservice } from '../../../services/toastservice';

@Component({
  selector: 'app-registrocomponent',
  imports: [MatCardModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatProgressBarModule],
  templateUrl: './registrocomponent.html',
  styleUrl: './registrocomponent.css',
})
export class Registrocomponent {
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
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })

  private pass = toSignal(this.form.controls.password.valueChanges, { initialValue: '' })
  fuerza = computed(() => {
    const p = this.pass() ?? ''
    let n = 0
    if (p.length >= 6) n++
    if (p.length >= 10) n++
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) n++
    if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) n++
    return n
  })
  fuerzaTxt = computed(() => ['Muy corta', 'Aceptable', 'Buena', 'Fuerte', 'Excelente'][this.fuerza()])

  mal(c: 'nombres' | 'apellidos' | 'correo' | 'password') {
    const ctrl = this.form.controls[c]
    return ctrl.invalid && ctrl.touched
  }

  registrar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    this.cargando.set(true)
    this.error.set('')
    const v = this.form.value
    this.auth.registrar(v.nombres!, v.apellidos!, v.correo!, v.password!).subscribe({
      next: s => {
        this.toast.ok(`¡Bienvenida/o, ${s.nombres}! Tu cuenta está lista.`)
        this.router.navigateByUrl(this.volver ?? '/reportar')
      },
      error: err => {
        this.cargando.set(false)
        this.error.set(Authservice.mensajeError(err))
      }
    })
  }
}
