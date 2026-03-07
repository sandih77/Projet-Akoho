import Database from "../config/db.js";

const db = Database.getSql();

class LotModel {
    constructor(name, race_id, date_achat, nombre_akoho, age, prix_achat) {
        this.name = name;
        this.race_id = race_id;
        this.date_achat = date_achat;
        this.nombre_akoho = nombre_akoho;
        this.age = age;
        this.prix_achat = prix_achat;
    }

    static create(lot, result) {
        const sql = "INSERT INTO Lot (name, race_id, date_achat, nombre_akoho, age, prix_achat) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(sql, [lot.name, lot.race_id, lot.date_achat, lot.nombre_akoho, lot.age, lot.prix_achat], (err, res) => {
            if (err) {
                console.error("Error creating lot: ", err);
                result(err, null);
                return;
            }
            console.log("Created lot: ", { id: res.insertId, ...lot });
            result(null, { id: res.insertId, ...lot });
        });
    }
}
export default LotModel;