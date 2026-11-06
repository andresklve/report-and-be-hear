import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; texto: string; tono: 'ok' | 'error' | 'info'; }

@Injectable({
  providedIn: 'root',
})
export class Toastservice {
  readonly toasts = signal<Toast[]>([])
  private seq = 0

  ok(texto: string) { this.push(texto, 'ok') }
  error(texto: string) { this.push(texto, 'error') }
  info(texto: string) { this.push(texto, 'info') }

  cerrar(id: number) {
    this.toasts.update(l => l.filter(t => t.id !== id))
  }

  private push(texto: string, tono: Toast['tono']) {
    const id = ++this.seq
    this.toasts.update(l => [...l, { id, texto, tono }])
    setTimeout(() => this.cerrar(id), 4200)
  }
}
