# SUJET

# Race
- Race
- Pu sakafo par gramme
- Pv par gramme
- Pu Atody

# Lot
- Race
- Date
- Nombre d'akoho
- Age
- Prix d'achat

# Configuration
- Lot
- Variation de poids/semaine
- Sakafo/semaine
- Semaine

# Resultat attendu

## Date (Input)
- Lot
- Nombres akoho
- Cout d'achat
- Sakafo (prix, poids)
- Nombres akoho maty
- Poids moyen (Somme variations de poids)
- Pv akoho
- Nombre atody
- Cout atody
- Benefices

## Atody -> Akoho
- Lot
- Date
- Nombre (atody -> akoho) -> Lot 
- Atody tsy foy??

## Akoho maty
- Lot
- Date
- Nombre akoho maty

## Atody
- Lot
- Date
- Nombre atody

Maintenant on va gerer la table configuration pour avoir une meilleure bilan
poids moyen dans une lot = somme (variation_poids)
Dans bilan il faut avoir le nombre de semaine ecoulé exacte avec jours 
gerne 2 semaines et 5 jours 
donc il faut calculer son poids et son sakafoparsemaine juste pour 5 jours
genre on le divise par et 7 et multipliant par 5
Faut bien gerer aussi la semaine
Semaine 0 : commence par la date achat et ainsi de suite
exemple : date achat 13 avril
semaine0 : 13 avril au 20avril
semaine1 : 20 avril au 27avril
semaine3 : 27avril au 4mai 


