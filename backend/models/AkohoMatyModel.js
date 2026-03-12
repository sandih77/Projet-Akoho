import Database from "../config/db.js";

export default class AkohoMatyModel {
    static async create(akohoMatyData) {
        try {
            const pool = await Database.getPool();

            // Vérifier que le lot existe et récupérer sa date d'achat
            const checkLotRequest = pool.request();
            checkLotRequest.input('lot_id', Database.getSql().Int, akohoMatyData.lot_id);
            const lotResult = await checkLotRequest.query(
                'SELECT date_achat, name, nombre_akoho FROM Lot WHERE id = @lot_id'
            );

            if (lotResult.recordset.length === 0) {
                throw new Error('Lot non trouvé');
            }

            const dateAchat = new Date(lotResult.recordset[0].date_achat);
            const dateMaty = new Date(akohoMatyData.date_maty);
            const lotName = lotResult.recordset[0].name;
            const nombreAkohoActuel = lotResult.recordset[0].nombre_akoho;

            // Vérifier que la date de mortalité n'est pas antérieure à la date d'achat
            if (dateMaty < dateAchat) {
                throw new Error(
                    `Impossible: la date de mortalité (${dateMaty.toLocaleDateString('fr-FR')}) ` +
                    `est antérieure à la date d'achat du lot "${lotName}" ` +
                    `(${dateAchat.toLocaleDateString('fr-FR')}). ` +
                    `Le lot n'existait pas encore à cette date.`
                );
            }

            // Vérifier qu'il y a assez d'akoho vivants
            if (nombreAkohoActuel < akohoMatyData.nombre) {
                throw new Error(
                    `Impossible: le lot "${lotName}" n'a que ${nombreAkohoActuel} akoho(s) vivant(s), ` +
                    `mais vous essayez d'en déclarer ${akohoMatyData.nombre} mort(s)`
                );
            }

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
            const nouveauNombre = nombreAkohoActuel - akohoMatyData.nombre;
            return {
                message: `Akoho Maty créé avec succès ! ${akohoMatyData.nombre} akoho(s) mort(s) déclaré(s). Il reste ${nouveauNombre} akoho(s) vivant(s) dans le lot "${lotName}".`,
                akoho_maty: { id: insertedId, ...akohoMatyData },
                nombre_vivants_restants: nouveauNombre
            };
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

    /**
     * Retourne la liste des morts classée par date (du lot, jusqu'à date_bilan).
     * Chaque ligne : { date_maty: Date, nombre: number }
     */
    static async getDeathsByLotAndDate(lotId, dateBilan) {
        try {
            const pool = await Database.getPool();
            const request = pool.request();

            request.input('lot_id', Database.getSql().Int, lotId);
            request.input('date_bilan', Database.getSql().Date, dateBilan);

            const result = await request.query(`
                SELECT date_maty, SUM(nombre) AS nombre
                FROM Akoho_Maty
                WHERE lot_id = @lot_id AND date_maty <= @date_bilan
                GROUP BY date_maty
                ORDER BY date_maty ASC
            `);

            return result.recordset; // [{ date_maty, nombre }, ...]
        } catch (err) {
            console.error('Erreur récupération historique morts:', err);
            throw err;
        }
    }
}
