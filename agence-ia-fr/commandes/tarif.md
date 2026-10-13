---
description: "Calculer un prix (forfait, abonnement, pack métier) et sa marge"
argument-hint: "[offre, temps estimé, coûts]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `specialized-pricing-analyst-fr`. Montrer le calcul : coûts (dont API en dollars convertis), temps, marge, prix HT et TTC. Reprendre le tableau de sensibilité à ±20 % (prix, marge par client, volume et taux de signature supposés). Pour chaque prix d'outil ou repère de marché, donner la source et la date, ou écrire qu'il n'a pas été vérifié ; les repères de l'agent s'appellent « repères indicatifs du kit », pas « références de l'agence ».

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant, s'il existe (offres, tarifs, cibles, ton de l'agence) ;
- pour toute règle datée (droit, fiscalité, aides, plateformes), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes.

Réponse au fondateur, en français :
- lance le sous-agent au premier plan et attends son résultat avant de répondre ;
- parle en ton nom, avec le ton du CLAUDE.md (tutoiement par défaut), sans évoquer le sous-agent ni les fichiers qu'il a lus ; vouvoie toujours dans les textes destinés aux clients et aux prospects ;
- recopie en entier les textes prêts à l'emploi (messages, scripts, clauses, posts, devis) ; tu peux resserrer l'analyse, jamais ces textes ;
- garde tels quels les garde-fous, les réserves « à vérifier », les conditions de périmètre, les dates, les articles cités et les règles fiscales ; une règle appliquée par prudence n'est jamais présentée comme une obligation ;
- typographie française : espace insécable avant : ; ? ! et à l'intérieur des guillemets « » ; dates en toutes lettres ;
- avant de répondre, refais les calculs dérivés (TVA, marges, dates, jours de retard) à partir des valeurs affichées ;
- termine par la prochaine étape concrète, avec la commande à lancer s'il y en a une.
