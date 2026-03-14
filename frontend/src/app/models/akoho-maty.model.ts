export class AkohoMaty {
    id?: number;
    lot_id: number;
    lot_nom?: string;
    date_maty: Date;
    nombre: number;
    nombre_lahy: number;
    nombre_vavy: number;

    constructor(lot_id: number, date_maty: Date, nombre: number, nombre_lahy: number, nombre_vavy: number) {
        this.lot_id = lot_id;
        this.date_maty = date_maty;
        this.nombre = nombre;
        this.nombre_lahy = nombre_lahy;
        this.nombre_vavy = nombre_vavy;
    }
}
