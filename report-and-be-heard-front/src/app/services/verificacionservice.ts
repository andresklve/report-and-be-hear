import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VerificacionDTO } from '../models/VerificacionDTO';

@Injectable({
  providedIn: 'root',
})
export class Verificacionservice {
  private apiURL = `${environment.base}/apis/verificaciones`;

  constructor(private http: HttpClient) { }

  // Activa la cuenta con el token del link que llego al correo
  confirmar(token: string): Observable<VerificacionDTO> {
    return this.http.get<VerificacionDTO>(`${this.apiURL}/confirmar`, {
      params: { token: token }
    });
  }

  // Envia un link nuevo al correo de una cuenta sin verificar
  reenviar(correo: string): Observable<VerificacionDTO> {
    return this.http.post<VerificacionDTO>(`${this.apiURL}/reenviar`, { correo: correo });
  }

  // Olvide mi contraseña: envia un link al correo para poner una contraseña nueva
  recuperar(correo: string): Observable<VerificacionDTO> {
    return this.http.post<VerificacionDTO>(`${this.apiURL}/recuperar`, { correo: correo });
  }

  // Guarda la contraseña nueva con el token del link
  restablecer(token: string, password: string): Observable<VerificacionDTO> {
    return this.http.put<VerificacionDTO>(`${this.apiURL}/restablecer`, { token: token, password: password });
  }
}
