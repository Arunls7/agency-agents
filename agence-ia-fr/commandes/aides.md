---
description: "Trouver un financement pour un projet client ou pour l'agence"
argument-hint: "[client ou agence, projet, taille, région]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `grant-writer-fr`. Toujours renvoyer vers la source officielle pour les montants et conditions ; jamais de prix « aide déduite ».

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant, s'il existe (offres, tarifs, cibles, ton de l'agence) ;
- pour toute règle datée (droit, fiscalité, aides, plateformes), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes. Réponds en français.
