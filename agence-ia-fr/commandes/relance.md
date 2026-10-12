---
description: "Relancer une facture impayée (relance, mise en demeure, petites créances)"
argument-hint: "[client, montant, date d'échéance, relances déjà faites]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `legal-billing-time-tracking-fr`. Ton courtois et ferme, vouvoiement, pénalités et indemnité de 40 € rappelées.

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant, s'il existe (offres, tarifs, cibles, ton de l'agence) ;
- pour toute règle datée (droit, fiscalité, aides, plateformes), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes. Réponds en français.
