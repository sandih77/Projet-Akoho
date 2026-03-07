import LotModel from "../models/LotModel.js";

export default class LotController {
    static async create(req, res) {
        try {
            const result = await LotModel.create(req.body);
            res.status(201).json(result);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur', details: err.message });
        }
    }

    static async getAll(req, res) {
        try {
            const lots = await LotModel.getAll();
            res.status(200).json(lots);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur', details: err.message });
        }
    }
}