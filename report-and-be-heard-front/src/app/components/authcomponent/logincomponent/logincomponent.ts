import { MatCardModule } from '@angular/material/card';
import { USERNAME_PATRON, USERNAME_AYUDA } from '../../../shared/ui';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Authservice } from '../../../services/authservice';
import { Toastservice } from '../../../services/toastservice';

@Component({
  selector: 'app-logincomponent',
  imports: [MatCardModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule],
  templateUrl: './logincomponent.html',
  styleUrl: './logincomponent.css',
})
export class Logincomponent {
  usernameAyuda = USERNAME_AYUDA
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
    username: ['', [Validators.required, Validators.pattern(USERNAME_PATRON)]],
    password: ['', Validators.required],
  })

  demo(username: string) {
    this.form.setValue({ username, password: 'Demo1234' })
  }

  ingresar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    this.cargando.set(true)
    this.error.set('')
    const { username, password } = this.form.value
    this.auth.login(username!, password!).subscribe({
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
