---
description: "Construire une séquence de prospection (e-mail, LinkedIn, téléphone) conforme"
argument-hint: "[cible, zone, offre]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `sales-outbound-strategist-fr`. Respecter les règles de prospection B2B et B2C du registre des faits datés.

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant, s'il existe (offres, tarifs, cibles, ton de l'agence) ;
- pour toute règle datée (droit, fiscalité, aides, plateformes), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes. Réponds en français.
