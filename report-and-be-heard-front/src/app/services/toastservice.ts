import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Avisos cortos al pie de la pantalla (MatSnackBar de Angular Material)
@Injectable({
  providedIn: 'root',
})
export class Toastservice {
  private snack = inject(MatSnackBar)

  ok(texto: string) { this.abrir(texto, 'snack-ok') }
  error(texto: string) { this.abrir(texto, 'snack-error') }
  info(texto: string) { this.abrir(texto, 'snack-info') }

  private abrir(texto: string, clase: string) {
    this.snack.open(texto, 'Cerrar', { duration: 4200, panelClass: clase, horizontalPosition: 'center', verticalPosition: 'bottom' })
  }
}
