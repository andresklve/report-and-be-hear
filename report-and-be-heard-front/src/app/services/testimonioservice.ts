import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestimonioDTO } from '../models/TestimonioDTO';

@Injectable({
  providedIn: 'root',
})
export class Testimonioservice {
  private apiURL = `${environment.base}/apis/testimonios`;

  constructor(private http: HttpClient) { }

  list(): Observable<TestimonioDTO[]> {
    return this.http.get<TestimonioDTO[]>(this.apiURL);
  }

  listId(id: number): Observable<TestimonioDTO> {
    return this.http.get<TestimonioDTO>(`${this.apiURL}/${id}`);
  }

  insert(x: TestimonioDTO): Observable<TestimonioDTO> {
    return this.http.post<TestimonioDTO>(this.apiURL, x);
  }

  update(id: number, x: TestimonioDTO): Observable<TestimonioDTO> {
    return this.http.put<TestimonioDTO>(`${this.apiURL}/${id}`, x);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}
