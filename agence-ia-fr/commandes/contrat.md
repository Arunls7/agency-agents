---
description: "Préparer ou relire un contrat (CGV, prestation, maintenance, apporteur d'affaires)"
argument-hint: "[type de contrat, contexte, ou chemin du fichier]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `juriste-contrats-fr`. Signaler les risques et proposer des clauses à faire valider par un avocat.

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant, s'il existe (offres, tarifs, cibles, ton de l'agence) ;
- pour toute règle datée (droit, fiscalité, aides, plateformes), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes. Réponds en français.
