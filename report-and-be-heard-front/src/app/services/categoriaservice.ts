import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaDTO } from '../models/CategoriaDTO';

@Injectable({
  providedIn: 'root',
})
export class Categoriaservice {
  private apiURL = `${environment.base}/apis/categorias`;

  constructor(private http: HttpClient) { }

  list(): Observable<CategoriaDTO[]> {
    return this.http.get<CategoriaDTO[]>(this.apiURL);
  }

  listId(id: number): Observable<CategoriaDTO> {
    return this.http.get<CategoriaDTO>(`${this.apiURL}/${id}`);
  }

  insert(x: CategoriaDTO): Observable<CategoriaDTO> {
    return this.http.post<CategoriaDTO>(this.apiURL, x);
  }

  update(x: CategoriaDTO): Observable<CategoriaDTO> {
    return this.http.put<CategoriaDTO>(this.apiURL, x);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}
