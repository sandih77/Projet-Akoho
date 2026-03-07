import RaceModel from '../models/RaceModel.js';

export default class RaceController {
    static async create(req, res) {
        try {
            const result = await RaceModel.create(req.body);
            res.status(201).json(result);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur', details: err.message });
        }
    }

    static async getAll(req, res) {
        try {
            const races = await RaceModel.getAll();
            res.status(200).json(races);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur', details: err.message });
        }
    }
}