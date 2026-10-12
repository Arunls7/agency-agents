---
description: "Obtenir plus d'avis Google ou répondre à un avis"
argument-hint: "[contexte, ou texte de l'avis]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `avis-reputation-locale-fr`. Jamais d'avis achetés ni de contrepartie conditionnée ; vouvoiement dans les réponses.

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant, s'il existe (offres, tarifs, cibles, ton de l'agence) ;
- pour toute règle datée (droit, fiscalité, aides, plateformes), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes. Réponds en français.
