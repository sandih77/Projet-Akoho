import Database from "../config/db.js";
import LotModel from "./LotModel.js";

export default class AkohoMatyModel {

    static async create(akohoMatyData) {
        try {
            const pool = await Database.getPool();

            const raceInfo = await LotModel.getWithRaceInfo(akohoMatyData.lot_id);

            if (!raceInfo) {
                throw new Error("Race introuvable");
            }

            const nombreVavyMaty = await this.getNombreVavyMaty(akohoMatyData.lot_id, akohoMatyData.date_maty);
            const nombreLahyMaty = await this.getNombreLahyMaty(akohoMatyData.lot_id, akohoMatyData.date_maty);


            const nombre_vavy_calc = Math.floor(
                akohoMatyData.nombre * (raceInfo.pourcentage_vavy_maty / 100)
            );

            const nombre_lahy_calc = akohoMatyData.nombre - nombre_vavy_calc;

            const bothProvidedAndNonZero =
                akohoMatyData.nombre_vavy > 0 || akohoMatyData.nombre_lahy > 0;

            let nombre_vavy, nombre_lahy;

            const nombreVavyActuelle = raceInfo.nombre_vavy - nombreVavyMaty;
            const nombreLahyActuel = raceInfo.nombre_lahy - nombreLahyMaty;
            console.log(nombreLahyActuel, nombreVavyActuelle);

            if (bothProvidedAndNonZero) {
                nombre_vavy = akohoMatyData.nombre_vavy;
                nombre_lahy = akohoMatyData.nombre_lahy;
            } else {
                nombre_vavy = Math.min(nombre_vavy_calc, nombreVavyActuelle);
                nombre_lahy = Math.min(nombre_lahy_calc, nombreLahyActuel);

                let total_calcule = nombre_vavy + nombre_lahy;

                if (total_calcule < akohoMatyData.nombre) {
                    let reste = akohoMatyData.nombre - total_calcule;

                    const dispo_vavy = nombreVavyActuelle - nombre_vavy;
                    const dispo_lahy = nombreLahyActuel - nombre_lahy;

                    if (dispo_lahy > 0) {
                        const ajout = Math.min(reste, dispo_lahy);
                        nombre_lahy += ajout;
                        reste -= ajout;
                    }

                    if (reste > 0 && dispo_vavy > 0) {
                        const ajout = Math.min(reste, dispo_vavy);
                        nombre_vavy += ajout;
                        reste -= ajout;
                    }
                }
            }

            const total_sexe = nombre_vavy + nombre_lahy;

            if (total_sexe !== akohoMatyData.nombre) {
                throw new Error(
                    `Erreur de cohérence : nombre_vavy (${nombre_vavy}) + nombre_lahy (${nombre_lahy}) = ${total_sexe} ` +
                    `ne correspond pas à nombre_akoho (${akohoMatyData.nombre}).`
                );
            }

            if (nombre_vavy < 0 || nombre_lahy < 0) {
                throw new Error(
                    `Erreur: les nombres doivent être positifs.`
                );
            }

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

            // 🔹 Vérification date
            if (dateMaty < dateAchat) {
                throw new Error(
                    `Impossible: date de mortalité (${dateMaty.toLocaleDateString('fr-FR')}) ` +
                    `avant achat (${dateAchat.toLocaleDateString('fr-FR')})`
                );
            }

            // 🔹 Vérification stock total
            if (nombreAkohoActuel < akohoMatyData.nombre) {
                throw new Error(
                    `Impossible: seulement ${nombreAkohoActuel} vivant(s), ` +
                    `mais ${akohoMatyData.nombre} demandé(s)`
                );
            }

            // 🔹 INSERT
            const request = pool.request();
            request.input('lot_id', Database.getSql().Int, akohoMatyData.lot_id);
            request.input('date_maty', Database.getSql().Date, akohoMatyData.date_maty);
            request.input('nombre', Database.getSql().Int, akohoMatyData.nombre);
            request.input('nombre_lahy', Database.getSql().Int, nombre_lahy);
            request.input('nombre_vavy', Database.getSql().Int, nombre_vavy);

            const result = await request.query(`
                INSERT INTO Akoho_Maty (lot_id, date_maty, nombre, nombre_lahy, nombre_vavy)
                VALUES (@lot_id, @date_maty, @nombre, @nombre_lahy, @nombre_vavy);
                SELECT SCOPE_IDENTITY() AS id;
            `);

            // 🔹 Mise à jour du lot (IMPORTANT 🔥)
            const nouveauNombre = nombreAkohoActuel - akohoMatyData.nombre;

            await pool.request()
                .input('lot_id', Database.getSql().Int, akohoMatyData.lot_id)
                .input('nombre', Database.getSql().Int, nouveauNombre)
                .query(`
                    UPDATE Lot 
                    SET nombre_akoho = @nombre
                    WHERE id = @lot_id
                `);

            return {
                message: `Succès : ${akohoMatyData.nombre} mort(s). Reste ${nouveauNombre} vivant(s) dans "${lotName}".`,
                akoho_maty: {
                    id: result.recordset[0].id,
                    lot_id: akohoMatyData.lot_id,
                    nombre: akohoMatyData.nombre,
                    nombre_lahy,
                    nombre_vavy
                },
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
            throw err;
        }
    }

    static async getTotalByLotAndDate(lotId, dateBilan) {
        try {
            const pool = await Database.getPool();

            const result = await pool.request()
                .input('lot_id', Database.getSql().Int, lotId)
                .input('date_bilan', Database.getSql().Date, dateBilan)
                .query(`
                    SELECT ISNULL(SUM(nombre), 0) AS total_akoho_maty
                    FROM Akoho_Maty 
                    WHERE lot_id = @lot_id AND date_maty <= @date_bilan
                `);

            return result.recordset[0]?.total_akoho_maty || 0;
        } catch (err) {
            throw err;
        }
    }

    static async getDeathsByLotAndDate(lotId, dateBilan) {
        try {
            const pool = await Database.getPool();

            const result = await pool.request()
                .input('lot_id', Database.getSql().Int, lotId)
                .input('date_bilan', Database.getSql().Date, dateBilan)
                .query(`
                    SELECT date_maty, SUM(nombre) AS nombre
                    FROM Akoho_Maty
                    WHERE lot_id = @lot_id AND date_maty <= @date_bilan
                    GROUP BY date_maty
                    ORDER BY date_maty ASC
                `);

            return result.recordset;
        } catch (err) {
            throw err;
        }
    }

    static async getNombreVavyMaty(lotId, dateBilan) {
        try {
            const pool = await Database.getPool();

            const result = await pool.request()
                .input('lot_id', Database.getSql().Int, lotId)
                .input('date_bilan', Database.getSql().Date, dateBilan)
                .query(`
                    SELECT ISNULL(SUM(nombre_vavy), 0) AS total_vavy_maty
                    FROM Akoho_Maty 
                    WHERE lot_id = @lot_id AND date_maty <= @date_bilan
                `);

            return result.recordset[0].total_vavy_maty;
        } catch (err) {
            throw err;
        }
    }

    static async getNombreLahyMaty(lotId, dateBilan) {
        try {
            const pool = await Database.getPool();

            const result = await pool.request()
                .input('lot_id', Database.getSql().Int, lotId)
                .input('date_bilan', Database.getSql().Date, dateBilan)
                .query(`
                    SELECT ISNULL(SUM(nombre_lahy), 0) AS total_lahy_maty
                    FROM Akoho_Maty 
                    WHERE lot_id = @lot_id AND date_maty <= @date_bilan
                `);

            return result.recordset[0].total_lahy_maty;
        } catch (err) {
            throw err;
        }
    }
}