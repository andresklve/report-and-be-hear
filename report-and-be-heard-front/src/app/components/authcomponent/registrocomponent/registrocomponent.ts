import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Authservice } from '../../../services/authservice';
import { USERNAME_AYUDA, USERNAME_PATRON } from '../../../shared/ui';

// Registro publico: el backend crea la cuenta como CIUDADANO y luego se inicia sesion
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
  usernameAyuda = USERNAME_AYUDA
  volver: string | null = null

  constructor(private aS: Authservice,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.volver = this.route.snapshot.queryParamMap.get('volver')
    this.registroForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
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
    const v = this.registroForm.value
    this.aS.registrar(v.nombres, v.apellidos, v.username, v.password).subscribe({
      next: () => {
        this.router.navigateByUrl(this.volver ?? '/reportar')
      },
      error: (error) => {
        this.enviando = false
        this.mensaje = Authservice.mensajeError(error)
        console.log(error)
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
