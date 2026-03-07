-- ============================================
-- Script pour comprendre et corriger les IDs non séquentiels
-- ============================================

USE Akoho;
GO

-- EXPLICATION : Pourquoi les IDs ne sont pas séquentiels (1, 2, 1002, 1003, etc.) ?
-- 
-- SQL Server utilise IDENTITY pour générer automatiquement les IDs.
-- Les IDs peuvent sauter pour plusieurs raisons :
--
-- 1. CACHE D'IDENTITY (raison principale) :
--    - SQL Server 2012+ cache les valeurs IDENTITY pour améliorer les performances
--    - Par défaut, le cache est de 1000 valeurs pour les tables avec IDENTITY
--    - Si le serveur redémarre, les valeurs cachées non utilisées sont perdues
--    - Exemple : ID courant = 2, cache jusqu'à 1002. Si redémarrage, prochain ID = 1002
--
-- 2. TRANSACTIONS ANNULÉES :
--    - Si une insertion échoue ou est annulée (ROLLBACK), l'ID est quand même consommé
--
-- 3. SUPPRESSIONS :
--    - Si des lignes ont été supprimées, leurs IDs ne sont pas réutilisés
--
-- 4. INSERTIONS MULTIPLES :
--    - Si plusieurs connexions insèrent en même temps, des IDs peuvent être réservés

-- ============================================
-- SOLUTION 1 : Vérifier la valeur actuelle et le cache
-- ============================================

-- Voir la valeur actuelle de IDENTITY pour Race
DBCC CHECKIDENT ('Race', NORESEED);

-- Voir la valeur actuelle de IDENTITY pour Lot
DBCC CHECKIDENT ('Lot', NORESEED);

-- ============================================
-- SOLUTION 2 : Désactiver le cache d'IDENTITY (pas recommandé en production)
-- ============================================

-- Cette solution empêche les sauts d'IDs dus au cache, mais réduit les performances
-- Ne faites ceci que si la séquentialité des IDs est critique

-- Pour désactiver le cache sur la table Race :
-- ALTER TABLE Race ALTER COLUMN id ADD ROWGUIDCOL; -- Non applicable pour INT
-- Ou recréer la table avec SEQUENCE au lieu de IDENTITY

-- ============================================
-- SOLUTION 3 : Réinitialiser l'IDENTITY (ATTENTION : peut causer des problèmes)
-- ============================================

-- ATTENTION : Ne faites ceci QUE si :
-- 1. Vous n'avez pas de données importantes
-- 2. Aucune autre table ne référence ces IDs (ou vous gérez les clés étrangères)
-- 3. Vous êtes en développement, pas en production

-- Réinitialiser Race à partir du prochain ID disponible :
-- DBCC CHECKIDENT ('Race', RESEED, 6); -- Remplacer 6 par le dernier ID utilisé

-- Réinitialiser Lot à partir du prochain ID disponible :
-- DBCC CHECKIDENT ('Lot', RESEED, 1); -- Remplacer 1 par le dernier ID utilisé

-- ============================================
-- SOLUTION 4 : Accepter les IDs non séquentiels (RECOMMANDÉ)
-- ============================================

-- La meilleure pratique est d'accepter que les IDs puissent avoir des gaps.
-- Les IDs sont des identifiants UNIQUES, pas nécessairement SÉQUENTIELS.
-- 
-- Avantages :
-- - Meilleures performances
-- - Pas de risque de conflit avec les clés étrangères
-- - Comportement standard de SQL Server
--
-- Si vous avez besoin d'un numéro d'ordre séquentiel :
-- - Ajoutez une colonne séparée (numero_ordre INT)
-- - Utilisez ROW_NUMBER() dans vos requêtes
-- - Ou recalculez l'ordre à chaque affichage

-- Exemple de requête avec numéro d'ordre :
SELECT 
    ROW_NUMBER() OVER (ORDER BY id) as numero_ordre,
    id,
    nom,
    pu_sakafo_par_gramme,
    pv_par_gramme,
    pu_atody
FROM Race;

-- ============================================
-- CONCLUSION
-- ============================================

-- Pour votre application :
-- 1. Les IDs non séquentiels ne posent AUCUN problème fonctionnel
-- 2. C'est le comportement normal et attendu de SQL Server
-- 3. Ne tentez pas de "corriger" cela en production
-- 4. Si vous avez vraiment besoin de numéros séquentiels, utilisez une colonne séparée
