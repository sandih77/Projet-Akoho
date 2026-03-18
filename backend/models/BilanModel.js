import Database from "../config/db.js";
import LotModel from "./LotModel.js";
import AkohoMatyModel from "./AkohoMatyModel.js";
import AtodyModel from "./AtodyModel.js";
import RaceModel from "./RaceModel.js";

export default class BilanModel {

    static calculateDuree(dateAchat, dateBilan) {
        const d1 = new Date(dateAchat);
        const d2 = new Date(dateBilan);
        d1.setHours(0, 0, 0, 0);
        d2.setHours(0, 0, 0, 0);
        const totalJours = (Math.floor((d2 - d1) / (1000 * 60 * 60 * 24))) + 1;
        const semaines = Math.floor(totalJours / 7);
        const jours = totalJours % 7;
        return { semaines, jours, totalJours };
    }

    static async getPoidsAkoho(raceId, dateDebut, dateFin, lotId = null) {
        try {
            const pool = await Database.getPool();
            const request = pool.request();

            request.input('race_id', Database.getSql().Int, raceId);
            request.input('date_debut', Database.getSql().Date, dateDebut);
            request.input('date_fin', Database.getSql().Date, dateFin);

            let query = `
                SELECT id, date_achat, nombre_akoho, age, poids_initial
                FROM Lot
                WHERE race_id = @race_id 
                  AND date_achat <= @date_fin
                  AND date_achat >= @date_debut
            `;

            if (lotId) {
                request.input('lot_id', Database.getSql().Int, lotId);
                query += ` AND id = @lot_id`;
            }

            const lotsResult = await request.query(query);

            if (lotsResult.recordset.length === 0) {
                return 0;
            }

            const configurations = await RaceModel.getConfigurationsByRace(raceId);

            let totalPoids = 0;
            let totalLots = 0;

            for (const lot of lotsResult.recordset) {
                const duree = this.calculateDuree(lot.date_achat, dateFin);
                const poids = this.calculatePoidsIndividuel(configurations, duree.semaines, duree.jours, lot.age, lot.poids_initial);
                totalPoids += poids;
                console.log(`Lot ${lot.id}: poids calculé = ${poids.toFixed(2)}g`);
                totalLots++;
            }

            return totalLots > 0 ? totalPoids / totalLots : 0;
        } catch (err) {
            console.error('Erreur récupération poids akoho:', err);
            throw err;
        }
    }

    static calculatePoidsIndividuel(configurations, semaines, jours, ageInitial, poidsInitialLot) {
        const hasPoidsInitial = poidsInitialLot != null && Number(poidsInitialLot) > 0;

        // Créer un map des configurations et trouver la dernière
        const configMap = {};
        let lastConfig = null;
        for (const config of configurations) {
            configMap[config.semaine] = config;
            if (!lastConfig || config.semaine > lastConfig.semaine) {
                lastConfig = config;
            }
        }

        let baseWeight;
        if (hasPoidsInitial) {
            baseWeight = Number(poidsInitialLot);
        } else {
            baseWeight = 0;
            for (const config of configurations) {
                if (config.semaine <= ageInitial) {
                    baseWeight += config.variation_poids || 0;
                }
            }
        }

        let total_variation = 0;
        const startWeek = ageInitial + 1;
        const endWeek = ageInitial + semaines;

        for (let week = startWeek; week <= endWeek; week++) {
            // Utiliser la configuration de la semaine ou la dernière si pas disponible
            const config = configMap[week] || lastConfig;
            if (config) {
                total_variation += config.variation_poids || 0;
            }
        }

        // Pour les jours supplémentaires (semaine partielle)
        if (jours > 0) {
            const nextWeekConfig = configMap[endWeek + 1] || lastConfig;
            if (nextWeekConfig) {
                total_variation += (nextWeekConfig.variation_poids || 0) * (jours / 7);
            }
        }

        console.log(baseWeight, total_variation, ageInitial, semaines);

        return baseWeight + total_variation;
    }

