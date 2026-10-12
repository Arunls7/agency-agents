---
description: "Calculer un prix (forfait, abonnement, pack métier) et sa marge"
argument-hint: "[offre, temps estimé, coûts]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `specialized-pricing-analyst-fr`. Montrer le calcul : coûts (dont API en dollars convertis), temps, marge, prix HT et TTC.

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant, s'il existe (offres, tarifs, cibles, ton de l'agence) ;
- pour toute règle datée (droit, fiscalité, aides, plateformes), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes. Réponds en français.
