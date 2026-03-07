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
}