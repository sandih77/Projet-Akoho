export class Lots {
    id?: number;
    name: string;
    race_id: number;
    race_nom?: string;
    date_achat: Date;
    nombre_akoho: number;
    age: number;
    prix_achat: number;
    poids_initial: number | null;
    nombre_vavy?: number;
    nombre_lahy?: number;

    constructor(
        name: string,
        race_id: number,
        date_achat: Date,
        nombre_akoho: number,
        age: number,
        prix_achat: number,
        poids_initial: number | null,
        nombre_vavy: number = 0,
        nombre_lahy: number = 0
    ) {
        this.name = name;
        this.race_id = race_id;
        this.date_achat = date_achat;
        this.nombre_akoho = nombre_akoho;
        this.age = age;
        this.prix_achat = prix_achat;
        this.poids_initial = poids_initial;
        this.nombre_vavy = nombre_vavy;
        this.nombre_lahy = nombre_lahy;
    }
}