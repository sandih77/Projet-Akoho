import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AkohoMaty } from '../models/akoho-maty.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AkohoMatyService {
  private apiUrl = 'http://localhost:3000/api/akoho-maty';

  constructor(private http: HttpClient) { }

  create(akohoMaty: AkohoMaty): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-akoho-maty`, akohoMaty);
  }

  getAll(): Observable<AkohoMaty[]> {
    return this.http.get<AkohoMaty[]>(`${this.apiUrl}/list-akoho-maty`);
  }
}
