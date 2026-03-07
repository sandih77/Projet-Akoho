import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Lots } from '../models/lot.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class LotsServices {
  private apiUrl = 'http://localhost:3000/api/lots';

  constructor(private http: HttpClient) { }

  create(lot: Lots): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-lot`, lot);
  }

  getAllLots(): Observable<Lots[]> {
    return this.http.get<Lots[]>(`${this.apiUrl}/list-lots`);
  }
}

