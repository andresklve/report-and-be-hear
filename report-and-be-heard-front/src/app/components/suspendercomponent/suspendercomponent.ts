import { MatCardModule } from '@angular/material/card';
import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Suspensionservice } from '../../services/suspensionservice';
import { Authservice } from '../../services/authservice';
import { Toastservice } from '../../services/toastservice';
import { MOTIVOS_SUSPENSION, MotivoSuspension, SuspensionDTO } from '../../models/SuspensionDTO';

// Formulario corto para que la municipalidad o el administrador suspendan una cuenta
// (por un comentario ofensivo o un reporte falso). Se muestra dentro de la pagina.
@Component({
  selector: 'app-suspendercomponent',
  imports: [MatCardModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonToggleModule],
  templateUrl: './suspendercomponent.html',
  styleUrl: './suspendercomponent.css',
})
export class Suspendercomponent {
  private sS = inject(Suspensionservice)
  private auth = inject(Authservice)
  private toast = inject(Toastservice)

  idUsuario = input.required<number>()
  nombre = input<string>('')
  motivoInicial = input<MotivoSuspension>('COMENTARIO_OFENSIVO')
  detalleInicial = input<string>('')
  listo = output<SuspensionDTO>()
  cancelar = output<void>()

  motivos = MOTIVOS_SUSPENSION
  motivo = signal<MotivoSuspension>('COMENTARIO_OFENSIVO')
  detalle = signal('')
  dias = signal<number | null>(7)   // null = indefinida
  guardando = signal(false)

  ngOnInit() {
    this.motivo.set(this.motivoInicial())
    this.detalle.set(this.detalleInicial())
  }

  guardar() {
    const s = this.auth.sesion()
    if (!s) return
    this.guardando.set(true)
    this.sS.insert({
      idUsuario: this.idUsuario(), idUsuarioModerador: s.idUsuario,
      motivo: this.motivo(), detalle: this.detalle().trim(), dias: this.dias(),
    }).subscribe({
      next: r => {
        this.guardando.set(false)
        this.toast.ok(`Cuenta de ${this.nombre() || 'este usuario'} suspendida`)
        this.listo.emit(r)
      },
      error: err => {
        this.guardando.set(false)
        this.toast.error(err.error?.message ?? 'No se pudo suspender la cuenta')
      },
    })
  }
}
