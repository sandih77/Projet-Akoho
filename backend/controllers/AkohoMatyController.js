import AkohoMatyModel from "../models/AkohoMatyModel.js";

export default class AkohoMatyController {
    static async create(req, res) {
        try {
            const result = await AkohoMatyModel.create(req.body);
            res.status(201).json(result);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur', details: err.message });
        }
    }

    static async getAll(req, res) {
        try {
            const akohoMaty = await AkohoMatyModel.getAll();
            res.status(200).json(akohoMaty);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur', details: err.message });
        }
    }
}
