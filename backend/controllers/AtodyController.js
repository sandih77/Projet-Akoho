import AtodyModel from "../models/AtodyModel.js";
import { sendError } from "../utils/httpError.js";

export default class AtodyController {
    static async create(req, res) {
        try {
            const result = await AtodyModel.create(req.body);
            res.status(201).json(result);
        } catch (err) {
            return sendError(res, err);
        }
    }

    static async getAll(req, res) {
        try {
            const atody = await AtodyModel.getAll();
            res.status(200).json(atody);
        } catch (err) {
            return sendError(res, err);
        }
    }
}
