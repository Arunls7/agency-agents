---
description: "Bulletin de veille IA, réglementation et marché (5 signaux)"
argument-hint: "[thème ou période, optionnel]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `veille-marche-ia-fr`. Chaque signal avec source et date ; proposer les mises à jour du registre des faits datés sans le modifier.

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant, s'il existe (offres, tarifs, cibles, ton de l'agence) ;
- pour toute règle datée (droit, fiscalité, aides, plateformes), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes. Réponds en français.
