import LotModel from "../models/LotModel";

export default class LotController {
    static create(req, res) {
        const { name, race_id, date_achat, nombre_akoho, age, prix_achat } = req.body;
        const lot = new LotModel(name, race_id, date_achat, nombre_akoho, age, prix_achat);
        LotModel.create(lot, (err, data) => {
            if (err) {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the lot."
                });
            } else {
                res.send(data);
            }
        });
    }
}