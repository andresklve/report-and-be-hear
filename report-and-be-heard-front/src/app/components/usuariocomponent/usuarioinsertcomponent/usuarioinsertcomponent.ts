import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { RolDTO } from '../../../models/RolDTO';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Rolservice } from '../../../services/rolservice';
import { Toastservice } from '../../../services/toastservice';

// Crear o editar usuario (ruta /panel/usuarios/insertar o /panel/usuarios/ediciones/:id).
// El backend registra siempre como CIUDADANO; si se elige otro rol se actualiza con PUT.
@Component({
  selector: 'app-usuarioinsertcomponent',
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatRadioModule, MatSlideToggleModule],
  templateUrl: './usuarioinsertcomponent.html',
  styleUrl: './usuarioinsertcomponent.css',
})
export class Usuarioinsertcomponent implements OnInit {
  private uS = inject(Usuarioservice)
  private rS = inject(Rolservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private fb = inject(FormBuilder)

  roles = signal<RolDTO[]>([])
  guardando = signal(false)
  error = signal('')
  id = Number(this.route.snapshot.paramMap.get('id') ?? 0)
  edicion = this.id > 0
  private original: UsuarioDTO | null = null

  form = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    // Al editar, la contraseña es opcional: vacía = se mantiene la actual
    passwordHash: ['', this.edicion ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)]],
    idRol: [null as number | null, Validators.required],
    activo: [true],
  })

  ngOnInit(): void {
    this.rS.list().subscribe(r => {
      this.roles.set(r)
      const ciud = r.find(x => x.nombreRol === 'CIUDADANO')
      if (ciud && !this.edicion) this.form.patchValue({ idRol: ciud.idRol })
    })
    if (this.edicion) {
      this.uS.listId(this.id).subscribe({
        next: u => {
          this.original = u
          this.form.patchValue({ nombres: u.nombres, apellidos: u.apellidos, correo: u.correo, idRol: u.idRol, activo: u.activo, passwordHash: '' })
        },
        error: () => this.error.set('No se encontró el usuario.'),
      })
    }
  }

  registrar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    const v = this.form.value
    const datos = {
      nombres: v.nombres!.trim(), apellidos: v.apellidos!.trim(), correo: v.correo!.trim().toLowerCase(),
      idRol: v.idRol!, activo: v.activo ?? true,
    }
    let peticion: Observable<UsuarioDTO>
    if (this.edicion) {
      // Sin contraseña nueva se reenvía el hash actual y el backend lo conserva
      peticion = this.uS.update({ ...this.original!, ...datos, passwordHash: v.passwordHash || this.original!.passwordHash })
    } else {
      const nuevo: UsuarioDTO = { idUsuario: 0, ...datos, passwordHash: v.passwordHash!, fechaRegistro: null }
      peticion = this.uS.insert(nuevo).pipe(
        switchMap(creado => creado.idRol === v.idRol ? of(creado)
          : this.uS.update({ ...creado, idRol: v.idRol!, passwordHash: v.passwordHash! })))
    }
    this.guardando.set(true)
    this.error.set('')
    peticion.subscribe({
      next: () => {
        this.toast.ok(this.edicion ? 'Usuario actualizado' : 'Usuario creado')
        this.router.navigate(['/panel/usuarios'])
      },
      error: err => {
        this.guardando.set(false)
        this.error.set(/correo|duplic|unique/i.test(err.error?.message ?? '') ? 'Ese correo ya está registrado.' : (err.error?.message ?? 'No se pudo guardar el usuario'))
      },
    })
  }
}
