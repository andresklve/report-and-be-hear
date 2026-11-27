import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Verificacionservice } from '../../../services/verificacionservice';

// Se abre desde el link del correo: /verificar?token=...
@Component({
  selector: 'app-verificarcomponent',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    RouterLink
  ],
  templateUrl: './verificarcomponent.html',
  styleUrl: './verificarcomponent.css',
})
export class Verificarcomponent implements OnInit {
  token: string = ''
  // 'cargando' | 'ok' | 'error'
  estado: string = 'cargando'
  mensaje: string = ''
  username: string = ''
  reenvioForm: any
  mensajeReenvio: string = ''

  constructor(private vS: Verificacionservice,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.reenvioForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Recuperar el token desde la URL
    this.token = this.route.snapshot.queryParamMap.get('token') ?? ''
    if (!this.token) {
      this.estado = 'error'
      this.mensaje = 'El link de verificación no es válido.'
      return
    }
    this.confirmarCorreo()
  }

  confirmarCorreo(): void {
    this.vS.confirmar(this.token).subscribe({
      next: (data) => {
        this.estado = 'ok'
        this.mensaje = data.mensaje
        this.username = data.username
        this.cdr.detectChanges()
      },
      error: (error) => {
        this.estado = 'error'
        this.mensaje = error.status === 0
          ? 'No pudimos conectar con el servidor. Intenta de nuevo en un momento.'
          : (error.error?.message ?? 'No se pudo verificar la cuenta.')
        this.cdr.detectChanges()
      }
    })
  }

  reenviarCorreo(): void {
    if (this.reenvioForm.invalid) {
      this.mensajeReenvio = 'Escribe un correo válido.'
      return
    }
    this.vS.reenviar(this.reenvioForm.value.correo.trim().toLowerCase()).subscribe({
      next: (data) => {
        this.mensajeReenvio = data.mensaje
        this.cdr.detectChanges()
      },
      error: (error) => {
        this.mensajeReenvio = error.error?.message ?? 'No se pudo reenviar el correo.'
        this.cdr.detectChanges()
      }
    })
  }
}
