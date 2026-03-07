export class Lots {
    id?: number;
    name: string;
    race_id: number;
    race_nom?: string;
    date_achat: Date;
    nombre_akoho: number;
    age: number;
    prix_achat: number;

    constructor(name: string, race_id: number, date_achat: Date, nombre_akoho: number, age: number, prix_achat: number) {
        this.name = name;
        this.race_id = race_id;
        this.date_achat = date_achat;
        this.nombre_akoho = nombre_akoho;
        this.age = age;
        this.prix_achat = prix_achat;
    }
}