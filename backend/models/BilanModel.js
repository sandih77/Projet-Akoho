import LotModel from "./LotModel.js";
import AkohoMatyModel from "./AkohoMatyModel.js";
import AtodyModel from "./AtodyModel.js";

export default class BilanModel {

    /**
     * Calcule la durée exacte entre date_achat et date_bilan :
     * - Semaine 0 : jours 0-6 depuis date_achat
     * - Semaine 1 : jours 7-13, etc.
     * Retourne { semaines, jours, totalJours }
     */
    static calculateDuree(dateAchat, dateBilan) {
        const d1 = new Date(dateAchat);
        const d2 = new Date(dateBilan);
        // Ignorer l'heure pour comparer seulement les dates
        d1.setHours(0, 0, 0, 0);
        d2.setHours(0, 0, 0, 0);
        const totalJours = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
        const semaines = Math.floor(totalJours / 7);
        const jours = totalJours % 7;
        return { semaines, jours, totalJours };
    }

    /**
     * Calcule le sakafo total et la variation de poids totale en tenant compte
     * des semaines complètes et de la semaine partielle (pro-rata sur les jours restants).
     * configurations : tableau trié par semaine (0, 1, 2, ...)
     * semaines       : nombre de semaines complètes écoulées
     * jours          : jours restants dans la semaine courante (0..6)
     */
    static calculateSakafoAndPoids(configurations, semaines, jours) {
        let total_sakafo = 0;
        let total_variation = 0;

        for (const config of configurations) {
            if (config.semaine < semaines) {
                // Semaine complète
                total_sakafo += config.sakafo_semaine || 0;
                total_variation += config.variation_poids || 0;
            } else if (config.semaine === semaines && jours > 0) {
                // Semaine partielle : pro-rata (jours / 7)
                total_sakafo += (config.sakafo_semaine || 0) * (jours / 7);
                total_variation += (config.variation_poids || 0) * (jours / 7);
            }
        }

        return { total_sakafo, total_variation };
    }

    // Calculer les statistiques financières
    static calculateFinances(lotInfo, sakafoResult, totalAkohoMaty, totalAtody) {
        const nombreAkohoVivants = lotInfo.nombre_initial_akoho - totalAkohoMaty;

        // Coût du sakafo
        const sakafoCout = sakafoResult.total_sakafo * lotInfo.pu_sakafo_par_gramme;

        // Poids moyen = somme des variations de poids (poids total accumulé par akoho)
        const poidsMoyen = sakafoResult.total_variation;

        // Prix de vente total des akoho vivants
        const pvTotalAkoho = nombreAkohoVivants * poidsMoyen * lotInfo.pv_par_gramme;

        // Coût total des atody
        const coutTotalAtody = totalAtody * lotInfo.pu_atody;

        // Calculs financiers
        const revenustotaux = pvTotalAkoho + coutTotalAtody;
        const depensesTotales = lotInfo.cout_achat + sakafoCout;
        const benefices = revenustotaux - depensesTotales;

        return {
            nombre_akoho_vivants: nombreAkohoVivants,
            sakafo_poids: sakafoResult.total_sakafo,
            sakafo_cout: sakafoCout,
            poids_moyen: poidsMoyen,
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

            // 2. Calculer la durée exacte (semaines complètes + jours restants)
            const duree = this.calculateDuree(lotInfo.date_achat, dateBilan);

            // 3. Récupérer toutes les configurations du lot
            const configurations = await LotModel.getConfigurationsByLot(lotId);

            // 4. Calculer sakafo et poids avec gestion de la semaine partielle
            const sakafoResult = this.calculateSakafoAndPoids(
                configurations,
                duree.semaines,
                duree.jours
            );

            // 5. Récupérer le nombre d'akoho maty
            const totalAkohoMaty = await AkohoMatyModel.getTotalByLotAndDate(lotId, dateBilan);

            // 6. Récupérer le nombre d'atody
            const totalAtody = await AtodyModel.getTotalByLotAndDate(lotId, dateBilan);

            // 7. Calculer les finances
            const finances = this.calculateFinances(lotInfo, sakafoResult, totalAkohoMaty, totalAtody);

            // 8. Construire le bilan complet
            return {
                lot_id: lotInfo.lot_id,
                lot_name: lotInfo.lot_name,
                race_nom: lotInfo.race_nom,
                nombre_initial_akoho: lotInfo.nombre_initial_akoho,
                cout_achat: lotInfo.cout_achat,
                age_initial: lotInfo.age_initial,
                date_achat: lotInfo.date_achat,
                semaines_ecoulees: duree.semaines,
                jours_ecoules: duree.jours,
                total_jours: duree.totalJours,
                nombre_akoho_maty: totalAkohoMaty,
                ...finances
            };
        } catch (err) {
            console.error('Erreur récupération bilan:', err);
            throw err;
        }
    }
}