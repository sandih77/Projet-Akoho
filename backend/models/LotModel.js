import Database from "../config/db.js";

export default class LotModel {

    static async create(lotData) {
        try {
            const pool = await Database.getPool();
            const request = pool.request();

            let prixAchat = lotData.prix_achat;

            // Si prix_achat n'est pas fourni (null/undefined) ET ce n'est pas un lot éclos, calculer depuis la race
            const isLotEclos = lotData.name && lotData.name.startsWith('Eclosion-');
            const raceInfo = await this.getRaceById(lotData.race_id);

            if (!raceInfo) {
                throw new Error("Race introuvable");
            }

            // Calculer prix seulement si : prix non fourni ET pas un lot éclos
            if ((lotData.prix_achat === null || lotData.prix_achat === 0) && !isLotEclos) {
                prixAchat = raceInfo.prix_achat * lotData.nombre_akoho;
            }

            // Calculer les nombres de vavy/lahy basés sur le pourcentage de la race
            const nombre_vavy_calc = Math.floor(
                lotData.nombre_akoho * (raceInfo.pourcentage_vavy / 100)
            );

            const nombre_lahy_calc = lotData.nombre_akoho - nombre_vavy_calc;

            // Vérifier si les deux valeurs ont été fournies ET sont > 0
            const bothProvidedAndNonZero = lotData.nombre_vavy > 0 || lotData.nombre_lahy > 0;

            let nombre_vavy, nombre_lahy;

            if (bothProvidedAndNonZero) {
                // Les deux sont fournis ET > 0 : utiliser les valeurs fournies
                nombre_vavy = lotData.nombre_vavy;
                nombre_lahy = lotData.nombre_lahy;
            } else {
                // Sinon, utiliser les valeurs calculées (évite de mélanger)
                nombre_vavy = nombre_vavy_calc;
                nombre_lahy = nombre_lahy_calc;
            }

            // Vérifier la cohérence : la somme doit égaler nombre_akoho
            const total_sexe = nombre_vavy + nombre_lahy;
            if (total_sexe !== lotData.nombre_akoho) {
                throw new Error(
                    `Erreur de cohérence : nombre_vavy (${nombre_vavy}) + nombre_lahy (${nombre_lahy}) = ${total_sexe} ` +
                    `ne correspond pas à nombre_akoho (${lotData.nombre_akoho}). ` +
                    `Vérifiez les nombres fournis ou laissez-les vides pour un calcul automatique basé sur le pourcentage vavy de la race (${raceInfo.pourcentage_vavy}%).`
                );
            }

            // Vérifier que les nombres sont positifs
            if (nombre_vavy < 0 || nombre_lahy < 0) {
                throw new Error(
                    `Erreur: les nombres de vavy (${nombre_vavy}) et lahy (${nombre_lahy}) doivent être positifs.`
                );
            }

            request.input('name', Database.getSql().VarChar, lotData.name);
            request.input('race_id', Database.getSql().Int, lotData.race_id);
            request.input('date_achat', Database.getSql().Date, lotData.date_achat);
            request.input('nombre_akoho', Database.getSql().Int, lotData.nombre_akoho);
            request.input('age', Database.getSql().Int, lotData.age);
            request.input('prix_achat', Database.getSql().Decimal(10, 2), prixAchat);
            request.input('poids_initial', Database.getSql().Decimal(10, 2), lotData.poids_initial || null);
            request.input('nombre_vavy', Database.getSql().Int, nombre_vavy);
            request.input('nombre_lahy', Database.getSql().Int, nombre_lahy);

            const result = await request.query(`
                INSERT INTO Lot (name, race_id, date_achat, nombre_akoho, age, prix_achat, poids_initial, nombre_vavy, nombre_lahy)
                VALUES (@name, @race_id, @date_achat, @nombre_akoho, @age, @prix_achat, @poids_initial, @nombre_vavy, @nombre_lahy);
                SELECT SCOPE_IDENTITY() AS id;
            `);

            const insertedId = result.recordset[0].id;

            return {
                message: 'Lot créé avec succès !',
                lot: {
                    id: insertedId,
                    ...lotData,
                    nombre_vavy: nombre_vavy,
                    nombre_lahy: nombre_lahy,
                    prix_achat: prixAchat
                }
            };

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
                    Lot.prix_achat,
                    Lot.nombre_vavy,
                    Lot.nombre_lahy
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
                    L.nombre_vavy,
                    L.nombre_lahy,
                    R.id AS race_id,
                    R.nom AS race_nom,
                    R.pu_sakafo_par_gramme,
                    R.pv_par_gramme,
                    R.pu_atody,
                    R.duree_incubation,
                    R.pourcentage_lamokany,
                    R.pourcentage_vavy,
                    R.prix_achat,
                    R.capacite_pondre
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


    static async getRaceById(raceId) {
        const pool = await Database.getPool();
        const request = pool.request();

        request.input("id", Database.getSql().Int, raceId);

        const result = await request.query(`
            SELECT * FROM Race WHERE id = @id
        `);

        return result.recordset[0] || null;
    }

}