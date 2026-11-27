import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Verificacionservice } from '../../../services/verificacionservice';
import { Authservice } from '../../../services/authservice';
import { USERNAME_AYUDA, USERNAME_PATRON } from '../../../shared/ui';

// Registro publico con correo: la cuenta se activa al abrir el link que llega al correo
@Component({
  selector: 'app-registrocomponent',
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
  templateUrl: './registrocomponent.html',
  styleUrl: './registrocomponent.css',
})
export class Registrocomponent {
  registroForm: any
  mensaje: string = ''
  enviando: boolean = false
  verPass: boolean = false
  // Correo al que se envio el link (cuando ya se registro)
  correoEnviado: string = ''
  usernameAyuda = USERNAME_AYUDA
  volver: string | null = null

  constructor(private uS: Usuarioservice,
    private vS: Verificacionservice,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.volver = this.route.snapshot.queryParamMap.get('volver')
    this.registroForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.pattern(USERNAME_PATRON)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  registrarUsuario(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched()
      this.mensaje = 'Por favor, complete todos los campos correctamente!!'
      return
    }
    this.mensaje = ''
    this.enviando = true
    const usuario: UsuarioDTO = {
      idUsuario: 0,
      idRol: 0,
      nombres: this.registroForm.value.nombres.trim(),
      apellidos: this.registroForm.value.apellidos.trim(),
      username: this.registroForm.value.username.trim().toLowerCase(),
      correo: this.registroForm.value.correo.trim().toLowerCase(),
      passwordHash: this.registroForm.value.password,
      fechaRegistro: null,
      activo: false
    }

    this.uS.insert(usuario).subscribe({
      next: (data) => {
        this.enviando = false
        this.correoEnviado = data.correo ?? usuario.correo ?? ''
        this.cdr.detectChanges()
      },
      error: (error) => {
        this.enviando = false
        this.mensaje = Authservice.mensajeError(error)
        console.log(error)
        this.cdr.detectChanges()
      }
    })
  }

  reenviarCorreo(): void {
    this.vS.reenviar(this.correoEnviado).subscribe({
      next: (data) => {
        this.mensaje = data.mensaje
        this.cdr.detectChanges()
      },
      error: (error) => {
        this.mensaje = error.error?.message ?? 'No se pudo reenviar el correo.'
        this.cdr.detectChanges()
      }
    })
  }

  // Fuerza de la contraseña de 0 a 4
  fuerza(): number {
    const p: string = this.registroForm.value.password ?? ''
    let n = 0
    if (p.length >= 6) n++
    if (p.length >= 10) n++
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) n++
    if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) n++
    return n
  }

  fuerzaTxt(): string {
    return ['Muy corta', 'Aceptable', 'Buena', 'Fuerte', 'Excelente'][this.fuerza()]
  }
}
