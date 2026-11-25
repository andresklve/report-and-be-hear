import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolDTO } from '../models/RolDTO';

@Injectable({
  providedIn: 'root',
})
export class Rolservice {
  private apiURL = `${environment.base}/apis/roles`;

  constructor(private http: HttpClient) { }

  list(): Observable<RolDTO[]> {
    return this.http.get<RolDTO[]>(this.apiURL);
  }

  listId(id: number): Observable<RolDTO> {
    return this.http.get<RolDTO>(`${this.apiURL}/${id}`);
  }

  insert(x: RolDTO): Observable<RolDTO> {
    return this.http.post<RolDTO>(this.apiURL, x);
  }

  update(x: RolDTO): Observable<RolDTO> {
    return this.http.put<RolDTO>(this.apiURL, x);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}
