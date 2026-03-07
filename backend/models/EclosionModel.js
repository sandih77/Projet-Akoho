import Database from "../config/db.js";

export default class EclosionModel {
    static async create(eclosionData) {
        try {
            const pool = await Database.getPool();
            const request = pool.request();

            request.input('lot_id', Database.getSql().Int, eclosionData.lot_id);
            request.input('date_eclosion', Database.getSql().Date, eclosionData.date_eclosion);
            request.input('nombre_foy', Database.getSql().Int, eclosionData.nombre_foy);

            const result = await request.query(
                `INSERT INTO Eclosion (lot_id, date_eclosion, nombre_foy)
                 VALUES (@lot_id, @date_eclosion, @nombre_foy);
                 SELECT SCOPE_IDENTITY() AS id;`
            );

            const insertedId = result.recordset[0].id;
            return { message: 'Eclosion créée avec succès !', eclosion: { id: insertedId, ...eclosionData } };
        } catch (err) {
            console.error('Erreur création eclosion:', err);
            throw err;
        }
    }

    static async getAll() {
        try {
            const pool = await Database.getPool();
            const result = await pool.request().query(`
                SELECT 
                    Eclosion.id, 
                    Eclosion.lot_id, 
                    Lot.name as lot_nom,
                    Eclosion.date_eclosion, 
                    Eclosion.nombre_foy
                FROM Eclosion
                INNER JOIN Lot ON Eclosion.lot_id = Lot.id
                ORDER BY Eclosion.date_eclosion DESC
            `);
            return result.recordset;
        } catch (err) {
            console.error('Erreur récupération eclosion:', err);
            throw err;
        }
    }
}
