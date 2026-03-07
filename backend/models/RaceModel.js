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

            await request.query(
                `INSERT INTO Race (nom, pu_sakafo_par_gramme, pv_par_gramme, pu_atody)
         VALUES (@nom, @pu_sakafo_par_gramme, @pv_par_gramme, @pu_atody)`
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
}