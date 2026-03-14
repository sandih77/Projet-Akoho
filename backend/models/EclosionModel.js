import Database from "../config/db.js";
import AtodyModel from "./AtodyModel.js";
import LotModel from "./LotModel.js";

export default class EclosionModel {
    /**
     * Crée une éclosion automatique basée sur les paramètres de la race
     * @param {number} lotId - ID du lot mère
     * @param {string} datePondaison - date de pondaison (ISO) - la date est fournie depuis la création d'atody
     * @returns {Promise<object>} - résultat de l'éclosion
     */
    static async create(lotId, datePondaison) {
        try {
            const pool = await Database.getPool();
            const lotInfo = await LotModel.getWithRaceInfo(lotId);
            if (!lotInfo) {
                throw new Error('Lot non trouvé pour l\'éclosion automatique.');
            }

            const dureeEclosion = Number(lotInfo.duree_incubation) || 21; // Par défaut 21 jours

            // 2. Calculer la date d'éclosion à partir de la date de pondaison
            const datePondObj = new Date(datePondaison);
            datePondObj.setHours(0, 0, 0, 0);
            const dateEclosionObj = new Date(datePondObj.getTime() + (dureeEclosion + 1) * 24 * 60 * 60 * 1000);
            const dateEclosionISO = dateEclosionObj.toISOString().split('T')[0];

            console.log(`Date pondaison: ${datePondaison}, Durée éclosion: ${dureeEclosion} jours, Date éclosion: ${dateEclosionISO}`);

            // 3. Récupérer JUSTE les atody pondus à cette date exacte
            const totalAtody = await AtodyModel.getTotalByLotAndExactDate(lotId, datePondaison);
            console.log(`Total atody pondus le ${datePondaison} pour le lot ${lotId}: ${totalAtody}`);

            if (totalAtody <= 0) {
                throw new Error(`Aucun atody disponible pour ce lot à la date ${dateEclosionISO}`);
            }

            // 4. Calculer les nombres en fonction des pourcentages de la race
            const pourcentage_lamokany = Number(lotInfo.pourcentage_lamokany) || 0;
            const pourcentage_vavy = Number(lotInfo.pourcentage_vavy) || 0;

            const nombre_tsy_foy = Math.floor(totalAtody * (pourcentage_lamokany / 100));
            const nombre_foy = totalAtody - nombre_tsy_foy;
            const nombre_vavy = Math.floor(nombre_foy * (pourcentage_vavy / 100));
            const nombre_lahy = nombre_foy - nombre_vavy;

            console.log(`Éclosion automatique : ${totalAtody} atody → ${nombre_foy} foy, ${nombre_tsy_foy} tsy_foy`);
            console.log(`Sexe : ${nombre_vavy} vavy, ${nombre_lahy} lahy`);

            const race_id = lotInfo.race_id;
            console.log(lotInfo.lot_name)
            const nouveauLotNom = `Eclosion-${lotInfo.lot_name}-${dateEclosionISO}`;

            const createLotRequest = pool.request();
            createLotRequest.input('name', Database.getSql().VarChar, nouveauLotNom);
            createLotRequest.input('race_id', Database.getSql().Int, race_id);
            createLotRequest.input('date_achat', Database.getSql().Date, dateEclosionISO);
            createLotRequest.input('nombre_akoho', Database.getSql().Int, nombre_foy);
            createLotRequest.input('age', Database.getSql().Int, 0); 
            createLotRequest.input('prix_achat', Database.getSql().Decimal(10, 2), 0);
            createLotRequest.input('nombre_vavy', Database.getSql().Int, nombre_vavy);
            createLotRequest.input('nombre_lahy', Database.getSql().Int, nombre_lahy);

            const lotCreatedResult = await LotModel.create({
                name: nouveauLotNom,
                race_id: race_id,
                date_achat: dateEclosionISO,
                nombre_akoho: nombre_foy,
                age: 0,
                prix_achat: 0,
                nombre_vavy: nombre_vavy,
                nombre_lahy: nombre_lahy
            });

            const nouveauLotId = lotCreatedResult.lot.id;

            // 6. Enregistrer l'éclosion
            const eclosionRequest = pool.request();
            eclosionRequest.input('lot_id', Database.getSql().Int, lotId);
            eclosionRequest.input('date_eclosion', Database.getSql().Date, dateEclosionISO);
            eclosionRequest.input('nombre_foy', Database.getSql().Int, nombre_foy);
            eclosionRequest.input('nombre_tsy_foy', Database.getSql().Int, nombre_tsy_foy);

            const eclosionResult = await eclosionRequest.query(
                `INSERT INTO Eclosion (lot_id, date_eclosion, nombre_foy, nombre_tsy_foy)
                 VALUES (@lot_id, @date_eclosion, @nombre_foy, @nombre_tsy_foy);
                 SELECT SCOPE_IDENTITY() AS id;`
            );

            const eclosionId = eclosionResult.recordset[0].id;

            // 7. Déduire les atody du stock (directement en DB, pas via AtodyModel.create pour éviter boucle infinie)
            const sommeFoyTsyfoy = nombre_foy + nombre_tsy_foy;
            const atodyDeductRequest = pool.request();
            atodyDeductRequest.input('lot_id', Database.getSql().Int, lotId);
            atodyDeductRequest.input('date_production', Database.getSql().Date, dateEclosionISO);
            atodyDeductRequest.input('nombre_atody', Database.getSql().Int, -sommeFoyTsyfoy);

            await atodyDeductRequest.query(
                `INSERT INTO Atody (lot_id, date_production, nombre_atody)
                 VALUES (@lot_id, @date_production, @nombre_atody);`
            );

            return {
                message: `Éclosion automatique créée ! Lot "${nouveauLotNom}" (${nombre_vavy} vavy, ${nombre_lahy} lahy) créé avec ${nombre_foy} akoho(s).`,
                eclosion: {
                    id: eclosionId,
                    lot_id: lotId,
                    date_eclosion: dateEclosionISO,
                    nombre_foy: nombre_foy,
                    nombre_tsy_foy: nombre_tsy_foy
                },
                nouveau_lot: {
                    id: nouveauLotId,
                    name: nouveauLotNom,
                    race_id: race_id,
                    nombre_akoho: nombre_foy,
                    nombre_vavy: nombre_vavy,
                    nombre_lahy: nombre_lahy
                }
            };
        } catch (err) {
            console.error('Erreur création éclosion automatique:', err);
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
                    Lot.race_id,
                    Race.nom as race_nom,
                    Lot.nombre_akoho as lot_nombre_akoho,
                    Lot.nombre_vavy as lot_nombre_vavy,
                    Lot.nombre_lahy as lot_nombre_lahy,
                    Eclosion.date_eclosion, 
                    Eclosion.nombre_foy,
                    Eclosion.nombre_tsy_foy,
                    (Eclosion.nombre_foy + Eclosion.nombre_tsy_foy) as total_incubes,
                    CASE
                        WHEN (Eclosion.nombre_foy + Eclosion.nombre_tsy_foy) > 0
                            THEN CAST((Eclosion.nombre_foy * 100.0) / (Eclosion.nombre_foy + Eclosion.nombre_tsy_foy) AS DECIMAL(5, 2))
                        ELSE 0
                    END as taux_eclosion
                FROM Eclosion
                JOIN Lot ON Eclosion.lot_id = Lot.id
                JOIN Race ON Lot.race_id = Race.id
                ORDER BY Eclosion.date_eclosion DESC
            `);
            return result.recordset;
        } catch (err) {
            console.error('Erreur récupération eclosion:', err);
            throw err;
        }
    }
}
