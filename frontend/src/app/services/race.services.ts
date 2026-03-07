import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Race } from '../models/race.model';

@Injectable({
    providedIn: 'root'
})
export class RaceService {
    private apiUrl = 'http://localhost:3000/api/races';

    constructor(private http: HttpClient) { }

    createRace(race: Race): Observable<any> {
        return this.http.post(`${this.apiUrl}/create-race`, race);
    }

    getAllRaces(): Observable<Race[]> {
        return this.http.get<Race[]>(`${this.apiUrl}/list-races`);
    }
}