import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { of, switchMap } from 'rxjs';
import { RolDTO } from '../../../models/RolDTO';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Rolservice } from '../../../services/rolservice';
import { Toastservice } from '../../../services/toastservice';

// El backend registra siempre como CIUDADANO; si se elige otro rol se actualiza con PUT
@Component({
  selector: 'app-usuarioinsertcomponent',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './usuarioinsertcomponent.html',
})
export class Usuarioinsertcomponent implements OnInit {
  private uS = inject(Usuarioservice)
  private rS = inject(Rolservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  private fb = inject(FormBuilder)

  roles = signal<RolDTO[]>([])
  guardando = signal(false)
  error = signal('')

  form = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    passwordHash: ['', [Validators.required, Validators.minLength(6)]],
    idRol: [null as number | null, Validators.required],
  })

  ngOnInit(): void {
    this.rS.list().subscribe(r => {
      this.roles.set(r)
      const ciud = r.find(x => x.nombreRol === 'CIUDADANO')
      if (ciud) this.form.patchValue({ idRol: ciud.idRol })
    })
  }

  mal(c: string) {
    const ctrl = this.form.get(c)
    return !!ctrl && ctrl.invalid && ctrl.touched
  }

  registrar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    const v = this.form.value
    const nuevo: UsuarioDTO = {
      idUsuario: 0, idRol: v.idRol!, nombres: v.nombres!.trim(), apellidos: v.apellidos!.trim(),
      correo: v.correo!.trim().toLowerCase(), passwordHash: v.passwordHash!, fechaRegistro: null, activo: true,
    }
    this.guardando.set(true)
    this.error.set('')
    this.uS.insert(nuevo).pipe(
      switchMap(creado => creado.idRol === v.idRol ? of(creado)
        : this.uS.update({ ...creado, idRol: v.idRol!, passwordHash: v.passwordHash! }))
    ).subscribe({
      next: () => {
        this.toast.ok('Usuario creado')
        this.router.navigate(['/panel/usuarios'])
      },
      error: err => {
        this.guardando.set(false)
        this.error.set(/correo|duplic|unique/i.test(err.error?.message ?? '') ? 'Ese correo ya está registrado.' : (err.error?.message ?? 'No se pudo crear el usuario'))
      },
    })
  }
}
