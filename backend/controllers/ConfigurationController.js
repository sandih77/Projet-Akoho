import ConfigurationModel from "../models/ConfigurationModel.js";
import { sendError } from "../utils/httpError.js";

export default class ConfigurationController {
    static async create(req, res) {
        try {
            const result = await ConfigurationModel.create(req.body);
            res.status(201).json(result);
        } catch (err) {
            return sendError(res, err);
        }
    }

    static async getAll(req, res) {
        try {
            const configurations = await ConfigurationModel.getAll();
            res.status(200).json(configurations);
        } catch (err) {
            return sendError(res, err);
        }
    }

    static async getByLot(req, res) {
        try {
            const lotId = parseInt(req.params.lot_id);
            if (Number.isNaN(lotId)) {
                return res.status(400).json({
                    error: 'Paramètre invalide',
                    details: 'lot_id doit être un entier valide.',
                    code: 'HTTP_400'
                });
            }
            const configurations = await ConfigurationModel.getByLot(lotId);
            res.status(200).json(configurations);
        } catch (err) {
            return sendError(res, err);
        }
    }

    static async deleteById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (Number.isNaN(id)) {
                return res.status(400).json({
                    error: 'Paramètre invalide',
                    details: 'id doit être un entier valide.',
                    code: 'HTTP_400'
                });
            }
            const result = await ConfigurationModel.deleteById(id);
            res.status(200).json(result);
        } catch (err) {
            return sendError(res, err);
        }
    }
}
