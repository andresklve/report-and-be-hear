import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Authservice } from '../../../services/authservice';

// Paso 1 de "olvide mi contrasena": pide el correo y el backend envia el enlace
@Component({
  selector: 'app-recuperarcomponent',
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './recuperarcomponent.html',
  styleUrl: '../logincomponent/logincomponent.css',
})
export class Recuperarcomponent {
  private auth = inject(Authservice)
  private fb = inject(FormBuilder)

  enviando = signal(false)
  enviado = signal('')
  // Sin Gmail configurado en el backend: token del enlace para poder probar desde aqui
  tokenDemo = signal('')
  error = signal('')

  form = this.fb.group({ correo: ['', [Validators.required, Validators.email]] })

  enviar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    this.enviando.set(true)
    this.error.set('')
    const correo = this.form.value.correo!
    this.auth.olvidePassword(correo).subscribe({
      next: r => {
        this.enviando.set(false)
        this.tokenDemo.set(r?.enlaceDemo ? new URL(r.enlaceDemo).searchParams.get('token') ?? '' : '')
        this.enviado.set(correo.trim().toLowerCase())
      },
      error: err => { this.enviando.set(false); this.error.set(Authservice.mensajeError(err)) },
    })
  }

  otraVez() {
    this.enviado.set('')
    this.tokenDemo.set('')
  }
}
