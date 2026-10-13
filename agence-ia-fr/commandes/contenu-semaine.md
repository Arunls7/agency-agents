---
description: "Décliner une idée en contenus de la semaine (post, vidéo courte, newsletter)"
argument-hint: "[idée ou thème]"
---
Demande : $ARGUMENTS

Lance toi-même, l'un après l'autre, ces trois sous-agents avec le même brief (thème, cible, offre et ton du CLAUDE.md, lignes utiles du registre) :
1. `marketing-linkedin-content-creator-fr` : post LinkedIn avec 3 accroches au choix, en texte brut prêt à coller (3 000 caractères au plus) ;
2. `contenu-video-ia-fr` : script de vidéo courte, découpage et prompts, avec les formats de sa table « Déclinaisons » (LinkedIn en 1:1 ou 4:5) ;
3. `marketing-email-strategist-fr` : newsletter avec 3 objets à tester en A/B et un pré-en-tête.
Termine par une check-list légale commune : étiquetage IA, droit à l'image, pas de faux avis, pas de promesse trompeuse. Adapte la mention de limite à la cible : pour un cabinet comptable, l'IA prépare et ses collaborateurs valident, sans renvoyer un expert-comptable vers « son expert-comptable ». Aucun repère chiffré qui ne vienne d'un agent ou du registre.

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
