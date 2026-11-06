import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';
import { Datos, Datosservice } from '../../services/datosservice';
import { Testimonioservice } from '../../services/testimonioservice';
import { Moderacionservice } from '../../services/moderacionservice';
import { Authservice } from '../../services/authservice';
import { Toastservice } from '../../services/toastservice';
import { TestimonioDTO } from '../../models/TestimonioDTO';
import { ESTADOS, estadoInfo, iconoCategoria, referencia } from '../../shared/ui';

// Bandeja de la municipalidad: atender = registrar moderacion + actualizar estado del testimonio
@Component({
  selector: 'app-bandejacomponent',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './bandejacomponent.html',
})
export class Bandejacomponent implements OnInit {
  private dS = inject(Datosservice)
  private tS = inject(Testimonioservice)
  private mS = inject(Moderacionservice)
  private auth = inject(Authservice)
  private toast = inject(Toastservice)
  private fb = inject(FormBuilder)

  datos = signal<Datos | null>(null)
  filtro = signal<string>('PENDIENTE')
  texto = signal('')
  abierto = signal<TestimonioDTO | null>(null)
  guardando = signal(false)
  confirmando = signal<number | null>(null)
  estados = ESTADOS
  estadoInfo = estadoInfo
  iconoCategoria = iconoCategoria
  referencia = referencia

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
    return d.testimonios.filter(t =>
      (this.filtro() === 'TODOS' || t.estado === this.filtro()) &&
      (!q || t.descripcionTexto.toLowerCase().includes(q) || referencia(t.idTestimonio).toLowerCase().includes(q)))
  })

  ngOnInit(): void {
    this.cargar()
  }

  cargar() {
    this.dS.cargar().subscribe({ next: d => this.datos.set(d), error: () => this.toast.error('No se pudo cargar la bandeja') })
  }

  atender(t: TestimonioDTO) {
    this.abierto.set(t)
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
        this.abierto.set(null)
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
