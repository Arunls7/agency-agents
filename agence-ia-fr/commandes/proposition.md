---
description: "Rédiger une proposition commerciale ou un devis"
argument-hint: "[client, besoin, budget, éléments du rendez-vous]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `sales-proposal-strategist-fr`. Prix en euros HT avec TVA, mentions du devis, points RGPD (sous-traitance art. 28).

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant, s'il existe (offres, tarifs, cibles, ton de l'agence) ;
- pour toute règle datée (droit, fiscalité, aides, plateformes), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes. Réponds en français.
