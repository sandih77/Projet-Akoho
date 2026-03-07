export class Atody {
    id?: number;
    lot_id: number;
    lot_nom?: string;
    date_production: Date;
    nombre_atody: number;

    constructor(lot_id: number, date_production: Date, nombre_atody: number) {
        this.lot_id = lot_id;
        this.date_production = date_production;
        this.nombre_atody = nombre_atody;
    }
}
