import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComentarioDTO } from '../models/ComentarioDTO';

@Injectable({
  providedIn: 'root',
})
export class Comentarioservice {
  private apiURL = `${environment.base}/apis/comentarios`;

  constructor(private http: HttpClient) { }

  listPorTestimonio(idTestimonio: number): Observable<ComentarioDTO[]> {
    return this.http.get<ComentarioDTO[]>(this.apiURL, { params: { idTestimonio } });
  }

  insert(x: ComentarioDTO): Observable<ComentarioDTO> {
    return this.http.post<ComentarioDTO>(this.apiURL, x);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}
