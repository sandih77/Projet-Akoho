import Database from "../config/db.js";
import AkohoMatyModel from "./AkohoMatyModel.js";
import EclosionModel from "./EclosionModel.js";
import LotModel from "./LotModel.js";

export default class AtodyModel {
    static async create(atodyData) {
        try {
            const pool = await Database.getPool();

            const lotInfo = await LotModel.getWithRaceInfo(atodyData.lot_id);
            if (!lotInfo) {
                throw new Error('Lot non trouvé');
            }

            const nombreAtodyDemande = Number(atodyData.nombre_atody) || 0;
            if (nombreAtodyDemande <= 0) {
                throw new Error('Le nombre d\'atody doit être supérieur à 0.');
            }

            const dateAchat = new Date(lotInfo.date_achat);
            const dateProduction = new Date(atodyData.date_production);
            const lotName = lotInfo.lot_name;

            if (dateProduction < dateAchat) {
                throw new Error(
                    `Impossible: la date de production (${dateProduction.toLocaleDateString('fr-FR')}) ` +
                    `est antérieure à la date d'achat du lot "${lotName}" ` +
                    `(${dateAchat.toLocaleDateString('fr-FR')}). ` +
                    `Le lot n'existait pas encore à cette date.`
                );
            }

            const capacite_pondre = Number(lotInfo.capacite_pondre) || 0;
            const matyInfo = await AkohoMatyModel.getNombreVavyMaty(atodyData.lot_id, atodyData.date_production);
            if (!matyInfo) {
                throw new Error('ERROR MATY');
            }

            const sumAtodyRequest = pool.request();
            sumAtodyRequest.input('lot_id', Database.getSql().Int, atodyData.lot_id);
            const sumResult = await sumAtodyRequest.query(
                'SELECT ISNULL(SUM(CASE WHEN nombre_atody > 0 THEN nombre_atody ELSE 0 END), 0) AS total_atody FROM Atody WHERE lot_id = @lot_id'
            );

            const totalAtodyActuel = Number(sumResult.recordset[0].total_atody) || 0;
            const totalApresAjout = totalAtodyActuel + nombreAtodyDemande;
            const maxAtody = ((Number(lotInfo.nombre_vavy) * capacite_pondre) - totalAtodyActuel) * ((Number(lotInfo.nombre_vavy) - matyInfo.total_vavy_maty) / Number(lotInfo.nombre_vavy));

            if (totalApresAjout > maxAtody) {
                throw new Error(
                    `Impossible: le lot "${lotName}" ne peut pas produire plus de ${maxAtody} atody ` +
                    `(${nombre_vavy} vavy x ${capacite_pondre} capacite). ` +
                    `Actuellement : ${totalAtodyActuel}, demande : +${nombreAtodyDemande}, total : ${totalApresAjout}`
                );
            }

            const request = pool.request();
            request.input('lot_id', Database.getSql().Int, atodyData.lot_id);
            request.input('date_production', Database.getSql().Date, atodyData.date_production);
            request.input('nombre_atody', Database.getSql().Int, nombreAtodyDemande);

            const result = await request.query(
                `INSERT INTO Atody (lot_id, date_production, nombre_atody)
                 VALUES (@lot_id, @date_production, @nombre_atody);
                 SELECT SCOPE_IDENTITY() AS id;`
            );

            const insertedId = result.recordset[0].id;

            try {
                const eclosionResult = await EclosionModel.create(atodyData.lot_id, atodyData.date_production);
                return {
                    message: 'Atody créé avec succès ! Éclosion créée automatiquement.',
                    atody: { id: insertedId, ...atodyData },
                    eclosion: eclosionResult
                };
            } catch (eclosionErr) {
                console.warn(`Atody créé (id: ${insertedId}) mais éclosion automatique échouée:`, eclosionErr.message);
                return {
                    message: 'Atody créé avec succès ! (Éclosion automatique non disponible - vérifiez les paramètres de la race)',
                    atody: { id: insertedId, ...atodyData },
                    eclosion_error: eclosionErr.message
                };
            }
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
                SELECT SUM(nombre_atody) as total_atody
                FROM Atody 
                WHERE lot_id = @lot_id AND date_production <= @date_bilan
            `);

            return result.recordset[0]?.total_atody || 0;
        } catch (err) {
            console.error('Erreur récupération total atody:', err);
            throw err;
        }
    }

    static async getTotalAtodyDejaPondu(lotId, dateBilan) {
        try {
            const pool = await Database.getPool();
            const request = pool.request();

            request.input('lot_id', Database.getSql().Int, lotId);
            request.input('date_bilan', Database.getSql().Date, dateBilan);

            const result = await request.query(`
                SELECT ISNULL(SUM(CASE WHEN nombre_atody > 0 THEN nombre_atody ELSE 0 END), 0) as total_atody
                FROM Atody 
                WHERE lot_id = @lot_id AND date_production <= @date_bilan
            `);

            return result.recordset[0]?.total_atody || 0;
        } catch (err) {
            console.error('Erreur récupération total atody:', err);
            throw err;
        }
    }

    static async getTotalByLotAndExactDate(lotId, dateProduction) {
        try {
            const pool = await Database.getPool();
            const request = pool.request();

            request.input('lot_id', Database.getSql().Int, lotId);
            request.input('date_production', Database.getSql().Date, dateProduction);

            const result = await request.query(`
                SELECT ISNULL(SUM(CASE WHEN nombre_atody > 0 THEN nombre_atody ELSE 0 END), 0) AS total_atody
                FROM Atody 
                WHERE lot_id = @lot_id AND date_production = @date_production
            `);

            return result.recordset[0]?.total_atody || 0;
        } catch (err) {
            console.error('Erreur récupération total atody par date exacte:', err);
            throw err;
        }
    }
}
