import LotModel from "./LotModel.js";
import AkohoMatyModel from "./AkohoMatyModel.js";
import AtodyModel from "./AtodyModel.js";

export default class BilanModel {

    // Calculer le nombre de semaines écoulées
    static calculateSemainesEcoulees(dateAchat, dateBilan) {
        const date1 = new Date(dateAchat);
        const date2 = new Date(dateBilan);
        const diffTime = Math.abs(date2 - date1);
        const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
        return diffWeeks;
    }

    // Calculer les statistiques financières
    static calculateFinances(lotInfo, sakafoData, totalAkohoMaty, totalAtody) {
        const nombreAkohoVivants = lotInfo.nombre_initial_akoho - totalAkohoMaty;
        
        // Coût du sakafo
        const sakafoCout = sakafoData.total_poids_sakafo * lotInfo.pu_sakafo_par_gramme;
        
        // Poids moyen par akoho
        const poidsMoyenParAkoho = nombreAkohoVivants > 0 
            ? sakafoData.poids_total_variation / nombreAkohoVivants 
            : 0;
        
        // Prix de vente des akoho
        const pvTotalAkoho = nombreAkohoVivants * sakafoData.poids_total_variation * lotInfo.pv_par_gramme;
        
        // Coût total des atody
        const coutTotalAtody = totalAtody * lotInfo.pu_atody;
        
        // Calculs financiers
        const revenustotaux = pvTotalAkoho + coutTotalAtody;
        const depensesTotales = lotInfo.cout_achat + sakafoCout;
        const benefices = revenustotaux - depensesTotales;
        
        return {
            nombre_akoho_vivants: nombreAkohoVivants,
            sakafo_poids: sakafoData.total_poids_sakafo,
            sakafo_cout: sakafoCout,
            poids_moyen_par_akoho: poidsMoyenParAkoho,
            pv_total_akoho: pvTotalAkoho,
            nombre_atody: totalAtody,
            cout_total_atody: coutTotalAtody,
            revenus_totaux: revenustotaux,
            depenses_totales: depensesTotales,
            benefices: benefices
        };
    }

    // Fonction principale pour obtenir le bilan complet
    static async getBilanByLotAndDate(lotId, dateBilan) {
        try {
            // 1. Récupérer les informations du lot avec race
            const lotInfo = await LotModel.getWithRaceInfo(lotId);
            if (!lotInfo) {
                return null;
            }
            
            // Vérifier que la date du bilan n'est pas antérieure à la date d'achat
            const dateAchat = new Date(lotInfo.date_achat);
            const dateBilanDate = new Date(dateBilan);
            
            if (dateBilanDate < dateAchat) {
                throw new Error(
                    `Impossible: la date du bilan (${dateBilanDate.toLocaleDateString('fr-FR')}) ` +
                    `est antérieure à la date d'achat du lot "${lotInfo.lot_name}" ` +
                    `(${dateAchat.toLocaleDateString('fr-FR')}). ` +
                    `Le lot n'existait pas encore à cette date.`
                );
            }

            // 2. Récupérer les données de sakafo
            const sakafoData = await LotModel.getSakafoByLotAndDate(lotId, dateBilan);

            // 3. Récupérer le nombre d'akoho maty
            const totalAkohoMaty = await AkohoMatyModel.getTotalByLotAndDate(lotId, dateBilan);

            // 4. Récupérer le nombre d'atody
            const totalAtody = await AtodyModel.getTotalByLotAndDate(lotId, dateBilan);

            // 5. Calculer les semaines écoulées
            const semainesEcoulees = this.calculateSemainesEcoulees(lotInfo.date_achat, dateBilan);

            // 6. Calculer les finances
            const finances = this.calculateFinances(lotInfo, sakafoData, totalAkohoMaty, totalAtody);

            // 7. Construire le bilan complet
            return {
                lot_id: lotInfo.lot_id,
                lot_name: lotInfo.lot_name,
                race_nom: lotInfo.race_nom,
                nombre_initial_akoho: lotInfo.nombre_initial_akoho,
                cout_achat: lotInfo.cout_achat,
                age_initial: lotInfo.age_initial,
                date_achat: lotInfo.date_achat,
                semaines_ecoulees: semainesEcoulees,
                nombre_akoho_maty: totalAkohoMaty,
                ...finances
            };
        } catch (err) {
            console.error('Erreur récupération bilan:', err);
            throw err;
        }
    }
}