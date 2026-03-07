import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Atody } from '../models/atody.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AtodyService {
    private apiUrl = 'http://localhost:3000/api/atody';

    constructor(private http: HttpClient) { }

    create(atody: Atody): Observable<any> {
        return this.http.post(`${this.apiUrl}/create-atody`, atody);
    }

    getAll(): Observable<Atody[]> {
        return this.http.get<Atody[]>(`${this.apiUrl}/list-atody`);
    }
}
