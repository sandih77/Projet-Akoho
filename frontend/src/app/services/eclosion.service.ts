import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Eclosion } from '../models/eclosion.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EclosionService {
  private apiUrl = 'http://localhost:3000/api/eclosion';

  constructor(private http: HttpClient) { }

  create(eclosion: Eclosion): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-eclosion`, eclosion);
  }

  getAll(): Observable<Eclosion[]> {
    return this.http.get<Eclosion[]>(`${this.apiUrl}/list-eclosion`);
  }
}
