import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Lots } from '../models/lot.models';

@Injectable({
  providedIn: 'root',
})
export class LotsServices {
  private apiUrl = 'http://localhost:3000/api/lots';
  constructor(private http: HttpClient) { }
  create(lot: Lots) {
    return this.http.post(`${this.apiUrl}/create-lot`, lot);
  }
}

