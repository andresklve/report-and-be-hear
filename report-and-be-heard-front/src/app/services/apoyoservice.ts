import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApoyoResumenDTO, RankingApoyoDTO } from '../models/ApoyoDTO';

@Injectable({
  providedIn: 'root',
})
export class Apoyoservice {
  private apiURL = `${environment.base}/apis/apoyos`;

  constructor(private http: HttpClient) { }

  resumen(idTestimonio: number, idUsuario?: number | null): Observable<ApoyoResumenDTO> {
    const params: Record<string, number> = idUsuario ? { idUsuario } : {};
    return this.http.get<ApoyoResumenDTO>(`${this.apiURL}/testimonio/${idTestimonio}`, { params });
  }

  ranking(): Observable<RankingApoyoDTO[]> {
    return this.http.get<RankingApoyoDTO[]>(`${this.apiURL}/ranking`);
  }

  apoyar(idTestimonio: number, idUsuario: number): Observable<ApoyoResumenDTO> {
    return this.http.post<ApoyoResumenDTO>(this.apiURL, { idTestimonio, idUsuario });
  }

  quitar(idTestimonio: number, idUsuario: number): Observable<ApoyoResumenDTO> {
    return this.http.delete<ApoyoResumenDTO>(`${this.apiURL}/testimonio/${idTestimonio}/usuario/${idUsuario}`);
  }
}