    static calculateResteAPondre(nombreVavyInitial, capacitePondre, atodyEvents, vavyMatyEvents) {
        // Combine and sort all events chronologically
        // IMPORTANT: Filtrer pour ne garder que les productions (nombre_atody > 0)
        // Les éclosions (valeurs négatives) ne doivent pas être comptées
        const allEvents = [
            ...atodyEvents.filter(e => Number(e.nombre_atody) > 0).map(e => ({
                date: new Date(e.date_production).getTime(),
                type: 'ponte',
                nombre: Number(e.nombre_atody)
            })),
            ...vavyMatyEvents.map(e => ({
                date: new Date(e.date_maty).getTime(),
                type: 'mort',
                nombre_vavy: Number(e.nombre_vavy)
            }))
        ].sort((a, b) => a.date - b.date);

        let nombreVavyActuel = nombreVavyInitial;
        let totalPondu = 0;
        let capaciteRestante = nombreVavyInitial * capacitePondre;

        for (const event of allEvents) {
            if (event.type === 'ponte') {
                totalPondu += event.nombre;
                capaciteRestante -= event.nombre;
            } else if (event.type === 'mort') {
                if (nombreVavyActuel > 0) {
                    // Calculate average eggs laid per vavy so far
                    const moyennePonduParVavy = totalPondu / nombreVavyActuel;
                    // Each dead vavy loses their remaining capacity
                    const resteParVavy = capacitePondre - moyennePonduParVavy;
                    const pertePotentiel = event.nombre_vavy * resteParVavy;

                    capaciteRestante -= pertePotentiel;
                    nombreVavyActuel -= event.nombre_vavy;
                }
            }
        }

        return Math.max(0, capaciteRestante);
    }

    static calculateSakafoWithDeaths(configurations, nombreInitial, dateAchat, totalJours, deaths, ageInitial) {
        const deathEvents = deaths.map(d => ({
            ms: new Date(d.date_maty).setHours(0, 0, 0, 0),
            nombre: Number(d.nombre)
        }));

        const configMap = {};
        let lastConfig = null;
        for (const c of configurations) {
            configMap[c.semaine] = c;
            // Garder la dernière configuration (celle avec la plus grande semaine)
            if (!lastConfig || c.semaine > lastConfig.semaine) {
                lastConfig = c;
            }
        }

        const baseDate = new Date(dateAchat);
        baseDate.setHours(0, 0, 0, 0);

        let totalSakafo = 0;
        let cumMorts = 0;
        let deathIdx = 0;

        for (let d = 1; d <= totalJours; d++) {
            const dayMs = (baseDate.getTime() + (d) * 24 * 60 * 60 * 1000);

            while (deathIdx < deathEvents.length && deathEvents[deathIdx].ms < dayMs) {
                cumMorts += deathEvents[deathIdx].nombre;
                deathIdx++;
            }

            const alive = Math.max(0, nombreInitial - cumMorts);

            const semaineNum = ageInitial + Math.ceil(d / 7);
            // Utiliser la configuration de la semaine ou la dernière si pas disponible
            const config = configMap[semaineNum] || lastConfig;
            if (!config) continue;


            const sakafoJour = (config.sakafo_semaine / 7) * alive;
            totalSakafo += sakafoJour;
        }

        return totalSakafo;
    }

