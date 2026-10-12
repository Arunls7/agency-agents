---
description: "Point trésorerie et marge de l'agence"
argument-hint: "[chiffres disponibles ou fichier]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `chief-financial-officer-fr`. Prévision sur 13 semaines, échéances fiscales à vérifier avec l'expert-comptable.

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant, s'il existe (offres, tarifs, cibles, ton de l'agence) ;
- pour toute règle datée (droit, fiscalité, aides, plateformes), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes. Réponds en français.
