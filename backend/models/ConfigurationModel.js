import Database from "../config/db.js";

export default class ConfigurationModel {
    static async create(configData) {
        try {
            const pool = await Database.getPool();

            // Unicité (race_id, semaine) — vérification avant insertion
            const checkReq = pool.request();
            checkReq.input('race_id_chk',  Database.getSql().Int, configData.race_id);
            checkReq.input('semaine_chk', Database.getSql().Int, configData.semaine);
            const existing = await checkReq.query(
                'SELECT COUNT(*) AS cnt FROM Configuration WHERE race_id = @race_id_chk AND semaine = @semaine_chk'
            );
            if (existing.recordset[0].cnt > 0) {
                throw new Error(
                    `Une configuration existe déjà pour cette race à la semaine ${configData.semaine}. ` +
                    `Supprimez-la avant d'en créer une nouvelle.`
                );
            }

            const request = pool.request();
            request.input('race_id', Database.getSql().Int, configData.race_id);
            request.input('semaine', Database.getSql().Int, configData.semaine);
            request.input('variation_poids', Database.getSql().Decimal(10, 2), configData.variation_poids);
            request.input('sakafo_semaine', Database.getSql().Decimal(10, 2), configData.sakafo_semaine);

            const result = await request.query(`
                INSERT INTO Configuration (race_id, semaine, variation_poids, sakafo_semaine)
                VALUES (@race_id, @semaine, @variation_poids, @sakafo_semaine);
                SELECT SCOPE_IDENTITY() AS id;
            `);

            const insertedId = result.recordset[0].id;
            return { message: 'Configuration créée avec succès !', configuration: { id: insertedId, ...configData } };
        } catch (err) {
            console.error('Erreur création configuration:', err);
            throw err;
        }
    }

    static async getAll() {
        try {
            const pool = await Database.getPool();
            const result = await pool.request().query(`
                SELECT
                    c.id,
                    c.race_id,
                    r.nom AS race_nom,
                    c.semaine,
                    c.variation_poids,
                    c.sakafo_semaine
                FROM Configuration c
                INNER JOIN Race r ON c.race_id = r.id
                ORDER BY r.nom, c.semaine
            `);
            return result.recordset;
        } catch (err) {
            console.error('Erreur récupération configurations:', err);
            throw err;
        }
    }

    static async getByLot(lotId) {
        try {
            const pool = await Database.getPool();
            const request = pool.request();
            request.input('lot_id', Database.getSql().Int, lotId);
            const result = await request.query(`
                SELECT
                    c.id,
                    c.lot_id,
                    l.name AS lot_nom,
                    c.semaine,
                    c.variation_poids,
                    c.sakafo_semaine
                FROM Configuration c
                INNER JOIN Lot l ON c.lot_id = l.id
                WHERE c.lot_id = @lot_id
                ORDER BY c.semaine
            `);
            return result.recordset;
        } catch (err) {
            console.error('Erreur récupération configurations par lot:', err);
            throw err;
        }
    }

    static async deleteById(id) {
        try {
            const pool = await Database.getPool();
            const request = pool.request();
            request.input('id', Database.getSql().Int, id);
            await request.query('DELETE FROM Configuration WHERE id = @id');
            return { message: 'Configuration supprimée avec succès !' };
        } catch (err) {
            console.error('Erreur suppression configuration:', err);
            throw err;
        }
    }
}
