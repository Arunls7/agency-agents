---
description: "Préparer le bilan trimestriel d'un client en abonnement"
argument-hint: "[client, chiffres disponibles]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `customer-success-manager-fr`. Heures gagnées, euros économisés, incidents, prochaines améliorations ; vouvoiement.

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant, s'il existe (offres, tarifs, cibles, ton de l'agence) ;
- pour toute règle datée (droit, fiscalité, aides, plateformes), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes. Réponds en français.
