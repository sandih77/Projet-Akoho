export class Eclosion {
    id?: number;
    lot_id: number;
    lot_nom?: string;
    date_eclosion: Date;
    nombre_foy: number;
    nombre_tsy_foy: number;

    constructor(lot_id: number, date_eclosion: Date, nombre_foy: number, nombre_tsy_foy: number) {
        this.lot_id = lot_id;
        this.date_eclosion = date_eclosion;
        this.nombre_foy = nombre_foy;
        this.nombre_tsy_foy = nombre_tsy_foy;
    }
}
