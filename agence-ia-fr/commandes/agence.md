---
description: "Point d'entrée : décrivez ce que vous voulez faire, le bon agent s'en charge"
argument-hint: "[votre demande, en une phrase]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `specialized-chief-of-staff-fr`. Cet agent oriente la demande vers l'agent -fr le plus adapté (ou en enchaîne plusieurs), puis rend un résultat unique.

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant, s'il existe (offres, tarifs, cibles, ton de l'agence) ;
- pour toute règle datée (droit, fiscalité, aides, plateformes), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes. Réponds en français.
