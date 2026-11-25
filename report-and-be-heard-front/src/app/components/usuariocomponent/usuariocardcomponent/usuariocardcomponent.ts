import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsuarioDTO } from '../../../models/UsuarioDTO';

// Tarjeta (mat-card) con los datos de un usuario
@Component({
  selector: 'app-usuariocardcomponent',
  imports: [DatePipe, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatTooltipModule],
  templateUrl: './usuariocardcomponent.html',
  styleUrl: './usuariocardcomponent.css',
})
export class Usuariocardcomponent {
  usuario = input.required<UsuarioDTO>()
  rol = input('')
  confirmando = input(false)
  eliminar = output<UsuarioDTO>()

  iniciales = computed(() => {
    const u = this.usuario()
    return `${u.nombres[0] ?? ''}${u.apellidos[0] ?? ''}`.toUpperCase()
  })

  tonoRol = computed(() => this.rol() === 'ADMINISTRADOR' ? 'pill pill-error'
    : this.rol() === 'MUNICIPALIDAD' ? 'pill pill-info' : 'pill')

  iconoRol = computed(() => this.rol() === 'ADMINISTRADOR' ? 'admin_panel_settings'
    : this.rol() === 'MUNICIPALIDAD' ? 'account_balance' : 'person')
}
