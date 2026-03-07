import ConfigurationModel from "../models/ConfigurationModel.js";

export default class ConfigurationController {
    static async create(req, res) {
        try {
            const result = await ConfigurationModel.create(req.body);
            res.status(201).json(result);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur', details: err.message });
        }
    }

    static async getAll(req, res) {
        try {
            const configurations = await ConfigurationModel.getAll();
            res.status(200).json(configurations);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur', details: err.message });
        }
    }

    static async getByLot(req, res) {
        try {
            const lotId = parseInt(req.params.lot_id);
            const configurations = await ConfigurationModel.getByLot(lotId);
            res.status(200).json(configurations);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur', details: err.message });
        }
    }

    static async deleteById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await ConfigurationModel.deleteById(id);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur', details: err.message });
        }
    }
}
