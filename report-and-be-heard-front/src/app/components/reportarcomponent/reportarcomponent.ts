import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of, switchMap, map } from 'rxjs';
import { Datos, Datosservice } from '../../services/datosservice';
import { Testimonioservice } from '../../services/testimonioservice';
import { Zonaservice } from '../../services/zonaservice';
import { Authservice } from '../../services/authservice';
import { Toastservice } from '../../services/toastservice';
import { Geoservice } from '../../services/geoservice';
import { TestimonioDTO } from '../../models/TestimonioDTO';
import { SesionDTO } from '../../models/SesionDTO';
import { GeoIndice, GeoProps } from '../../models/GeoDTO';
import { Mapapickercomponent } from '../mapapickercomponent/mapapickercomponent';
import { Estadotrackcomponent } from '../estadotrackcomponent/estadotrackcomponent';
import { iconoCategoria, referencia } from '../../shared/ui';

const BORRADOR = 'rbh.borrador';

@Component({
  selector: 'app-reportarcomponent',
  imports: [RouterLink, ReactiveFormsModule, Mapapickercomponent, Estadotrackcomponent],
  templateUrl: './reportarcomponent.html',
})
export class Reportarcomponent implements OnInit {
  private dS = inject(Datosservice)
  private tS = inject(Testimonioservice)
  private zS = inject(Zonaservice)
  private geo = inject(Geoservice)
  private toast = inject(Toastservice)
  private route = inject(ActivatedRoute)
  private browser = isPlatformBrowser(inject(PLATFORM_ID))
  auth = inject(Authservice)
  iconoCategoria = iconoCategoria

  datos = signal<Datos | null>(null)
  paso = signal(1)
  enviando = signal(false)
  creado = signal<TestimonioDTO | null>(null)
  modoCuenta = signal<'registro' | 'ingreso'>('registro')
  errorCuenta = signal('')
  verPass = signal(false)

  // Ubicacion
  distrito = signal<GeoProps | null>(null)
  ubicando = signal(false)
  fueraDePeru = signal(false)
  busca = signal('')
  resultados = signal<GeoIndice[]>([])
  encuadre = signal<[number, number, number, number] | null>(null)
  private indice: GeoIndice[] = []

  pasos = ['Qué pasa', 'Dónde', 'Enviar']

  private fb = inject(FormBuilder)
  form: FormGroup = this.fb.group({
    idCategoria: [null as number | null, Validators.required],
    descripcionTexto: ['', [Validators.required, Validators.minLength(15), Validators.maxLength(5000)]],
    idZona: [null as number | null],
    direccionTextoExtraida: ['', Validators.maxLength(255)],
    fotoUrl: ['', Validators.pattern(/^$|^https?:\/\/.+/i)],
    latitud: [null as number | null, [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitud: [null as number | null, [Validators.required, Validators.min(-180), Validators.max(180)]],
  })
  cuenta: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })

  valor = toSignal(this.cambios(), { initialValue: {} as any })
  catSel = computed(() => this.datos()?.cat.get(this.valor().idCategoria) ?? null)
  largo = computed(() => (this.valor().descripcionTexto ?? '').length)

  ngOnInit(): void {
    this.restaurar()
    this.dS.cargar().subscribe({
      next: d => this.datos.set(d),
      error: () => this.toast.error('No pudimos cargar las categorías. ¿El servidor está encendido?'),
    })
    this.geo.indice().subscribe(i => this.indice = i)
    this.form.valueChanges.subscribe(v => this.guardarBorrador(v))

    // Viene desde el mapa con un distrito elegido
    const q = this.route.snapshot.queryParamMap
    const lat = Number(q.get('lat')), lng = Number(q.get('lng'))
    if (q.get('lat') && isFinite(lat) && isFinite(lng)) this.marcar({ lat, lng })
    else if (this.form.value.latitud != null) this.marcar({ lat: this.form.value.latitud, lng: this.form.value.longitud })
  }

  private cambios(): Observable<any> {
    return new Observable(sub => {
      sub.next(this.form.value)
      const s = this.form.valueChanges.subscribe(v => sub.next(v))
      return () => s.unsubscribe()
    })
  }

  elegirCategoria(id: number) {
    this.form.patchValue({ idCategoria: id })
  }

  // ---------- ubicacion ----------

  // Punto elegido (clic en el mapa, arrastre del pin o resultado de busqueda): detecta el distrito INEI
  marcar(p: { lat: number; lng: number }) {
    this.form.patchValue({ latitud: p.lat, longitud: p.lng })
    this.ubicando.set(true)
    this.fueraDePeru.set(false)
    this.geo.provincias().pipe(
      switchMap(provs => {
        const prov = this.geo.provinciaDe(p.lat, p.lng, provs)
        if (!prov) return of(null)
        return this.geo.distritosDe(prov.properties.id).pipe(
          map(col => Geoservice.ubicar(p.lat, p.lng, col.features)?.properties ?? null))
      })
    ).subscribe(d => {
      this.ubicando.set(false)
      this.distrito.set(d)
      this.fueraDePeru.set(!d)
      this.form.patchValue({ idZona: d ? this.zonaExistente(d)?.idZona ?? null : null })
    })
  }

  buscar(texto: string) {
    this.busca.set(texto)
    this.resultados.set(this.geo.buscar(texto, this.indice, 6))
  }

