---
description: "Vérifier qu'un agent ou une automatisation est prêt à être livré"
argument-hint: "[ce qui doit être livré, où le trouver]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `testing-reality-checker-fr`. Verdict par défaut : À RETRAVAILLER, tant que les preuves ne sont pas réunies.

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant, s'il existe (offres, tarifs, cibles, ton de l'agence) ;
- pour toute règle datée (droit, fiscalité, aides, plateformes), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes. Réponds en français.
