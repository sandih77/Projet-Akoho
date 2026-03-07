import AtodyModel from "../models/AtodyModel.js";

export default class AtodyController {
    static async create(req, res) {
        try {
            const result = await AtodyModel.create(req.body);
            res.status(201).json(result);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur', details: err.message });
        }
    }

    static async getAll(req, res) {
        try {
            const atody = await AtodyModel.getAll();
            res.status(200).json(atody);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur', details: err.message });
        }
    }
}
