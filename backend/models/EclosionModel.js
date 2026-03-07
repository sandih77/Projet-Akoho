import Database from "../config/db.js";
import AtodyModel from "./AtodyModel.js";

export default class EclosionModel {
    static async create(eclosionData) {
        try {
            const pool = await Database.getPool();
            
            // Vérifier que le lot existe et récupérer sa date d'achat
            const checkLotRequest = pool.request();
            checkLotRequest.input('lot_id', Database.getSql().Int, eclosionData.lot_id);
            const lotCheck = await checkLotRequest.query(
                'SELECT date_achat, name FROM Lot WHERE id = @lot_id'
            );
            
            if (lotCheck.recordset.length === 0) {
                throw new Error('Lot non trouvé');
            }
            
            const dateAchat = new Date(lotCheck.recordset[0].date_achat);
            const dateEclosion = new Date(eclosionData.date_eclosion);
            const lotName = lotCheck.recordset[0].name;
            
            // Vérifier que la date d'éclosion n'est pas antérieure à la date d'achat
            if (dateEclosion < dateAchat) {
                throw new Error(
                    `Impossible: la date d'éclosion (${dateEclosion.toLocaleDateString('fr-FR')}) ` +
                    `est antérieure à la date d'achat du lot "${lotName}" ` +
                    `(${dateAchat.toLocaleDateString('fr-FR')}). ` +
                    `Le lot n'existait pas encore à cette date.`
                );
            }
            
            const request = pool.request();
            request.input('lot_id', Database.getSql().Int, eclosionData.lot_id);
            request.input('date_eclosion', Database.getSql().Date, eclosionData.date_eclosion);
            request.input('nombre_foy', Database.getSql().Int, eclosionData.nombre_foy);

            // Vérifier le nombre total d'atody disponibles pour ce lot à cette date
            const totalAtody = await AtodyModel.getTotalByLotAndDate(
                eclosionData.lot_id, 
                eclosionData.date_eclosion
            );

            if (eclosionData.nombre_foy > totalAtody) {
                throw new Error(
                    `Impossible: le lot n'a que ${totalAtody} atody disponible(s) à cette date, ` +
                    `mais vous essayez d'en éclore ${eclosionData.nombre_foy}`
                );
            }

            // Récupérer les infos du lot mère (race, etc.)
            const lotMere = await pool.request()
                .input('lot_id_mere', Database.getSql().Int, eclosionData.lot_id)
                .query(`
                    SELECT L.name, L.race_id, R.nom as race_nom 
                    FROM Lot L 
                    INNER JOIN Race R ON L.race_id = R.id 
                    WHERE L.id = @lot_id_mere
                `);

            if (lotMere.recordset.length === 0) {
                throw new Error('Lot mère non trouvé');
            }

            const { race_id, name: lot_mere_name, race_nom } = lotMere.recordset[0];

            // Créer le nouvel lot à partir de l'éclosion
            const nouveauLotNom = `Eclosion-${lot_mere_name}-${new Date(eclosionData.date_eclosion).toISOString().split('T')[0]}`;
            
            const createLotRequest = pool.request();
            createLotRequest.input('name', Database.getSql().VarChar, nouveauLotNom);
            createLotRequest.input('race_id', Database.getSql().Int, race_id);
            createLotRequest.input('date_achat', Database.getSql().Date, eclosionData.date_eclosion);
            createLotRequest.input('nombre_akoho', Database.getSql().Int, eclosionData.nombre_foy);
            createLotRequest.input('age', Database.getSql().Int, 0); // Nouveau-nés = 0 semaines
            createLotRequest.input('prix_achat', Database.getSql().Decimal(10, 2), 0); // Pas d'achat

            const lotResult = await createLotRequest.query(`
                INSERT INTO Lot (name, race_id, date_achat, nombre_akoho, age, prix_achat)
                VALUES (@name, @race_id, @date_achat, @nombre_akoho, @age, @prix_achat);
                SELECT SCOPE_IDENTITY() AS nouveau_lot_id;
            `);

            const nouveauLotId = lotResult.recordset[0].nouveau_lot_id;

            // Insérer l'éclosion
            const result = await request.query(
                `INSERT INTO Eclosion (lot_id, date_eclosion, nombre_foy)
                 VALUES (@lot_id, @date_eclosion, @nombre_foy);
                 SELECT SCOPE_IDENTITY() AS id;`
            );

            // Insérer un enregistrement négatif dans Atody pour déduire les œufs éclos
            const atodyRequest = pool.request();
            atodyRequest.input('lot_id', Database.getSql().Int, eclosionData.lot_id);
            atodyRequest.input('date_production', Database.getSql().Date, eclosionData.date_eclosion);
            atodyRequest.input('nombre_atody', Database.getSql().Int, -eclosionData.nombre_foy);

            await atodyRequest.query(
                `INSERT INTO Atody (lot_id, date_production, nombre_atody)
                 VALUES (@lot_id, @date_production, @nombre_atody);`
            );

            const insertedId = result.recordset[0].id;
            return { 
                message: `Eclosion créée avec succès ! Nouveau lot "${nouveauLotNom}" (${race_nom}) créé avec ${eclosionData.nombre_foy} akoho(s). ${eclosionData.nombre_foy} atody déduits du stock.`, 
                eclosion: { id: insertedId, ...eclosionData },
                nouveau_lot: {
                    id: nouveauLotId,
                    name: nouveauLotNom,
                    race_id: race_id,
                    nombre_akoho: eclosionData.nombre_foy
                },
                atody_deduits: eclosionData.nombre_foy
            };
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
