export class AkohoMaty {
    id?: number;
    lot_id: number;
    lot_nom?: string;
    date_maty: Date;
    nombre: number;

    constructor(lot_id: number, date_maty: Date, nombre: number) {
        this.lot_id = lot_id;
        this.date_maty = date_maty;
        this.nombre = nombre;
    }
}