getPoidsAkoho(race_id, date_debut, date_fin) retourne poids
```TypeScript
import LotModel from "./LotModel.js";
import AkohoMatyModel from "./AkohoMatyModel.js";
import AtodyModel from "./AtodyModel.js";
import RaceModel from "./RaceModel.js";

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
            if (config.semaine === 0) {
                // Semaine 0 = poids initial uniquement, jamais de sakafo
                total_variation += config.variation_poids || 0;

            } else if (config.semaine <= semaines) {
                // Semaine complète (semaine N≥1 est complète si N semaines se sont écoulées)
                total_sakafo += config.sakafo_semaine || 0;
                total_variation += config.variation_poids || 0;

            } else if (config.semaine === semaines + 1 && jours > 0) {
                // Semaine en cours (partielle) : pro-rata jours/7
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
        const sakafoCout = sakafoResult.total_sakafo * lotInfo.pu_sakafo_par_gramme * nombreAkohoVivants;

        const poids_Total_sakafo = sakafoResult.total_sakafo * nombreAkohoVivants;

        // Poids moyen = somme des variations de poids (poids total accumulé par akoho)
        const poidsMoyen = sakafoResult.total_variation;

        const poids_Moyen_Total = poidsMoyen * nombreAkohoVivants;

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
            sakafo_poids: poids_Total_sakafo,
            sakafo_cout: sakafoCout,
            poids_moyen: poidsMoyen,
            pv_total_akoho: pvTotalAkoho,
            nombre_atody: totalAtody,
            cout_total_atody: coutTotalAtody,
            revenus_totaux: revenustotaux,
            depenses_totales: depensesTotales,
            benefices: benefices,
            cout_achat: lotInfo.cout_achat,
            poids_Moyen_Total: poids_Moyen_Total
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
            const configurations = await RaceModel.getConfigurationsByRace(lotInfo.race_id);

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

    // Retourne le bilan de tous les lots pour une date donnée
    static async getAllBilans(dateBilan) {
        const lots = await LotModel.getAll();
        const results = [];
        for (const lot of lots) {
            try {
                const dateAchat = new Date(lot.date_achat);
                const dateBilanDate = new Date(dateBilan);
                dateAchat.setHours(0, 0, 0, 0);
                dateBilanDate.setHours(0, 0, 0, 0);
                if (dateBilanDate < dateAchat) {
                    // Lot pas encore acheté à cette date — ignorer
                    continue;
                }
                const bilan = await this.getBilanByLotAndDate(lot.id, dateBilan);
                if (bilan) results.push(bilan);
            } catch (err) {
                // Ignorer les lots qui génèrent une erreur (ex: pas de config)
                console.warn(`Bilan ignoré pour lot ${lot.id}: ${err.message}`);
            }
        }
        return results;
    }
}
```
import LotModel from "./LotModel.js";
import AkohoMatyModel from "./AkohoMatyModel.js";
import AtodyModel from "./AtodyModel.js";
import RaceModel from "./RaceModel.js";

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
        const totalJours = (Math.floor((d2 - d1) / (1000 * 60 * 60 * 24))) + 1;
        const semaines = Math.floor(totalJours / 7);
        const jours = totalJours % 7;
        return { semaines, jours, totalJours };
    }

    /**
     * Retourne le poids d'UN seul akoho de la race donnée
     * sur la période [date_debut, date_fin], en accumulant les
     * variations de poids de la configuration (semaine 0 incluse).
     *
     * @param {number} race_id
     * @param {string} date_debut  - date ISO ex: "2026-03-12"
     * @param {string} date_fin    - date ISO ex: "2026-04-02"
     * @returns {Promise<number>}  poids en grammes
     */
    static async getPoidsAkoho(race_id, date_debut, date_fin) {
        const configurations = await RaceModel.getConfigurationsByRace(race_id);

        const d1 = new Date(date_debut); d1.setHours(0, 0, 0, 0);
        const d2 = new Date(date_fin);   d2.setHours(0, 0, 0, 0);

        const totalJours = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
        const semaines   = Math.floor(totalJours / 7);
        const jours      = totalJours % 7;

        let poids = 0;
        for (const config of configurations) {
            if (config.semaine === 0) {
                // Poids de départ (éclos à date_debut)
                poids += config.variation_poids || 0;
            } else if (config.semaine <= semaines) {
                // Semaines complètes écoulées
                poids += config.variation_poids || 0;
            } else if (config.semaine === semaines + 1 && jours > 0) {
                // Semaine partielle : pro-rata jours/7
                poids += (config.variation_poids || 0) * (jours / 7);
            }
        }
        return poids;
    }

    /**
     * Calcule le poids moyen d'un akoho sur la période.
     *
     * Deux cas :
     * A) Lot acheté avec poids_initial défini :
     *    Base = poids_initial (la config semaine 0 est ignorée).
     *    On ajoute uniquement les variations accumulées depuis date_debut
     *    via getPoidsAkoho, en soustrayant la contribution de la semaine 0.
     *
     * B) Akoho éclos (poids_initial absent ou 0) :
     *    getPoidsAkoho(race_id, date_debut, date_fin) donne directement
     *    le poids complet (semaine 0 incluse).
     *
     * @param {Array}       configurations
     * @param {number}      semaines
     * @param {number}      jours
     * @param {number}      ageInitial
     * @param {number|null} poidsInitialLot
     * @param {number}      race_id
     * @param {string}      date_debut
     * @param {string}      date_fin
     * @returns {Promise<number>} poids d'un seul akoho en grammes
     */
    static async calculatePoids(configurations, semaines, jours, ageInitial, poidsInitialLot, race_id, date_debut, date_fin) {
        // Poids d'un akoho calculé via la config race (semaine 0 incluse)
        const poidsParAkoho = await this.getPoidsAkoho(race_id, date_debut, date_fin);

        const hasPoidsInitial = poidsInitialLot != null && Number(poidsInitialLot) > 0;
        if (hasPoidsInitial) {
            // Cas A : lot acheté — on retire la part semaine 0 de getPoidsAkoho
            // et on la remplace par le vrai poids_initial du lot
            const semaine0 = configurations.find(c => c.semaine === 0);
            const poids0   = semaine0 ? (semaine0.variation_poids || 0) : 0;
            return Number(poidsInitialLot) + (poidsParAkoho - poids0);
        }

        // Cas B : akoho éclos — on utilise directement le résultat
        return poidsParAkoho;
    }

    /**
     * Calcule le sakafo total (en grammes) consommé sur toute la période,
     * en tenant compte des morts au jour le jour.
     *
     * Pour chaque jour d (de 1 à totalJours) :
     *   - alive(d) = nombre_initial - morts dont la date est STRICTEMENT avant ce jour
     *     (les akoho morts le jour J mangent encore le jour J)
     *   - semaine applicable = ceil(d / 7)  → semaine 1 = jours 1-7, sem.2 = 8-14 …
     *   - sakafo_jour = (sakafo_semaine / 7) * alive(d)
     *
     * @param {Array}  configurations  - triées par semaine ASC
     * @param {number} nombreInitial   - nombre d'akoho au départ
     * @param {string} dateAchat       - date ISO du lot
     * @param {number} totalJours      - nb de jours entre achat et bilan
     * @param {Array}  deaths          - [{ date_maty: Date|string, nombre }] triées ASC
     */
    static calculateSakafoWithDeaths(configurations, nombreInitial, dateAchat, totalJours, deaths, ageInitial) {
        // Construire un map date (ms) → cumul morts jusqu'à cette date
        // On pré-calcule la liste triée des événements de mort
        const deathEvents = deaths.map(d => ({
            ms: new Date(d.date_maty).setHours(0, 0, 0, 0),
            nombre: Number(d.nombre)
        }));

        // Construire un map config par numéro de semaine
        const configMap = {};
        for (const c of configurations) {
            configMap[c.semaine] = c;
        }

        const baseDate = new Date(dateAchat);
        baseDate.setHours(0, 0, 0, 0);

        let totalSakafo = 0;
        let cumMorts = 0;        // morts dont la date < jour courant
        let deathIdx = 0;        // pointeur dans deathEvents

        for (let d = 1; d <= totalJours; d++) {
            // Date du jour courant
            const dayMs = baseDate.getTime() + d * 24 * 60 * 60 * 1000;

            // Avancer le curseur des morts : compter ceux dont date_maty < dayMs
            // (les akoho morts LE jour courant mangent encore ce jour-là)
            while (deathIdx < deathEvents.length && deathEvents[deathIdx].ms < dayMs) {
                cumMorts += deathEvents[deathIdx].nombre;
                deathIdx++;
            }

            const alive = Math.max(0, nombreInitial - cumMorts);

            // Numéro de semaine de configuration applicable
            const semaineNum = ageInitial + Math.ceil(d / 7);
            const config = configMap[semaineNum];
            if (!config) continue; // pas de config pour cette semaine → on ignore


            const sakafoJour = (config.sakafo_semaine / 7) * alive;
            totalSakafo += sakafoJour;
        }

        return totalSakafo; // grammes totaux consommés
    }

    // Calculer les statistiques financières
    static calculateFinances(lotInfo, totalSakafoGrammes, poidsMoyen, totalAkohoMaty, totalAtody) {
        const nombreAkohoVivants = lotInfo.nombre_initial_akoho - totalAkohoMaty;

        // Coût du sakafo = grammes réels consommés × prix au gramme
        const sakafoCout = totalSakafoGrammes * lotInfo.pu_sakafo_par_gramme;

        // Prix de vente total des akoho vivants
        const pvTotalAkoho = nombreAkohoVivants * poidsMoyen * lotInfo.pv_par_gramme;

        const poids_Moyen_Total = poidsMoyen * nombreAkohoVivants;
        // console.log(`Poids moyen total de tous les akoho vivants: ${poids_Moyen_Total} g`);

        // Coût total des atody
        const coutTotalAtody = totalAtody * lotInfo.pu_atody;

        // Calculs financiers
        const revenustotaux = pvTotalAkoho + coutTotalAtody;
        const depensesTotales = lotInfo.cout_achat + sakafoCout;
        const benefices = revenustotaux - depensesTotales;

        return {
            nombre_akoho_vivants: nombreAkohoVivants,
            sakafo_poids: totalSakafoGrammes,
            sakafo_cout: sakafoCout,
            poids_moyen: poidsMoyen,
            pv_total_akoho: pvTotalAkoho,
            nombre_atody: totalAtody,
            cout_total_atody: coutTotalAtody,
            revenus_totaux: revenustotaux,
            depenses_totales: depensesTotales,
            benefices: benefices,
            cout_achat: lotInfo.cout_achat,
            poids_Moyen_Total: poids_Moyen_Total
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
            const configurations = await RaceModel.getConfigurationsByRace(lotInfo.race_id);

            // 4. Calculer le poids moyen (par akoho vivant)
            const poidsMoyen = await this.calculatePoids(
                configurations,
                duree.semaines,
                duree.jours,
                lotInfo.age_initial,
                lotInfo.poids_initial,
                lotInfo.race_id,
                lotInfo.date_achat,
                dateBilan
            );

            // 5. Récupérer le nombre d'akoho maty (total) et l'historique par date
            const [totalAkohoMaty, deaths] = await Promise.all([
                AkohoMatyModel.getTotalByLotAndDate(lotId, dateBilan),
                AkohoMatyModel.getDeathsByLotAndDate(lotId, dateBilan)
            ]);

            // 6. Calculer le sakafo réel (jour par jour, tenant compte des morts)
            const totalSakafoGrammes = this.calculateSakafoWithDeaths(
                configurations,
                lotInfo.nombre_initial_akoho,
                lotInfo.date_achat,
                duree.totalJours,
                deaths,
                lotInfo.age_initial
            );

            // 7. Récupérer le nombre d'atody
            const totalAtody = await AtodyModel.getTotalByLotAndDate(lotId, dateBilan);

            // 8. Calculer les finances
            const finances = this.calculateFinances(lotInfo, totalSakafoGrammes, poidsMoyen, totalAkohoMaty, totalAtody);

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

    // Retourne le bilan de tous les lots pour une date donnée
    static async getAllBilans(dateBilan) {
        const lots = await LotModel.getAll();
        const results = [];
        for (const lot of lots) {
            try {
                const dateAchat = new Date(lot.date_achat);
                const dateBilanDate = new Date(dateBilan);
                dateAchat.setHours(0, 0, 0, 0);
                dateBilanDate.setHours(0, 0, 0, 0);
                if (dateBilanDate < dateAchat) {
                    // Lot pas encore acheté à cette date — ignorer
                    continue;
                }
                const bilan = await this.getBilanByLotAndDate(lot.id, dateBilan);
                if (bilan) results.push(bilan);
            } catch (err) {
                // Ignorer les lots qui génèrent une erreur (ex: pas de config)
                console.warn(`Bilan ignoré pour lot ${lot.id}: ${err.message}`);
            }
        }
        return results;
    }
}