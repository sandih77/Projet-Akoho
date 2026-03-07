import RaceModel from "../models/RaceModel.js";

export default class RaceController {
    static create(req, res) {
        const race = new RaceModel(
            req.body.nom,
            req.body.pu_sakafo_par_gramme,
            req.body.pv_par_gramme,
            req.body.pu_atody
        );
        RaceModel.create(race, (err, data) => {
            if (err) {
                res.status(500).send({ message: err.message });
                return;
            }
            res.send(data);
        });
    }
}