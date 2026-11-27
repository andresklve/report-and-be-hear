import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Verificacionservice } from '../../../services/verificacionservice';

// Olvide mi contraseña: se pide el correo y se envia un link para cambiarla
@Component({
  selector: 'app-recuperarcomponent',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './recuperarcomponent.html',
  styleUrl: './recuperarcomponent.css',
})
export class Recuperarcomponent {
  recuperarForm: any
  mensaje: string = ''
  enviando: boolean = false
  enviado: boolean = false

  constructor(private vS: Verificacionservice,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.recuperarForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  recuperarPassword(): void {
    if (this.recuperarForm.invalid) {
      this.recuperarForm.markAllAsTouched()
      this.mensaje = 'Escribe un correo válido.'
      return
    }
    this.mensaje = ''
    this.enviando = true
    this.vS.recuperar(this.recuperarForm.value.correo.trim().toLowerCase()).subscribe({
      next: (data) => {
        this.enviando = false
        this.enviado = true
        this.mensaje = data.mensaje
        this.cdr.detectChanges()
      },
      error: (error) => {
        this.enviando = false
        this.mensaje = error.status === 0
          ? 'No pudimos conectar con el servidor. Intenta de nuevo en un momento.'
          : (error.error?.message ?? 'No se pudo enviar el correo.')
        console.log(error)
        this.cdr.detectChanges()
      }
    })
  }
}
