import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ModeracionDTO } from '../../../models/ModeracionDTO';
import { Moderacionservice } from '../../../services/moderacionservice';
import { Testimonioservice } from '../../../services/testimonioservice';
import { ESTADOS, referencia } from '../../../shared/ui';

@Component({
  selector: 'app-moderacionupdatecomponent',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './moderacionupdatecomponent.html',
  styleUrl: './moderacionupdatecomponent.css',
})
export class Moderacionupdatecomponent implements OnInit {
  idModeracion: any = null
  formModeracion: any
  mensaje: string = ''
  moderacionActual: ModeracionDTO = new ModeracionDTO()
  esUltima: boolean = false
  // Las acciones posibles son los estados menos PENDIENTE
  acciones = ESTADOS.filter(e => e.key !== 'PENDIENTE')
  referencia = referencia

  constructor(
    private mS: Moderacionservice,
    private tS: Testimonioservice,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Recuperar ID desde la URL
    this.idModeracion = Number(this.route.snapshot.paramMap.get('id'));

    this.formModeracion = this.fb.group({
      codigo: [this.idModeracion],
      accion: ['EN_PROCESO', Validators.required],
      motivo: ['', [Validators.required, Validators.maxLength(255)]],
      costo: [0, Validators.min(0)]
    });

    if (!this.idModeracion || isNaN(this.idModeracion)) {
      this.mensaje = 'ID inválido';
      return;
    }

    this.buscarPorId();
  }

  buscarPorId(): void {
    this.mS.listId(this.idModeracion).subscribe({
      next: (data: ModeracionDTO) => {
        this.moderacionActual = data
        this.formModeracion.patchValue({
          codigo: data.idModeracion,
          accion: data.accion,
          motivo: data.motivo,
          costo: data.costo
        });
        this.verificarUltima()
        this.cdr.detectChanges()
      },
      error: (error) => {
        console.error('Error al buscar !!!', error);
        this.mensaje = 'No se encontró !!!';
        this.cdr.detectChanges()
      }
    });
  }

  // La moderacion mas reciente de un reporte define su estado actual
  verificarUltima(): void {
    this.mS.list().subscribe({
      next: data => {
        const ultima = data.filter(m => m.idTestimonio === this.moderacionActual.idTestimonio)
          .sort((a, b) => (b.fechaAccion ?? '').localeCompare(a.fechaAccion ?? ''))[0]
        this.esUltima = ultima?.idModeracion === this.moderacionActual.idModeracion
        this.cdr.detectChanges()
      }
    })
  }

  actualizarModeracion(): void {
    if (this.formModeracion.invalid) {
      this.mensaje = 'Por favor, complete todos los campos correctamente!!'
      return
    }
    const dto: ModeracionDTO = {
      idModeracion: this.formModeracion.value.codigo,
      idTestimonio: this.moderacionActual.idTestimonio,
      idUsuarioAdmin: this.moderacionActual.idUsuarioAdmin,
      accion: this.formModeracion.value.accion,
      motivo: this.formModeracion.value.motivo.trim(),
      costo: this.formModeracion.value.costo ?? null,
      fechaAccion: this.moderacionActual.fechaAccion
    };

    this.mS.update(dto).subscribe({
      next: () => {
        if (this.esUltima) {
          this.actualizarEstadoReporte(dto.idTestimonio, dto.accion)
        } else {
          this.mensaje = 'Actualizado correctamente!!';
          this.router.navigate(['/panel/moderaciones/listar']);
        }
      },
      error: (error) => {
        console.error(error);
        this.mensaje = 'Error al actualizar!!';
        this.cdr.detectChanges()
      }
    });
  }

  // Si es la ultima accion del reporte, el estado del reporte tambien cambia
  actualizarEstadoReporte(idTestimonio: number, estado: string): void {
    this.tS.listId(idTestimonio).subscribe({
      next: t => {
        if (t.estado === estado) {
          this.router.navigate(['/panel/moderaciones/listar']);
          return
        }
        this.tS.update(t.idTestimonio, { ...t, estado: estado }).subscribe({
          next: () => this.router.navigate(['/panel/moderaciones/listar']),
          error: (error) => {
            console.error(error);
            this.mensaje = 'La moderación se guardó, pero no se pudo cambiar el estado del reporte.';
            this.cdr.detectChanges()
          }
        })
      }
    })
  }
}
