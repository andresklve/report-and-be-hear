import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Comentarioservice } from '../../services/comentarioservice';
import { Authservice } from '../../services/authservice';
import { Toastservice } from '../../services/toastservice';
import { ComentarioDTO } from '../../models/ComentarioDTO';
import { Suspendercomponent } from '../suspendercomponent/suspendercomponent';

// Comentarios publicos de un reporte. Cualquier persona los lee; con sesion se puede comentar.
// El autor borra sus comentarios; la municipalidad y el administrador borran cualquiera
// y pueden suspender la cuenta de quien comenta.
@Component({
  selector: 'app-comentarioscomponent',
  imports: [MatChipsModule, MatCardModule, DatePipe, RouterLink, FormsModule, Suspendercomponent, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule],
  templateUrl: './comentarioscomponent.html',
  styleUrl: './comentarioscomponent.css',
})
export class Comentarioscomponent {
  private cS = inject(Comentarioservice)
  private toast = inject(Toastservice)
  auth = inject(Authservice)

  idTestimonio = input.required<number>()
  idAutorReporte = input<number>(0)

  comentarios = signal<ComentarioDTO[]>([])
  texto = signal('')
  enviando = signal(false)
  confirmando = signal<number | null>(null)
  suspendiendo = signal<number | null>(null)   // id del comentario cuyo autor se va a suspender

  restantes = computed(() => 500 - this.texto().length)

  constructor() {
    effect(() => {
      const id = this.idTestimonio()
      if (!id) return
      this.cS.listPorTestimonio(id).subscribe({ next: l => this.comentarios.set(l), error: () => {} })
    })
  }

  enviar() {
    const s = this.auth.sesion()
    const texto = this.texto().trim()
    if (!s || !texto) return
    this.enviando.set(true)
    this.cS.insert({ idComentario: 0, idTestimonio: this.idTestimonio(), idUsuario: s.idUsuario, texto, fechaCreacion: null, nombreAutor: '' }).subscribe({
      next: c => { this.comentarios.update(l => [...l, c]); this.texto.set(''); this.enviando.set(false) },
      error: err => { this.enviando.set(false); this.toast.error(err.error?.message ?? 'No se pudo publicar el comentario') },
    })
  }

  puedeBorrar(c: ComentarioDTO) {
    return this.auth.esEquipo() || c.idUsuario === this.auth.sesion()?.idUsuario
  }

  puedeSuspender(c: ComentarioDTO) {
    return this.auth.esEquipo() && c.idUsuario !== this.auth.sesion()?.idUsuario
  }

  borrar(c: ComentarioDTO) {
    if (this.confirmando() !== c.idComentario) {
      this.confirmando.set(c.idComentario)
      setTimeout(() => { if (this.confirmando() === c.idComentario) this.confirmando.set(null) }, 3500)
      return
    }
    this.cS.delete(c.idComentario).subscribe({
      next: () => { this.comentarios.update(l => l.filter(x => x.idComentario !== c.idComentario)); this.toast.ok('Comentario eliminado') },
      error: () => { this.confirmando.set(null); this.toast.error('No se pudo eliminar el comentario') },
    })
  }

  iniciales(nombre: string) {
    return nombre.split(' ').map(p => p[0] ?? '').join('').slice(0, 2).toUpperCase()
  }
}
