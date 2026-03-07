import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Configuration } from '../models/configuration.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ConfigurationService {
    private apiUrl = 'http://localhost:3000/api/configuration';

    constructor(private http: HttpClient) { }

    create(configuration: Configuration): Observable<any> {
        return this.http.post(`${this.apiUrl}/create-configuration`, configuration);
    }

    getAll(): Observable<Configuration[]> {
        return this.http.get<Configuration[]>(`${this.apiUrl}/list-configurations`);
    }

    getByLot(lotId: number): Observable<Configuration[]> {
        return this.http.get<Configuration[]>(`${this.apiUrl}/by-lot/${lotId}`);
    }

    deleteById(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/delete/${id}`);
    }
}
