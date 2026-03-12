import Database from "../config/db.js";

export default class LotModel {
    static async create(lotData) {
        try {
            const pool = await Database.getPool();
            const request = pool.request();

            request.input('name', Database.getSql().VarChar, lotData.name);
            request.input('race_id', Database.getSql().Int, lotData.race_id);
            request.input('date_achat', Database.getSql().Date, lotData.date_achat);
            request.input('nombre_akoho', Database.getSql().Int, lotData.nombre_akoho);
            request.input('age', Database.getSql().Int, lotData.age);
            request.input('prix_achat', Database.getSql().Decimal(10, 2), lotData.prix_achat);
            request.input('poids_initial', Database.getSql().Decimal(10, 2), lotData.poids_initial || null);

            const result = await request.query(
                `INSERT INTO Lot (name, race_id, date_achat, nombre_akoho, age, prix_achat, poids_initial)
                 VALUES (@name, @race_id, @date_achat, @nombre_akoho, @age, @prix_achat, @poids_initial);
                 SELECT SCOPE_IDENTITY() AS id;`
            );

            const insertedId = result.recordset[0].id;
            return { message: 'Lot créé avec succès !', lot: { id: insertedId, ...lotData } };
        } catch (err) {
            console.error('Erreur création lot:', err);
            throw err;
        }
    }

    static async getAll() {
        try {
            const pool = await Database.getPool();
            const result = await pool.request().query(`
                SELECT 
                    Lot.id, 
                    Lot.name, 
                    Lot.race_id,
                    Lot.poids_initial, 
                    Race.nom as race_nom,
                    Lot.date_achat, 
                    Lot.nombre_akoho, 
                    Lot.age, 
                    Lot.prix_achat
                FROM Lot
                INNER JOIN Race ON Lot.race_id = Race.id
                ORDER BY Lot.id
            `);
            return result.recordset;
        } catch (err) {
            console.error('Erreur récupération lots:', err);
            throw err;
        }
    }

    static async getWithRaceInfo(lotId) {
        try {
            const pool = await Database.getPool();
            const request = pool.request();

            request.input('lot_id', Database.getSql().Int, lotId);

            const result = await request.query(`
                SELECT 
                    L.id AS lot_id,
                    L.name AS lot_name,
                    L.nombre_akoho AS nombre_initial_akoho,
                    L.prix_achat AS cout_achat,
                    L.age AS age_initial,
                    L.date_achat,
                    L.poids_initial,
                    R.id AS race_id,
                    R.nom AS race_nom,
                    R.pu_sakafo_par_gramme,
                    R.pv_par_gramme,
                    R.pu_atody
                FROM Lot L
                INNER JOIN Race R ON L.race_id = R.id
                WHERE L.id = @lot_id
            `);

            return result.recordset[0] || null;
        } catch (err) {
            console.error('Erreur récupération lot avec race info:', err);
            throw err;
        }
    }
}