  irA(e: GeoIndice) {
    this.busca.set(e.n + (e.p ? ', ' + e.p : ''))
    this.resultados.set([])
    this.encuadre.set(e.b)
    if (e.t === 'x' && e.pr) {
      this.geo.distritosDe(e.pr).subscribe(col => {
        const f = col.features.find(x => x.properties.id === e.id)
        if (f) this.marcar({ lat: f.properties.centro[0], lng: f.properties.centro[1] })
      })
    } else {
      this.toast.info('Acércate y toca el lugar exacto en el mapa')
    }
  }

  private zonaExistente(d: GeoProps) {
    const n = Geoservice.norm(d.nombre), p = Geoservice.norm(d.provNombre)
    return this.datos()?.zonas.find(z => Geoservice.norm(z.nombreZona) === n && Geoservice.norm(z.provinciaZona) === p)
  }

  // Si el distrito aun no existe como zona en el sistema, se registra
  private asegurarZona(): Observable<number> {
    const d = this.distrito()
    if (!d) throw new Error('Sin distrito')
    const z = this.zonaExistente(d)
    if (z) return of(z.idZona)
    return this.zS.insert({
      idZona: 0, nombreZona: d.nombre, provinciaZona: d.provNombre ?? '', departamentoZona: d.depNombre ?? '',
      latitudZona: d.centro[0], longitudZona: d.centro[1],
    }).pipe(map(nueva => {
      this.datos()?.zonas.push(nueva)
      return nueva.idZona
    }))
  }

  // ---------- pasos ----------

  invalido(ctrl: string, grupo: FormGroup = this.form): boolean {
    const c = grupo.get(ctrl)
    return !!c && c.invalid && (c.touched || c.dirty)
  }

  siguiente() {
    if (this.paso() === 1) {
      const campos = ['idCategoria', 'descripcionTexto']
      campos.forEach(c => this.form.get(c)?.markAsTouched())
      if (campos.some(c => this.form.get(c)?.invalid)) {
        this.toast.error('Elige el tipo de problema y descríbelo (mínimo 15 caracteres).')
        return
      }
    } else {
      this.form.get('fotoUrl')?.markAsTouched()
      if (!this.distrito()) { this.toast.error('Marca en el mapa dónde ocurre el problema.'); return }
      if (this.form.get('fotoUrl')?.invalid) return
    }
    this.paso.set(this.paso() + 1)
    this.arriba()
  }

  atras() {
    this.paso.set(Math.max(1, this.paso() - 1))
    this.arriba()
  }

  irAPaso(p: number) {
    if (p < this.paso()) { this.paso.set(p); this.arriba() }
  }

  cambiarModo(m: 'registro' | 'ingreso') {
    this.modoCuenta.set(m)
    this.errorCuenta.set('')
    const req = m === 'registro' ? [Validators.required] : []
    for (const c of ['nombres', 'apellidos']) {
      this.cuenta.get(c)?.setValidators(req)
      this.cuenta.get(c)?.updateValueAndValidity()
    }
  }

  enviar() {
    if (this.form.invalid || !this.distrito()) { this.paso.set(1); return }
    let sesion$: Observable<SesionDTO>
    const s = this.auth.sesion()
    if (s) {
      sesion$ = of(s)
    } else {
      this.cuenta.markAllAsTouched()
      if (this.cuenta.invalid) { this.errorCuenta.set('Completa tus datos para enviar el reporte.'); return }
      const c = this.cuenta.value
      sesion$ = this.modoCuenta() === 'registro'
        ? this.auth.registrar(c.nombres, c.apellidos, c.correo, c.password)
        : this.auth.login(c.correo, c.password)
    }
    this.enviando.set(true)
    this.errorCuenta.set('')
    const v = this.form.value
    sesion$.pipe(
      switchMap(ses => this.asegurarZona().pipe(map(idZona => ({ ses, idZona })))),
      switchMap(({ ses, idZona }) => this.tS.insert({
        idTestimonio: 0, idUsuario: ses.idUsuario, idCategoria: v.idCategoria, idZona,
        descripcionTexto: v.descripcionTexto.trim(), fotoUrl: v.fotoUrl?.trim() ?? '',
        direccionTextoExtraida: v.direccionTextoExtraida?.trim() ?? '',
        latitud: Number(v.latitud), longitud: Number(v.longitud), estado: 'PENDIENTE',
        confianzaIA: null, modeloIA: null,
      }))
    ).subscribe({
      next: t => {
        this.enviando.set(false)
        this.creado.set(t)
        this.limpiarBorrador()
        this.arriba()
      },
      error: err => {
        this.enviando.set(false)
        const msg = Authservice.mensajeError(err)
        if (!this.auth.sesion()) this.errorCuenta.set(msg)
        else this.toast.error('No se pudo enviar el reporte: ' + msg)
      }
    })
  }

  nuevo() {
    this.creado.set(null)
    this.form.reset()
    this.distrito.set(null)
    this.busca.set('')
    this.paso.set(1)
    this.arriba()
  }

  ref(id: number) { return referencia(id) }

  private arriba() {
    if (this.browser) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  private guardarBorrador(v: any) {
    if (!this.browser) return
    try { sessionStorage.setItem(BORRADOR, JSON.stringify(v)) } catch { }
  }

  private restaurar() {
    if (!this.browser) return
    try {
      const raw = sessionStorage.getItem(BORRADOR)
      if (raw) this.form.patchValue(JSON.parse(raw))
    } catch { }
  }

  private limpiarBorrador() {
    if (!this.browser) return
    try { sessionStorage.removeItem(BORRADOR) } catch { }
  }
}
