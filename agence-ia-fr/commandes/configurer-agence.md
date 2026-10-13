---
description: "Créer ou mettre à jour le CLAUDE.md de l'agence (offres, tarifs, cibles, ton) en répondant à quelques questions"
argument-hint: "[optionnel : dossier de l'agence]"
---
Objectif : créer le fichier CLAUDE.md qui décrit l'agence, pour que tous les agents `-fr` rédigent devis, messages et contenus à son image.

1. Dossier cible : $ARGUMENTS s'il est indiqué, sinon le dossier courant. Si ce dossier est le dossier personnel (~) ou un dépôt de code sans rapport, propose plutôt de créer un dossier dédié (par exemple ~/Agence) et demande confirmation.
2. Lis le modèle `~/.claude/agence-ia-fr/modele-CLAUDE.md`. Si un CLAUDE.md existe déjà dans le dossier cible, lis-le : il s'agit alors d'une mise à jour, ne pose que les questions sur ce qui manque ou a changé.
3. Pose les questions UNE PAR UNE, en français, en tutoyant l'utilisateur (le fondateur ; vouvoiement s'il le préfère), avec un exemple de réponse à chaque fois. Au plus 11 questions, dans cet ordre : nom et ville de l'agence ; statut (micro-entreprise, EURL, SASU…) ; métiers ciblés ; 2 ou 3 offres principales avec leur prix HT ; abonnement de maintenance et son prix ; conditions de paiement ; repères financiers (rémunération nette visée, frais fixes annuels, heures facturables par an, taux horaire cible) ; outils utilisés (automatisation, modèles d'IA, CRM) ; ton souhaité, et si l'utilisateur préfère que les agents le vouvoient ; ce que l'agence refuse ; signature des e-mails. L'utilisateur peut répondre « passer ».
4. Remplis le modèle avec les réponses. Laisse « à compléter » pour ce qui a été passé, ne devine rien, n'invente aucun prix.
5. Montre le résultat, puis écris le CLAUDE.md dans le dossier cible après accord explicite. S'il existait, garde une copie `CLAUDE.md.avant-configuration`.
6. Termine en expliquant en deux lignes comment s'en servir : ouvrir Claude Code dans ce dossier, puis essayer `/decouverte`, `/proposition` ou `/agence`.
