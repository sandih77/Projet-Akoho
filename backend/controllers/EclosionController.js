import EclosionModel from "../models/EclosionModel.js";

export default class EclosionController {
    static async create(req, res) {
        try {
            const result = await EclosionModel.create(req.body);
            res.status(201).json(result);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur', details: err.message });
        }
    }

    static async getAll(req, res) {
        try {
            const eclosion = await EclosionModel.getAll();
            res.status(200).json(eclosion);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur', details: err.message });
        }
    }
}
