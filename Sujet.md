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
