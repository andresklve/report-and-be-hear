import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Authservice } from '../../../services/authservice';
import { Toastservice } from '../../../services/toastservice';

const coinciden = (g: AbstractControl): ValidationErrors | null =>
  g.get('password')?.value === g.get('confirmar')?.value ? null : { distintas: true }

// Paso 2 de "olvide mi contrasena": llega desde el enlace del correo (/restablecer?token=...)
@Component({
  selector: 'app-restablecercomponent',
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './restablecercomponent.html',
  styleUrl: '../logincomponent/logincomponent.css',
})
export class Restablecercomponent {
  private auth = inject(Authservice)
  private router = inject(Router)
  private toast = inject(Toastservice)
  private fb = inject(FormBuilder)

  token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? ''
  guardando = signal(false)
  error = signal('')
  verPass = signal(false)

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    confirmar: ['', Validators.required],
  }, { validators: coinciden })

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    this.guardando.set(true)
    this.error.set('')
    this.auth.restablecerPassword(this.token, this.form.value.password!).subscribe({
      next: () => {
        this.auth.logout()
        this.toast.ok('Contraseña actualizada. Ya puedes ingresar.')
        this.router.navigate(['/ingresar'])
      },
      error: err => { this.guardando.set(false); this.error.set(Authservice.mensajeError(err)) },
    })
  }
}
