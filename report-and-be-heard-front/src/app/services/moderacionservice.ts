import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModeracionDTO } from '../models/ModeracionDTO';

@Injectable({
  providedIn: 'root',
})
export class Moderacionservice {
  private apiURL = `${environment.base}/apis/moderaciones`;

  constructor(private http: HttpClient) { }

  list(): Observable<ModeracionDTO[]> {
    return this.http.get<ModeracionDTO[]>(this.apiURL);
  }

  listId(id: number): Observable<ModeracionDTO> {
    return this.http.get<ModeracionDTO>(`${this.apiURL}/${id}`);
  }

  insert(x: ModeracionDTO): Observable<ModeracionDTO> {
    return this.http.post<ModeracionDTO>(this.apiURL, x);
  }

  update(x: ModeracionDTO): Observable<ModeracionDTO> {
    return this.http.put<ModeracionDTO>(this.apiURL, x);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}
