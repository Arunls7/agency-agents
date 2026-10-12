---
description: "Préparer ou débriefer un rendez-vous de découverte"
argument-hint: "[prospect, métier, contexte]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `sales-discovery-coach-fr`. Livrable attendu : déroulé du rendez-vous, questions dans l'ordre, signaux à creuser, prochaine étape à proposer.

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant, s'il existe (offres, tarifs, cibles, ton de l'agence) ;
- pour toute règle datée (droit, fiscalité, aides, plateformes), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes. Réponds en français.
