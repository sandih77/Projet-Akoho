import Database from "../config/db.js";

export default class AtodyModel {
    static async create(atodyData) {
        try {
            const pool = await Database.getPool();

            // Vérifier que le lot existe et récupérer sa date d'achat
            const checkLotRequest = pool.request();
            checkLotRequest.input('lot_id', Database.getSql().Int, atodyData.lot_id);
            const lotResult = await checkLotRequest.query(
                'SELECT date_achat, name FROM Lot WHERE id = @lot_id'
            );

            if (lotResult.recordset.length === 0) {
                throw new Error('Lot non trouvé');
            }

            const dateAchat = new Date(lotResult.recordset[0].date_achat);
            const dateProduction = new Date(atodyData.date_production);
            const lotName = lotResult.recordset[0].name;

            // Vérifier que la date de production n'est pas antérieure à la date d'achat
            if (dateProduction < dateAchat) {
                throw new Error(
                    `Impossible: la date de production (${dateProduction.toLocaleDateString('fr-FR')}) ` +
                    `est antérieure à la date d'achat du lot "${lotName}" ` +
                    `(${dateAchat.toLocaleDateString('fr-FR')}). ` +
                    `Le lot n'existait pas encore à cette date.`
                );
            }

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
