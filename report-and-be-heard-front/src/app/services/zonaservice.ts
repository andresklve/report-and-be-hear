import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ZonaDTO } from '../models/ZonaDTO';

@Injectable({
  providedIn: 'root',
})
export class Zonaservice {
  private apiURL = `${environment.base}/apis/zonas`;

  constructor(private http: HttpClient) { }

  list(): Observable<ZonaDTO[]> {
    return this.http.get<ZonaDTO[]>(this.apiURL);
  }

  listId(id: number): Observable<ZonaDTO> {
    return this.http.get<ZonaDTO>(`${this.apiURL}/${id}`);
  }

  insert(x: ZonaDTO): Observable<ZonaDTO> {
    return this.http.post<ZonaDTO>(this.apiURL, x);
  }

  update(x: ZonaDTO): Observable<ZonaDTO> {
    return this.http.put<ZonaDTO>(this.apiURL, x);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}
