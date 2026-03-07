import { pool } from "mssql";
import Database from "../config/db.js";

export default class LotModel {
    static async create(lotData) {
        try {
            const pool = await Database.getPool();
            const request = pool.request();

            request.input('name', Database.getSql().VarChar, lotData.name);
            request.input('race_id', Database.getSql().Int, lotData.race_id);
            request.input('date_achat', Database.getSql().Date, lotData.date_achat);
            request.input('nombre_akoho', Database.getSql().Int, lotData.nombre_akoho);
            request.input('age', Database.getSql().Int, lotData.age);
            request.input('prix_achat', Database.getSql().Decimal(10, 2), lotData.prix_achat);

            const result = await request.query(
                `INSERT INTO Lot (name, race_id, date_achat, nombre_akoho, age, prix_achat)
                 VALUES (@name, @race_id, @date_achat, @nombre_akoho, @age, @prix_achat);
                 SELECT SCOPE_IDENTITY() AS id;`
            );

            const insertedId = result.recordset[0].id;
            return { message: 'Lot créé avec succès !', lot: { id: insertedId, ...lotData } };
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
                    Race.nom as race_nom,
                    Lot.date_achat, 
                    Lot.nombre_akoho, 
                    Lot.age, 
                    Lot.prix_achat
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

    static async getNbrAkoho() {
        try {
            const pool = await pool.request().query(`
                SELECT nombre_akoho FROM Lot;    
            `);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    }
}