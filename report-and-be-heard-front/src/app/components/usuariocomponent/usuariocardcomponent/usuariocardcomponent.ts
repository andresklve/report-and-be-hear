import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { UsuarioDTO } from '../../../models/UsuarioDTO';

// Tarjeta (mat-card) con los datos de un usuario
@Component({
  selector: 'app-usuariocardcomponent',
  imports: [DatePipe, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './usuariocardcomponent.html',
  styleUrl: './usuariocardcomponent.css',
})
export class Usuariocardcomponent {
  @Input() usuario: UsuarioDTO = new UsuarioDTO()
  @Input() rol: string = ''
  @Output() eliminar = new EventEmitter<UsuarioDTO>()

  iniciales(): string {
    return `${this.usuario.nombres[0] ?? ''}${this.usuario.apellidos[0] ?? ''}`.toUpperCase()
  }

  tonoRol(): string {
    return this.rol === 'ADMINISTRADOR' ? 'pill pill-error' : this.rol === 'MUNICIPALIDAD' ? 'pill pill-info' : 'pill'
  }

  iconoRol(): string {
    return this.rol === 'ADMINISTRADOR' ? 'admin_panel_settings' : this.rol === 'MUNICIPALIDAD' ? 'account_balance' : 'person'
  }
}
