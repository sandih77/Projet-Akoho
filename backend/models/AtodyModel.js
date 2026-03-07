import Database from "../config/db.js";

export default class AtodyModel {
    static async create(atodyData) {
        try {
            const pool = await Database.getPool();
            const request = pool.request();

            request.input('lot_id', Database.getSql().Int, atodyData.lot_id);
            request.input('date_production', Database.getSql().Date, atodyData.date_production);
            request.input('nombre_atody', Database.getSql().Int, atodyData.nombre_atody);

            const result = await request.query(
                `INSERT INTO Atody (lot_id, date_production, nombre_atody)
                 VALUES (@lot_id, @date_production, @nombre_atody);
                 SELECT SCOPE_IDENTITY() AS id;`
            );

            const insertedId = result.recordset[0].id;
            return { message: 'Atody créé avec succès !', atody: { id: insertedId, ...atodyData } };
        } catch (err) {
            console.error('Erreur création atody:', err);
            throw err;
        }
    }

    static async getAll() {
        try {
            const pool = await Database.getPool();
            const result = await pool.request().query(`
                SELECT 
                    Atody.id, 
                    Atody.lot_id, 
                    Lot.name as lot_nom,
                    Atody.date_production, 
                    Atody.nombre_atody
                FROM Atody
                INNER JOIN Lot ON Atody.lot_id = Lot.id
                ORDER BY Atody.date_production DESC
            `);
            return result.recordset;
        } catch (err) {
            console.error('Erreur récupération atody:', err);
            throw err;
        }
    }

    static async getTotalByLotAndDate(lotId, dateBilan) {
        try {
            const pool = await Database.getPool();
            const request = pool.request();
            
            request.input('lot_id', Database.getSql().Int, lotId);
            request.input('date_bilan', Database.getSql().Date, dateBilan);
            
            const result = await request.query(`
                SELECT ISNULL(SUM(nombre_atody), 0) AS total_atody
                FROM Atody 
                WHERE lot_id = @lot_id AND date_production <= @date_bilan
            `);
            
            return result.recordset[0]?.total_atody || 0;
        } catch (err) {
            console.error('Erreur récupération total atody:', err);
            throw err;
        }
    }
}
