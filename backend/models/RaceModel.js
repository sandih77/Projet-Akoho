import Database from '../config/db.js';

export default class RaceModel {
    static async create(raceData) {
        try {
            const pool = await Database.getPool();
            const request = pool.request();

            request.input('nom', Database.getSql().VarChar, raceData.nom);
            request.input('pu_sakafo_par_gramme', Database.getSql().Decimal(10, 2), raceData.pu_sakafo_par_gramme);
            request.input('pv_par_gramme', Database.getSql().Decimal(10, 2), raceData.pv_par_gramme);
            request.input('pu_atody', Database.getSql().Decimal(10, 2), raceData.pu_atody);
            request.input('pourcentage_lamokany', Database.getSql().Decimal(5, 2), raceData.pourcentage_lamokany || 0);
            request.input('pourcentage_vavy', Database.getSql().Decimal(5, 2), raceData.pourcentage_vavy || 0);
            request.input('capacite_pondre', Database.getSql().Int, raceData.capacite_pondre || null);
            request.input('duree_incubation', Database.getSql().Int, raceData.duree_incubation || null);
            request.input('prix_achat', Database.getSql().Decimal(10, 2), raceData.prix_achat || null);
            request.input('pourcentage_vavy_maty', Database.getSql().Decimal(5, 2), raceData.pourcentage_vavy_maty || 0);

            await request.query(
                `INSERT INTO Race (nom, pu_sakafo_par_gramme, pv_par_gramme, pu_atody, duree_incubation, pourcentage_lamokany, pourcentage_vavy, capacite_pondre, prix_achat, pourcentage_vavy_maty)
         VALUES (@nom, @pu_sakafo_par_gramme, @pv_par_gramme, @pu_atody, @duree_incubation, @pourcentage_lamokany, @pourcentage_vavy, @capacite_pondre, @prix_achat, @pourcentage_vavy_maty)`
            );

            return { message: 'Race créée avec succès !', race: raceData };
        } catch (err) {
            console.error('Erreur création race:', err);
            throw err;
        }
    }

    static async getAll() {
        try {
            const pool = await Database.getPool();
            const result = await pool.request().query('SELECT * FROM Race');
            return result.recordset;
        } catch (err) {
            console.error('Erreur récupération races:', err);
            throw err;
        }
    }

    static async getConfigurationsByRace(race_id) {
        try {
            const pool = await Database.getPool();
            const request = pool.request();

            request.input('race_id', Database.getSql().Int, race_id);

            const result = await request.query(`
                SELECT semaine, variation_poids, sakafo_semaine
                FROM Configuration
                WHERE race_id = @race_id
                ORDER BY semaine ASC
            `);

            return result.recordset;
        } catch (err) {
            console.error('Erreur récupération configurations:', err);
            throw err;
        }
    }
}