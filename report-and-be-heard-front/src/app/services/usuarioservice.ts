import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioDTO } from '../models/UsuarioDTO';

@Injectable({
  providedIn: 'root',
})
export class Usuarioservice {
  private apiURL = `${environment.base}/apis/usuarios`;

  constructor(private http: HttpClient) { }

  list(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(this.apiURL);
  }

  listId(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.apiURL}/${id}`);
  }

  insert(x: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(this.apiURL, x);
  }

  update(x: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(this.apiURL, x);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}
