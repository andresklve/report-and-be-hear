import { Component, OnInit, TemplateRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of, switchMap } from 'rxjs';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Rangofechascomponent } from '../../rangofechascomponent/rangofechascomponent';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ModeracionDTO } from '../../../models/ModeracionDTO';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { TestimonioDTO } from '../../../models/TestimonioDTO';
import { Moderacionservice } from '../../../services/moderacionservice';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Testimonioservice } from '../../../services/testimonioservice';
import { Toastservice } from '../../../services/toastservice';
import { Estadochipcomponent } from '../../estadochipcomponent/estadochipcomponent';
import { ESTADOS, enRango, referencia, soles } from '../../../shared/ui';

@Component({
  selector: 'app-moderacionlistcomponent',
  imports: [RouterLink, DatePipe, ReactiveFormsModule, Estadochipcomponent, Rangofechascomponent, MatDialogModule, MatButtonToggleModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatTableModule, MatPaginatorModule, MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressBarModule],
  templateUrl: './moderacionlistcomponent.html',
  styleUrl: './moderacionlistcomponent.css',
})
export class Moderacionlistcomponent implements OnInit {
  private mS = inject(Moderacionservice)
  private uS = inject(Usuarioservice)
  private tS = inject(Testimonioservice)
  private toast = inject(Toastservice)
  private dialog = inject(MatDialog)
  private fb = inject(FormBuilder)

  moderaciones = signal<ModeracionDTO[]>([])
  usuarios = signal<Map<number, UsuarioDTO>>(new Map())
  testimonios = signal<Map<number, TestimonioDTO>>(new Map())
  cargando = signal(true)
  confirmando = signal<number | null>(null)
  referencia = referencia
  estados = ESTADOS

  // Filtros
  desde = signal<Date | null>(null)
  hasta = signal<Date | null>(null)
  accionFiltro = signal('TODAS')
  filtradas = computed(() => this.moderaciones().filter(m =>
    enRango(m.fechaAccion, this.desde(), this.hasta()) &&
    (this.accionFiltro() === 'TODAS' || m.accion === this.accionFiltro())))
  totalFiltrado = computed(() => soles(this.filtradas().reduce((s, m) => s + Number(m.costo ?? 0), 0)))

  // Edicion en un dialogo de Angular Material
  editando = signal<ModeracionDTO | null>(null)
  guardando = signal(false)
  dialogoEditar = viewChild.required<TemplateRef<unknown>>('dialogoEditar')
  private dialogoRef?: MatDialogRef<unknown>
  form = this.fb.group({
    accion: ['EN_PROCESO', Validators.required],
    motivo: ['', [Validators.required, Validators.maxLength(255)]],
    costo: [null as number | null, Validators.min(0)],
  })
  soles = soles

  columnas = ['fecha', 'reporte', 'accion', 'nota', 'costo', 'por', 'acciones']
  tabla = new MatTableDataSource<ModeracionDTO>([])
  paginador = viewChild(MatPaginator)

  total = computed(() => soles(this.moderaciones().reduce((s, m) => s + Number(m.costo ?? 0), 0)))

  constructor() {
    effect(() => { this.tabla.data = this.filtradas() })
    effect(() => { this.tabla.paginator = this.paginador() ?? null })
  }

  ngOnInit(): void {
    forkJoin({ m: this.mS.list(), u: this.uS.list(), t: this.tS.list() }).subscribe({
      next: ({ m, u, t }) => {
        this.moderaciones.set([...m].sort((a, b) => (b.fechaAccion ?? '').localeCompare(a.fechaAccion ?? '')))
        this.usuarios.set(new Map(u.map(x => [x.idUsuario, x])))
        this.testimonios.set(new Map(t.map(x => [x.idTestimonio, x])))
        this.cargando.set(false)
      },
      error: () => { this.cargando.set(false); this.toast.error('No se pudo cargar moderaciones') },
    })
  }

  // La moderacion mas reciente de un reporte define su estado actual
  esUltima(m: ModeracionDTO) {
    const ultima = this.moderaciones().filter(x => x.idTestimonio === m.idTestimonio)
      .sort((a, b) => (b.fechaAccion ?? '').localeCompare(a.fechaAccion ?? ''))[0]
    return ultima?.idModeracion === m.idModeracion
  }

  editar(m: ModeracionDTO) {
    this.editando.set(m)
    this.form.reset({ accion: m.accion, motivo: m.motivo ?? '', costo: m.costo })
    this.dialogoRef = this.dialog.open(this.dialogoEditar(), { width: '520px', maxWidth: '95vw' })
    this.dialogoRef.afterClosed().subscribe(() => this.editando.set(null))
  }

  guardar() {
    const m = this.editando()
    if (!m) return
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    const v = this.form.value
    const cambiada: ModeracionDTO = { ...m, accion: v.accion!, motivo: v.motivo!.trim(), costo: v.costo ?? null }
    const t = this.testimonios().get(m.idTestimonio)
    this.guardando.set(true)
    this.mS.update(cambiada).pipe(
      // Si es la ultima accion del reporte, el estado del reporte tambien cambia
      switchMap(r => this.esUltima(m) && t && t.estado !== cambiada.accion
        ? this.tS.update(t.idTestimonio, { ...t, estado: cambiada.accion }).pipe(switchMap(() => of(r)))
        : of(r))
    ).subscribe({
      next: r => {
        this.guardando.set(false)
        this.moderaciones.update(l => l.map(x => x.idModeracion === m.idModeracion ? { ...cambiada, fechaAccion: r?.fechaAccion ?? m.fechaAccion } : x))
        this.dialogoRef?.close()
        this.toast.ok('Moderación actualizada')
      },
      error: err => {
        this.guardando.set(false)
        this.toast.error('No se pudo guardar: ' + (err.error?.message ?? err.status))
      },
    })
  }

  eliminar(id: number) {
    if (this.confirmando() !== id) {
      this.confirmando.set(id)
      setTimeout(() => { if (this.confirmando() === id) this.confirmando.set(null) }, 3500)
      return
    }
    this.mS.delete(id).subscribe({
      next: () => { this.moderaciones.update(l => l.filter(x => x.idModeracion !== id)); this.toast.ok('Moderación eliminada') },
      error: () => this.toast.error('No se pudo eliminar'),
    })
  }
}
