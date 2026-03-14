export class Eclosion {
    id?: number;
    lot_id: number;
    lot_nom?: string;
    race_id?: number;
    race_nom?: string;
    lot_nombre_akoho?: number;
    lot_nombre_vavy?: number;
    lot_nombre_lahy?: number;
    date_eclosion: Date;
    nombre_foy: number;
    nombre_tsy_foy: number;
    total_incubes?: number;
    taux_eclosion?: number;

    constructor(
        lot_id: number,
        date_eclosion: Date,
        nombre_foy: number,
        nombre_tsy_foy: number,
        total_incubes: number = 0,
        taux_eclosion: number = 0
    ) {
        this.lot_id = lot_id;
        this.date_eclosion = date_eclosion;
        this.nombre_foy = nombre_foy;
        this.nombre_tsy_foy = nombre_tsy_foy;
        this.total_incubes = total_incubes;
        this.taux_eclosion = taux_eclosion;
    }
}
