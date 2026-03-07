USE Akoho;

-- ============================================================
-- NETTOYAGE (dans l'ordre des dépendances)
-- ============================================================
DELETE FROM Eclosion;
DELETE FROM Akoho_Maty;
DELETE FROM Atody;
DELETE FROM Configuration;
DELETE FROM Lot;
DELETE FROM Race;

DBCC CHECKIDENT ('Eclosion',    RESEED, 0);
DBCC CHECKIDENT ('Akoho_Maty',  RESEED, 0);
DBCC CHECKIDENT ('Atody',       RESEED, 0);
DBCC CHECKIDENT ('Configuration', RESEED, 0);
DBCC CHECKIDENT ('Lot',         RESEED, 0);
DBCC CHECKIDENT ('Race',        RESEED, 0);

-- ============================================================
-- RACES  (id : 1 = Pondeuse Rouge, 2 = Leghorn, 3 = Plymouth Rock)
-- pu_sakafo_par_gramme  = prix d'achat sakafo par gramme (Ar/g)
-- pv_par_gramme         = prix de vente akoho par gramme (Ar/g)
-- pu_atody              = prix de vente d'un oeuf (Ar)
-- ============================================================
INSERT INTO Race (nom, pu_sakafo_par_gramme, pv_par_gramme, pu_atody) VALUES
    ('Pondeuse Rouge',  0.05, 0.10, 500),
    ('Leghorn',         0.04, 0.09, 450),
    ('Plymouth Rock',   0.06, 0.11, 520);

-- ============================================================
-- LOTS
--   Lot-Alpha  : démarré le 2025-01-06, 100 poulets → 5 morts → 95 vivants
--   Lot-Beta   : démarré le 2025-01-13, 50  poulets → 1 mort  → 49 vivants
--   Lot-Gamma  : démarré le 2025-01-15, 80  poulets, Plymouth Rock
--   Eclosion-Lot-Alpha-2025-01-28 : créé par l'éclosion (15 poussins, prix 0)
-- ============================================================
INSERT INTO Lot (name, race_id, date_achat, nombre_akoho, age, prix_achat) VALUES
    ('Lot-Alpha',                       1, '2025-01-06', 95, 8,  50000.00),
    ('Lot-Beta',                        2, '2025-01-13', 49, 12, 28000.00),
    ('Lot-Gamma',                       3, '2025-01-15', 80, 6,  45000.00),
    ('Eclosion-Lot-Alpha-2025-01-28',   1, '2025-01-28', 15, 0,      0.00);
-- IDs dans l'ordre d'insertion : 1, 2, 3, 4

-- ============================================================
-- CONFIGURATIONS
-- Semaine 0 = semaine qui commence à date_achat
-- variation_poids  : gain de poids moyen par akoho sur la semaine (g)
-- sakafo_semaine   : quantité totale de sakafo consommée sur la semaine (g)
-- ============================================================

-- Lot-Alpha (lot_id = 1)
INSERT INTO Configuration (lot_id, semaine, variation_poids, sakafo_semaine) VALUES
    (1, 0,  50.00,  2000.00),   -- jan 06–12
    (1, 1,  80.00,  2500.00),   -- jan 13–19
    (1, 2, 100.00,  3000.00),   -- jan 20–26
    (1, 3, 120.00,  3500.00),   -- jan 27–fév 02
    (1, 4, 140.00,  4000.00);   -- fév 03–09

-- Lot-Beta (lot_id = 2)
INSERT INTO Configuration (lot_id, semaine, variation_poids, sakafo_semaine) VALUES
    (2, 0,  60.00,  1800.00),   -- jan 13–19
    (2, 1,  90.00,  2200.00),   -- jan 20–26
    (2, 2, 110.00,  2700.00);   -- jan 27–fév 02

-- Lot-Gamma (lot_id = 3)
INSERT INTO Configuration (lot_id, semaine, variation_poids, sakafo_semaine) VALUES
    (3, 0,  70.00,  3200.00),   -- jan 15–21
    (3, 1, 100.00,  3800.00),   -- jan 22–28
    (3, 2, 130.00,  4200.00);   -- jan 29–fév 04

-- ============================================================
-- ATODY  (productions d'oeufs + déductions éclosion)
-- Les enregistrements négatifs représentent des oeufs utilisés
-- pour l'éclosion (insérés automatiquement par EclosionModel).
-- ============================================================

-- Lot-Alpha (lot_id = 1)
INSERT INTO Atody (lot_id, date_production, nombre_atody) VALUES
    (1, '2025-01-12',  75),   -- fin semaine 0
    (1, '2025-01-19',  82),   -- fin semaine 1
    (1, '2025-01-26',  88),   -- fin semaine 2
    (1, '2025-01-28', -15),   -- déduction éclosion (15 oeufs → 15 poussins)
    (1, '2025-02-02',  90),   -- fin semaine 3
    (1, '2025-02-04',  55);   -- en cours semaine 4 (bilan intermédiaire)

-- Lot-Beta (lot_id = 2)
INSERT INTO Atody (lot_id, date_production, nombre_atody) VALUES
    (2, '2025-01-18',  40),   -- fin semaine 0
    (2, '2025-01-25',  45),   -- fin semaine 1
    (2, '2025-02-01',  48);   -- fin semaine 2

-- Lot-Gamma (lot_id = 3)
INSERT INTO Atody (lot_id, date_production, nombre_atody) VALUES
    (3, '2025-01-21',  60),   -- fin semaine 0
    (3, '2025-01-28',  72),   -- fin semaine 1
    (3, '2025-02-03',  78);   -- fin semaine 2 (partielle)

-- ============================================================
-- AKOHO_MATY  (mortalités)
-- NB : en production, le modèle décrémente nombre_akoho dans Lot.
--      Les comptes dans Lot ci-dessus reflètent déjà ces morts.
-- ============================================================

-- Lot-Alpha (lot_id = 1) : 3 + 2 = 5 morts → 95 vivants
INSERT INTO Akoho_Maty (lot_id, date_maty, nombre) VALUES
    (1, '2025-01-15', 3),   -- semaine 1
    (1, '2025-01-22', 2);   -- semaine 2

-- Lot-Beta (lot_id = 2) : 1 mort → 49 vivants
INSERT INTO Akoho_Maty (lot_id, date_maty, nombre) VALUES
    (2, '2025-01-20', 1);   -- semaine 1

-- Lot-Gamma (lot_id = 3) : aucune mort pour l'instant

-- ============================================================
-- ECLOSION
-- lot_id = 1 (Lot-Alpha) fournit les 15 oeufs éclos.
-- Le lot créé par l'éclosion est lot_id = 4
-- (Eclosion-Lot-Alpha-2025-01-28, déjà inséré ci-dessus).
-- ============================================================
INSERT INTO Eclosion (lot_id, date_eclosion, nombre_foy) VALUES
    (1, '2025-01-28', 15);