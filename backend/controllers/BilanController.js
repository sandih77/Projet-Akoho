import BilanModel from "../models/BilanModel.js";

export default class BilanController {
    static async getAllBilans(req, res) {
        try {
            const { date_bilan } = req.query;
            if (!date_bilan) {
                return res.status(400).json({ error: 'Paramètre manquant', details: 'date_bilan est requis' });
            }
            const bilans = await BilanModel.getAllBilans(date_bilan);
            res.status(200).json(bilans);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur', details: err.message });
        }
    }

    static async getBilanByLotAndDate(req, res) {
        try {
            const { lot_id, date_bilan } = req.query;

            if (!lot_id || !date_bilan) {
                return res.status(400).json({
                    error: 'Paramètres manquants',
                    details: 'lot_id et date_bilan sont requis'
                });
            }

            const bilan = await BilanModel.getBilanByLotAndDate(lot_id, date_bilan);

            if (!bilan) {
                return res.status(404).json({
                    error: 'Lot non trouvé'
                });
            }

            res.status(200).json(bilan);
        } catch (err) {
            res.status(500).json({
                error: 'Erreur serveur',
                details: err.message
            });
        }
    }
}
