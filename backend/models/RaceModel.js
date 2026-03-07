import Database from "../config/db.js";

const db = Database.getSql();

class RaceModel {
    constructor(nom, pu_sakafo_par_gramme, pv_par_gramme, pu_atody) {
        this.nom = nom;
        this.pu_sakafo_par_gramme = pu_sakafo_par_gramme;
        this.pv_par_gramme = pv_par_gramme;
        this.pu_atody = pu_atody;
    }

    static create(race, result) {
        const sql = "INSERT INTO Race (nom, pu_sakafo_par_gramme, pv_par_gramme, pu_atody) VALUES (?, ?, ?, ?)";
        db.query(sql, [race.nom, race.pu_sakafo_par_gramme, race.pv_par_gramme, race.pu_atody], (err, res) => {
            if (err) {
                console.error("Error creating race: ", err);
                result(err, null);
                return;
            }
            console.log("Created race: ", { id: res.insertId, ...race });
            result(null, { id: res.insertId, ...race });
        });
    }
}
export default RaceModel;