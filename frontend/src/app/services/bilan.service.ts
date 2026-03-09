import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BilanData {
    lot_id: number;
    lot_name: string;
    race_nom: string;
    nombre_initial_akoho: number;
    cout_achat: number;
    age_initial: number;
    date_achat: string;
    semaines_ecoulees: number;
    jours_ecoules: number;
    total_jours: number;
    nombre_akoho_vivants: number;
    nombre_akoho_maty: number;
    sakafo_poids: number;
    sakafo_cout: number;
    poids_moyen: number;
    pv_total_akoho: number;
    nombre_atody: number;
    cout_total_atody: number;
    revenus_totaux: number;
    depenses_totales: number;
    benefices: number;
}

@Injectable({
    providedIn: 'root',
})
export class BilanService {
    private apiUrl = 'http://localhost:3000/api/bilan';

    constructor(private http: HttpClient) { }

    getBilanByLotAndDate(lotId: number, dateBilan: string): Observable<BilanData> {
        return this.http.get<BilanData>(`${this.apiUrl}?lot_id=${lotId}&date_bilan=${dateBilan}`);
    }

    getAllBilans(dateBilan: string): Observable<BilanData[]> {
        return this.http.get<BilanData[]>(`${this.apiUrl}/all?date_bilan=${dateBilan}`);
    }
}
