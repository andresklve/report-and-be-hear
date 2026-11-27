import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RolDTO } from '../../../models/RolDTO';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Rolservice } from '../../../services/rolservice';
import { USERNAME_AYUDA, USERNAME_PATRON } from '../../../shared/ui';

@Component({
  selector: 'app-usuarioupdatecomponent',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatRadioModule,
    MatCheckboxModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './usuarioupdatecomponent.html',
  styleUrl: './usuarioupdatecomponent.css',
})
export class Usuarioupdatecomponent implements OnInit {
  idUsuario: any = null
  formUsuario: any
  mensaje: string = ''
  listaRoles: RolDTO[] = []
  usuarioActual: UsuarioDTO = new UsuarioDTO()
  usernameAyuda = USERNAME_AYUDA

  constructor(
    private uS: Usuarioservice,
    private rS: Rolservice,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Recuperar ID desde la URL
    this.idUsuario = Number(this.route.snapshot.paramMap.get('id'));

    this.formUsuario = this.fb.group({
      codigo: [this.idUsuario],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      username: ['', [Validators.required, Validators.pattern(USERNAME_PATRON)]],
      correo: ['', Validators.email],
      // La contraseña es opcional: vacía = se mantiene la actual
      password: ['', Validators.minLength(6)],
      rol: [0, Validators.required],
      estado: [true]
    });

    this.listarRoles()

    if (!this.idUsuario || isNaN(this.idUsuario)) {
      this.mensaje = 'ID inválido';
      return;
    }

    this.buscarPorId();
  }

  buscarPorId(): void {
    this.uS.listId(this.idUsuario).subscribe({
      next: (data: UsuarioDTO) => {
        this.usuarioActual = data
        this.formUsuario.patchValue({
          codigo: data.idUsuario,
          nombres: data.nombres,
          apellidos: data.apellidos,
          username: data.username,
          correo: data.correo,
          rol: data.idRol,
          estado: data.activo
        });
        this.cdr.detectChanges()
      },
      error: (error) => {
        console.error('Error al buscar !!!', error);
        this.mensaje = 'No se encontró !!!';
        this.cdr.detectChanges()
      }
    });
  }

  actualizarUsuario(): void {
    if (this.formUsuario.invalid) {
      this.mensaje = 'Por favor, complete todos los campos correctamente!!'
      return
    }
    const dto: UsuarioDTO = {
      idUsuario: this.formUsuario.value.codigo,
      nombres: this.formUsuario.value.nombres.trim(),
      apellidos: this.formUsuario.value.apellidos.trim(),
      username: this.formUsuario.value.username.trim().toLowerCase(),
      correo: this.formUsuario.value.correo?.trim() || null,
      // Sin contraseña nueva se reenvía el hash actual y el backend lo conserva
      passwordHash: this.formUsuario.value.password || this.usuarioActual.passwordHash,
      idRol: this.formUsuario.value.rol,
      fechaRegistro: this.usuarioActual.fechaRegistro,
      activo: this.formUsuario.value.estado
    };

    this.uS.update(dto).subscribe({
      next: () => {
        this.mensaje = 'Actualizado correctamente!!';
        this.router.navigate(['/panel/usuarios/listar']);
      },
      error: (error) => {
        console.error(error);
        this.mensaje = /ya está en uso|duplic|unique/i.test(error.error?.message ?? '')
          ? 'Ese nombre de usuario ya existe.' : (error.error?.message ?? 'Error al actualizar!!');
        this.cdr.detectChanges()
      }
    });
  }

  listarRoles(): void {
    this.rS.list().subscribe({
      next: data => {
        this.listaRoles = data
        this.cdr.detectChanges()
      }
    })
  }
}
