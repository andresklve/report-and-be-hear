import { Component, OnInit, TemplateRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Rangofechascomponent } from '../rangofechascomponent/rangofechascomponent';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Datos, Datosservice } from '../../services/datosservice';
import { Testimonioservice } from '../../services/testimonioservice';
import { Moderacionservice } from '../../services/moderacionservice';
import { Authservice } from '../../services/authservice';
import { Toastservice } from '../../services/toastservice';
import { TestimonioDTO } from '../../models/TestimonioDTO';
import { Estadochipcomponent } from '../estadochipcomponent/estadochipcomponent';
import { ESTADOS, enRango, colorCategoria, estadoInfo, iconoCategoria, referencia } from '../../shared/ui';

// Bandeja de la municipalidad: atender = registrar moderacion + actualizar estado del testimonio
@Component({
  selector: 'app-bandejacomponent',
  imports: [RouterLink, DatePipe, Rangofechascomponent, ReactiveFormsModule, Estadochipcomponent, MatTableModule, MatPaginatorModule, MatTabsModule, MatCardModule,
    MatButtonModule, MatButtonToggleModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule,
    MatProgressBarModule, MatProgressSpinnerModule, MatDialogModule],
  templateUrl: './bandejacomponent.html',
  styleUrl: './bandejacomponent.css',
})
export class Bandejacomponent implements OnInit {
  private dS = inject(Datosservice)
  private tS = inject(Testimonioservice)
  private mS = inject(Moderacionservice)
  private auth = inject(Authservice)
  private toast = inject(Toastservice)
  private fb = inject(FormBuilder)
  private dialog = inject(MatDialog)

  datos = signal<Datos | null>(null)
  filtro = signal<string>('PENDIENTE')
  texto = signal('')
  abierto = signal<TestimonioDTO | null>(null)
  guardando = signal(false)
  confirmando = signal<number | null>(null)
  estados = ESTADOS
  estadoInfo = estadoInfo
  iconoCategoria = iconoCategoria
  colorCategoria = colorCategoria
  referencia = referencia

  // Tabla con paginador y dialogo de Angular Material
  columnas = ['ref', 'fecha', 'reporte', 'zona', 'estado', 'acciones']
  desde = signal<Date | null>(null)
  hasta = signal<Date | null>(null)
  tabla = new MatTableDataSource<TestimonioDTO>([])
  paginador = viewChild(MatPaginator)
  dialogoAtender = viewChild.required<TemplateRef<unknown>>('dialogoAtender')
  private dialogoRef?: MatDialogRef<unknown>

  form = this.fb.group({
    accion: ['EN_PROCESO', Validators.required],
    motivo: ['', [Validators.required, Validators.maxLength(255)]],
    costo: [null as number | null, Validators.min(0)],
  })

  conteo = computed(() => {
    const m = new Map<string, number>()
    this.datos()?.testimonios.forEach(t => m.set(t.estado, (m.get(t.estado) ?? 0) + 1))
    return m
  })

  lista = computed(() => {
    const d = this.datos()
    if (!d) return []
    const q = this.texto().trim().toLowerCase()
    return [...d.testimonios].sort((a, b) => b.idTestimonio - a.idTestimonio).filter(t =>
      (this.filtro() === 'TODOS' || t.estado === this.filtro()) &&
      enRango(t.fechaCreacion, this.desde(), this.hasta()) &&
      (!q || t.descripcionTexto.toLowerCase().includes(q) || referencia(t.idTestimonio).toLowerCase().includes(q)))
  })

  constructor() {
    effect(() => { this.tabla.data = this.lista() })
    effect(() => { this.tabla.paginator = this.paginador() ?? null })
  }

  ngOnInit(): void {
    this.cargar()
  }

  categoria(t: TestimonioDTO) {
    return this.datos()?.cat.get(t.idCategoria)?.nombreCategoria ?? ''
  }

  cargar() {
    this.dS.cargar().subscribe({ next: d => this.datos.set(d), error: () => this.toast.error('No se pudo cargar la bandeja') })
  }

  atender(t: TestimonioDTO) {
    this.abierto.set(t)
    this.dialogoRef = this.dialog.open(this.dialogoAtender(), { width: '520px', maxWidth: '95vw', autoFocus: 'textarea' })
    this.dialogoRef.afterClosed().subscribe(() => this.abierto.set(null))
    this.form.reset({ accion: t.estado === 'PENDIENTE' ? 'EN_PROCESO' : t.estado === 'EN_PROCESO' ? 'RESUELTO' : t.estado, motivo: '', costo: null })
  }

  guardar() {
    const t = this.abierto()
    const s = this.auth.sesion()
    if (!t || !s) return
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    const v = this.form.value
    this.guardando.set(true)
    this.mS.insert({
      idModeracion: 0, idTestimonio: t.idTestimonio, idUsuarioAdmin: s.idUsuario,
      accion: v.accion!, motivo: v.motivo!.trim(), costo: v.costo ?? null, fechaAccion: null,
    }).pipe(
      switchMap(() => this.tS.update(t.idTestimonio, { ...t, estado: v.accion! }))
    ).subscribe({
      next: () => {
        this.guardando.set(false)
        this.dialogoRef?.close()
        this.toast.ok(`${referencia(t.idTestimonio)} marcado como “${estadoInfo(v.accion).label}”`)
        this.cargar()
      },
      error: err => {
        this.guardando.set(false)
        this.toast.error('No se pudo guardar: ' + (err.error?.message ?? err.status))
      }
    })
  }

  eliminar(t: TestimonioDTO) {
    if (this.confirmando() !== t.idTestimonio) {
      this.confirmando.set(t.idTestimonio)
      setTimeout(() => this.confirmando.set(null), 3500)
      return
    }
    this.tS.delete(t.idTestimonio).subscribe({
      next: () => { this.toast.ok('Reporte eliminado'); this.confirmando.set(null); this.cargar() },
      error: err => this.toast.error(err.status === 500 || err.status === 409
        ? 'No se puede eliminar: tiene moderaciones registradas.' : 'No se pudo eliminar'),
    })
  }
}
