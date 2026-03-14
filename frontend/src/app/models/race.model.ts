export class Race {
    id?: number;
    nom: string;
    pu_sakafo_par_gramme: number;
    pv_par_gramme: number;
    pu_atody: number;
    pourcentage_vavy: number;
    pourcentage_lamokany: number;
    capacite_pondre: number;
    duree_incubation: number;
    prix_achat: number;

    constructor(nom: string, pu_sakafo_par_gramme: number, pv_par_gramme: number, pu_atody: number, pourcentage_vavy: number, pourcentage_lamokany: number, capacite_pondre: number, duree_incubation: number, prix_achat: number) {
        this.nom = nom;
        this.pu_sakafo_par_gramme = pu_sakafo_par_gramme;
        this.pv_par_gramme = pv_par_gramme;
        this.pu_atody = pu_atody;
        this.pourcentage_vavy = pourcentage_vavy;
        this.pourcentage_lamokany = pourcentage_lamokany;
        this.capacite_pondre = capacite_pondre;
        this.duree_incubation = duree_incubation;
        this.prix_achat = prix_achat;
    }
}