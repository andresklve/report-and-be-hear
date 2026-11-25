import { Component, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Filtro "desde - hasta" reutilizable (mat-date-range-input + mat-date-range-picker)
@Component({
  selector: 'app-rangofechascomponent',
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatButtonModule, MatIconModule],
  templateUrl: './rangofechascomponent.html',
  styleUrl: './rangofechascomponent.css',
})
export class Rangofechascomponent {
  etiqueta = 'Rango de fechas'
  desde = model<Date | null>(null)
  hasta = model<Date | null>(null)

  limpiar() {
    this.desde.set(null)
    this.hasta.set(null)
  }
}
