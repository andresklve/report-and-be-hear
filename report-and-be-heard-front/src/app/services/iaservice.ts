import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClasificacionIADTO } from '../models/ClasificacionIADTO';

// Clasificacion del reclamo con IA (Google Gemini en el backend; reglas si no esta disponible)
@Injectable({
  providedIn: 'root',
})
export class Iaservice {
  private apiURL = `${environment.base}/apis/ia`;

  constructor(private http: HttpClient) { }

  clasificar(texto: string): Observable<ClasificacionIADTO> {
    return this.http.post<ClasificacionIADTO>(`${this.apiURL}/clasificar`, { texto });
  }
}