    static calculateFinances(lotInfo, totalSakafoGrammes, poidsMoyen, totalAkohoMaty, totalAtody, totalVavyMaty, totalLahyMaty, totalAtodyDejaPondu, resteAPondre) {
        const nombreAkohoVivants = lotInfo.nombre_initial_akoho - totalAkohoMaty;

        // Limiter les nombres vavy/lahy vivants à ne pas être négatifs
        const nombreVavyVivants = Math.max(0, lotInfo.nombre_vavy - totalVavyMaty);
        const nombreLahyVivants = Math.max(0, lotInfo.nombre_lahy - totalLahyMaty);

        const sakafoCout = totalSakafoGrammes * lotInfo.pu_sakafo_par_gramme;

        // Prix de vente différenciés pour lahy et vavy
        const pvParGrammeLahy = lotInfo.pv_par_gramme_lahy || lotInfo.pv_par_gramme;
        const pvParGrammeVavy = lotInfo.pv_par_gramme_vavy || lotInfo.pv_par_gramme;

        const pvTotalLahy = nombreLahyVivants * poidsMoyen * pvParGrammeLahy;
        const pvTotalVavy = nombreVavyVivants * poidsMoyen * pvParGrammeVavy;
        const pvTotalAkoho = pvTotalLahy + pvTotalVavy;

        const poids_Moyen_Total = poidsMoyen * nombreAkohoVivants;

        const coutTotalAtody = totalAtody * lotInfo.pu_atody;

        const nombreMaxAtody = lotInfo.nombre_vavy * lotInfo.capacite_pondre;

        const revenustotaux = pvTotalAkoho + coutTotalAtody;
        const depensesTotales = lotInfo.cout_achat + sakafoCout;
        const benefices = revenustotaux - depensesTotales;

        return {
            nombre_akoho_vivants: nombreAkohoVivants,
            nombre_vavy_vivants: nombreVavyVivants,
            nombre_lahy_vivants: nombreLahyVivants,
            nombre_max_atody: nombreMaxAtody,
            reste_a_pondre: resteAPondre,
            sakafo_poids: totalSakafoGrammes,
            sakafo_cout: sakafoCout,
            poids_moyen: poidsMoyen,
            pv_total_akoho: pvTotalAkoho,
            pv_total_lahy: pvTotalLahy,
            pv_total_vavy: pvTotalVavy,
            pv_par_gramme_lahy: pvParGrammeLahy,
            pv_par_gramme_vavy: pvParGrammeVavy,
            nombre_atody: totalAtody,
            cout_total_atody: coutTotalAtody,
            revenus_totaux: revenustotaux,
            depenses_totales: depensesTotales,
            benefices: benefices,
            cout_achat: lotInfo.cout_achat,
            poids_Moyen_Total: poids_Moyen_Total
        };
    }

    static async getBilanByLotAndDate(lotId, dateBilan) {
        try {
            const lotInfo = await LotModel.getWithRaceInfo(lotId);
            if (!lotInfo) {
                return null;
            }

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

            const duree = this.calculateDuree(lotInfo.date_achat, dateBilan);

            const configurations = await RaceModel.getConfigurationsByRace(lotInfo.race_id);

            const poidsMoyen = await this.getPoidsAkoho(lotInfo.race_id, lotInfo.date_achat, dateBilan, lotId);

            const [totalAkohoMaty, deaths, vavyMatyResult] = await Promise.all([
                AkohoMatyModel.getTotalByLotAndDate(lotId, dateBilan),
                AkohoMatyModel.getDeathsByLotAndDate(lotId, dateBilan),
                AkohoMatyModel.getNombreVavyMaty(lotId, dateBilan)
            ]);

            const totalVavyMaty = vavyMatyResult;
            const totalLahyMaty = totalAkohoMaty - totalVavyMaty;
            console.log(totalVavyMaty);

            const totalSakafoGrammes = this.calculateSakafoWithDeaths(
                configurations,
                lotInfo.nombre_initial_akoho,
                lotInfo.date_achat,
                duree.totalJours,
                deaths,
                lotInfo.age_initial
            );

            const totalAtody = await AtodyModel.getTotalByLotAndDate(lotId, dateBilan);
            const totalAtodyDejaPondu = await AtodyModel.getTotalAtodyDejaPondu(lotId, dateBilan);

            // Récupérer les événements pour calculer le reste à pondre chronologiquement
            const atodyEvents = await AtodyModel.getAtodyEventsByLotAndDate(lotId, dateBilan);
            const vavyMatyEvents = await AkohoMatyModel.getVavyMatyEventsByLotAndDate(lotId, dateBilan);

            const resteAPondre = this.calculateResteAPondre(
                lotInfo.nombre_vavy,
                lotInfo.capacite_pondre,
                atodyEvents,
                vavyMatyEvents
            );

            const finances = this.calculateFinances(lotInfo, totalSakafoGrammes, poidsMoyen, totalAkohoMaty, totalAtody, totalVavyMaty, totalLahyMaty, totalAtodyDejaPondu, resteAPondre);

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
                    continue;
                }
                const bilan = await this.getBilanByLotAndDate(lot.id, dateBilan);
                if (bilan) results.push(bilan);
            } catch (err) {
                console.warn(`Bilan ignoré pour lot ${lot.id}: ${err.message}`);
            }
        }
        return results;
    }
}