import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Verificacionservice } from '../../../services/verificacionservice';

// Se abre desde el link del correo: /restablecer?token=...
@Component({
  selector: 'app-restablecercomponent',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './restablecercomponent.html',
  styleUrl: './restablecercomponent.css',
})
export class Restablecercomponent implements OnInit {
  token: string = ''
  restablecerForm: any
  mensaje: string = ''
  enviando: boolean = false
  listo: boolean = false
  verPass: boolean = false
  username: string = ''

  constructor(private vS: Verificacionservice,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.restablecerForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Recuperar el token desde la URL
    this.token = this.route.snapshot.queryParamMap.get('token') ?? ''
    if (!this.token) {
      this.mensaje = 'El link para cambiar la contraseña no es válido.'
    }
  }

  restablecerPassword(): void {
    if (!this.token) {
      this.mensaje = 'El link para cambiar la contraseña no es válido.'
      return
    }
    if (this.restablecerForm.invalid) {
      this.restablecerForm.markAllAsTouched()
      this.mensaje = 'La contraseña debe tener al menos 6 caracteres.'
      return
    }
    if (this.restablecerForm.value.password !== this.restablecerForm.value.confirmar) {
      this.mensaje = 'Las contraseñas no coinciden.'
      return
    }
    this.mensaje = ''
    this.enviando = true
    this.vS.restablecer(this.token, this.restablecerForm.value.password).subscribe({
      next: (data) => {
        this.enviando = false
        this.listo = true
        this.mensaje = data.mensaje
        this.username = data.username
        this.cdr.detectChanges()
      },
      error: (error) => {
        this.enviando = false
        this.mensaje = error.status === 0
          ? 'No pudimos conectar con el servidor. Intenta de nuevo en un momento.'
          : (error.error?.message ?? 'No se pudo cambiar la contraseña.')
        console.log(error)
        this.cdr.detectChanges()
      }
    })
  }
}
