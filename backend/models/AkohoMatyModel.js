import Database from "../config/db.js";

export default class AkohoMatyModel {
    static async create(akohoMatyData) {
        try {
            const pool = await Database.getPool();
            const request = pool.request();

            request.input('lot_id', Database.getSql().Int, akohoMatyData.lot_id);
            request.input('date_maty', Database.getSql().Date, akohoMatyData.date_maty);
            request.input('nombre', Database.getSql().Int, akohoMatyData.nombre);

            const result = await request.query(
                `INSERT INTO Akoho_Maty (lot_id, date_maty, nombre)
                 VALUES (@lot_id, @date_maty, @nombre);
                 SELECT SCOPE_IDENTITY() AS id;`
            );

            const insertedId = result.recordset[0].id;
            return { message: 'Akoho Maty créé avec succès !', akoho_maty: { id: insertedId, ...akohoMatyData } };
        } catch (err) {
            console.error('Erreur création akoho maty:', err);
            throw err;
        }
    }

    static async getAll() {
        try {
            const pool = await Database.getPool();
            const result = await pool.request().query(`
                SELECT 
                    Akoho_Maty.id, 
                    Akoho_Maty.lot_id, 
                    Lot.name as lot_nom,
                    Akoho_Maty.date_maty, 
                    Akoho_Maty.nombre
                FROM Akoho_Maty
                INNER JOIN Lot ON Akoho_Maty.lot_id = Lot.id
                ORDER BY Akoho_Maty.date_maty DESC
            `);
            return result.recordset;
        } catch (err) {
            console.error('Erreur récupération akoho maty:', err);
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
                SELECT ISNULL(SUM(nombre), 0) AS total_akoho_maty
                FROM Akoho_Maty 
                WHERE lot_id = @lot_id AND date_maty <= @date_bilan
            `);
            
            return result.recordset[0]?.total_akoho_maty || 0;
        } catch (err) {
            console.error('Erreur récupération total akoho maty:', err);
            throw err;
        }
    }
}
