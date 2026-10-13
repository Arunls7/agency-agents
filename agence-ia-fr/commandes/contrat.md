---
description: "Préparer ou relire un contrat (CGV, prestation, maintenance, apporteur d'affaires)"
argument-hint: "[type de contrat, contexte, ou chemin du fichier]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `juriste-contrats-fr`. Signaler les risques et proposer des clauses à faire valider par un avocat. Recopie intégralement la clause ou le contrat rédigé, dans un bloc de texte, sans le résumer ni le reformuler : en-tête « À FAIRE VALIDER PAR UN AVOCAT — version du [date] », termes « l'Agence » et « le Client », crochets à compléter. Place ensuite les risques et les questions.

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
