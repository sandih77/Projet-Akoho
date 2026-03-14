import EclosionModel from "../models/EclosionModel.js";
import { sendError } from "../utils/httpError.js";

export default class EclosionController {
    static async getAll(req, res) {
        try {
            const eclosion = await EclosionModel.getAll();
            res.status(200).json(eclosion);
        } catch (err) {
            return sendError(res, err);
        }
    }
}
