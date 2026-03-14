import LotModel from "../models/LotModel.js";
import { sendError } from "../utils/httpError.js";

export default class LotController {
    static async create(req, res) {
        try {
            const result = await LotModel.create(req.body);
            res.status(201).json(result);
        } catch (err) {
            return sendError(res, err);
        }
    }

    static async getAll(req, res) {
        try {
            const lots = await LotModel.getAll();
            res.status(200).json(lots);
        } catch (err) {
            return sendError(res, err);
        }
    }
}