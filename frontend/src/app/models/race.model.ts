export class Race {
    id?: number;
    nom: string;
    pu_sakafo_par_gramme: number;
    pv_par_gramme: number;
    pu_atody: number;

    constructor(nom: string, pu_sakafo_par_gramme: number, pv_par_gramme: number, pu_atody: number) {
        this.nom = nom;
        this.pu_sakafo_par_gramme = pu_sakafo_par_gramme;
        this.pv_par_gramme = pv_par_gramme;
        this.pu_atody = pu_atody;
    }
}