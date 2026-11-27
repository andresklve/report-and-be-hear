import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { RolDTO } from '../../../models/RolDTO';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Rolservice } from '../../../services/rolservice';
import { USERNAME_AYUDA, USERNAME_PATRON } from '../../../shared/ui';

// El backend registra siempre como CIUDADANO; si se elige otro rol se actualiza con PUT
@Component({
  selector: 'app-usuarioinsertcomponent',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatRadioModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './usuarioinsertcomponent.html',
  styleUrl: './usuarioinsertcomponent.css',
})
export class Usuarioinsertcomponent implements OnInit {
  usuarioForm: any
  mensaje: string = ''
  listaRoles: RolDTO[] = []
  usernameAyuda = USERNAME_AYUDA

  constructor(private uS: Usuarioservice, private fb: FormBuilder,
    private rS: Rolservice,
    private cdr: ChangeDetectorRef
  ) {
    this.usuarioForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      username: ['', [Validators.required, Validators.pattern(USERNAME_PATRON)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.listarRoles()
  }

  insertarUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.mensaje = 'Por favor, complete todos los campos correctamente!!'
      return
    }
    this.mensaje = ''
    const usuario: UsuarioDTO = {
      idUsuario: 0,
      nombres: this.usuarioForm.value.nombres.trim(),
      apellidos: this.usuarioForm.value.apellidos.trim(),
      username: this.usuarioForm.value.username.trim().toLowerCase(),
      passwordHash: this.usuarioForm.value.password,
      idRol: this.usuarioForm.value.rol,
      fechaRegistro: null,
      activo: true
    }

    this.uS.insert(usuario).subscribe({
      next: (data) => {
        if (data.idRol === usuario.idRol) {
          this.registrado()
          return
        }
        // Se creo como CIUDADANO: se le asigna el rol elegido
        this.uS.update({ ...data, idRol: usuario.idRol, passwordHash: usuario.passwordHash }).subscribe({
          next: () => this.registrado(),
          error: (error) => {
            this.mensaje = 'El usuario se creó, pero no se pudo asignar el rol.'
            console.log(error)
            this.cdr.detectChanges()
          }
        })
      },
      error: (error) => {
        this.mensaje = /ya está en uso|duplic|unique/i.test(error.error?.message ?? '')
          ? 'Ese nombre de usuario ya existe.' : 'Error al registrar el usuario!!'
        console.log(error)
        this.cdr.detectChanges()
      }
    })
  }

  registrado(): void {
    this.mensaje = 'Usuario registrado correctamente!!'
    this.usuarioForm.reset({ rol: this.idCiudadano() })
    this.cdr.detectChanges()
  }

  listarRoles(): void {
    this.rS.list().subscribe({
      next: data => {
        this.listaRoles = data
        this.usuarioForm.patchValue({ rol: this.idCiudadano() })
        this.cdr.detectChanges()
      }
    })
  }

  // Por defecto se marca el rol CIUDADANO
  idCiudadano(): number {
    return this.listaRoles.find(r => r.nombreRol === 'CIUDADANO')?.idRol ?? 0
  }
}
