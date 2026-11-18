import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SuspensionDTO } from '../models/SuspensionDTO';

@Injectable({
  providedIn: 'root',
})
export class Suspensionservice {
  private apiURL = `${environment.base}/apis/suspensiones`;

  constructor(private http: HttpClient) { }

  list(): Observable<SuspensionDTO[]> {
    return this.http.get<SuspensionDTO[]>(this.apiURL);
  }

  insert(x: Partial<SuspensionDTO>): Observable<SuspensionDTO> {
    return this.http.post<SuspensionDTO>(this.apiURL, x);
  }

  levantar(id: number): Observable<SuspensionDTO> {
    return this.http.put<SuspensionDTO>(`${this.apiURL}/${id}/levantar`, {});
  }
}
