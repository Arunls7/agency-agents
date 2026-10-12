---
description: "Script, découpage et prompts d'une vidéo courte (Higgsfield, Veo, Kling…)"
argument-hint: "[objet de la vidéo, cible, format]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `contenu-video-ia-fr`. Toujours finir par la check-list légale avant publication.

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant, s'il existe (offres, tarifs, cibles, ton de l'agence) ;
- pour toute règle datée (droit, fiscalité, aides, plateformes), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes. Réponds en français.
