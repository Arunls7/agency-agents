---
description: "Relancer une facture impayée (relance, mise en demeure, petites créances)"
argument-hint: "[client, montant, date d'échéance, relances déjà faites]"
---
Demande : $ARGUMENTS

Délègue cette demande au sous-agent `legal-billing-time-tracking-fr`. Ton courtois et ferme, vouvoiement, pénalités et indemnité de 40 € rappelées si le client est un professionnel. Demande (ou indique comme hypothèse) la date de facture, la date d'échéance, les relances déjà faites, l'existence d'un litige et si le client est un professionnel ou un particulier. Une date non confirmée reste un champ à compléter dans le courrier : [date de facture], [date d'échéance]. Avant tout courrier formel, mise en demeure comprise, vérifier sur le BODACC que le client n'est pas en procédure collective ; pas de mise en demeure sans décision du fondateur. Après un refus ou un silence en procédure simplifiée des petites créances, la suite est l'injonction de payer, sur nouvelle décision du fondateur.

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
