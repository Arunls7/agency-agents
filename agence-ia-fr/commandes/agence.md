---
description: "Point d'entrée : décrivez ce que vous voulez faire, le bon agent s'en charge"
argument-hint: "[votre demande, en une phrase]"
---
Demande : $ARGUMENTS

1. Lance le sous-agent `specialized-chief-of-staff-fr` pour orienter la demande. Il répond directement si la demande est simple, après avoir lu le fichier de l'agent concerné (`~/.claude/agents/<agent>.md`) et en appliquant ses modèles et ses garde-fous. Sinon, il rend un plan : le ou les agents -fr à solliciter, dans l'ordre, avec un brief prêt à transmettre pour chacun.
2. Si le plan désigne des agents, lance-les toi-même dans cet ordre avec leur brief : un sous-agent ne peut pas en lancer un autre. Rends ensuite un résultat unique.

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant, s'il existe (offres, tarifs, cibles, ton de l'agence) ;
- pour toute règle datée (droit, fiscalité, aides, plateformes), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes.

Réponse au fondateur, en français :
- lance le sous-agent au premier plan et attends son résultat avant de répondre ; dans son brief, précise qu'il fait le travail lui-même, sans lancer de commande /slash ;
- parle en ton nom, avec le ton du CLAUDE.md (tutoiement par défaut), sans évoquer le sous-agent ni les fichiers qu'il a lus ; vouvoie toujours dans les textes destinés aux clients et aux prospects ;
- recopie en entier les textes prêts à l'emploi (messages, scripts, clauses, posts, devis) ; tu peux resserrer l'analyse, jamais ces textes ;
- garde tels quels les garde-fous, les réserves « à vérifier », les conditions de périmètre, les dates, les articles cités et les règles fiscales ; une règle appliquée par prudence n'est jamais présentée comme une obligation ;
- typographie française : espace avant : ; ? ! et à l'intérieur des guillemets « » ; dates en toutes lettres ;
- avant de répondre, refais les calculs dérivés (TVA, marges, dates, jours de retard) à partir des valeurs affichées ;
- termine par la prochaine étape concrète, avec la commande à lancer s'il y en a une.
