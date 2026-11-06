import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CategoriaReporteDTO, CostoCategoriaDTO, DesempenoIADTO, InversionDepartamentoDTO,
  MapaCalorDTO, RankingZonaDTO, TendenciaTemporalDTO, TiempoAtencionDTO
} from '../models/ReporteDTO';

@Injectable({
  providedIn: 'root',
})
export class Reporteservice {
  private apiURL = `${environment.base}/apis/reportes`;

  constructor(private http: HttpClient) { }

  // US07 - Ciudadano, Municipalidad y Administrador
  mapaCalor(): Observable<MapaCalorDTO[]> {
    return this.http.get<MapaCalorDTO[]>(`${this.apiURL}/mapa-calor`);
  }

  // US08
  porCategoria(): Observable<CategoriaReporteDTO[]> {
    return this.http.get<CategoriaReporteDTO[]>(`${this.apiURL}/por-categoria`);
  }

  // US09 - agrupacion: 'dia' | 'mes'
  tendencia(agrupacion: 'dia' | 'mes'): Observable<TendenciaTemporalDTO[]> {
    const params = new HttpParams().set('agrupacion', agrupacion);
    return this.http.get<TendenciaTemporalDTO[]>(`${this.apiURL}/tendencia`, { params });
  }

  // US10
  rankingZonas(): Observable<RankingZonaDTO[]> {
    return this.http.get<RankingZonaDTO[]>(`${this.apiURL}/ranking-zonas`);
  }

  // US11
  inversionPorDepartamento(): Observable<InversionDepartamentoDTO[]> {
    return this.http.get<InversionDepartamentoDTO[]>(`${this.apiURL}/inversion-por-departamento`);
  }

  // US12
  costoPorCategoria(): Observable<CostoCategoriaDTO[]> {
    return this.http.get<CostoCategoriaDTO[]>(`${this.apiURL}/costo-por-categoria`);
  }

  // US13
  tiempoAtencion(): Observable<TiempoAtencionDTO> {
    return this.http.get<TiempoAtencionDTO>(`${this.apiURL}/tiempo-atencion`);
  }

  // US14
  desempenoIA(): Observable<DesempenoIADTO[]> {
    return this.http.get<DesempenoIADTO[]>(`${this.apiURL}/desempeno-ia`);
  }
}
