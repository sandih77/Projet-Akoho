import AkohoMatyModel from "../models/AkohoMatyModel.js";
import { sendError } from "../utils/httpError.js";

export default class AkohoMatyController {
    static async create(req, res) {
        try {
            const result = await AkohoMatyModel.create(req.body);
            res.status(201).json(result);
        } catch (err) {
            return sendError(res, err);
        }
    }

    static async getAll(req, res) {
        try {
            const akohoMaty = await AkohoMatyModel.getAll();
            res.status(200).json(akohoMaty);
        } catch (err) {
            return sendError(res, err);
        }
    }
}
