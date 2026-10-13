---
description: "Transformer une fiche de cadrage en plan de livraison par petites étapes, chacune avec son test et sa preuve"
argument-hint: "[fiche de cadrage (chemin du fichier) ou description du projet validé]"
---
Projet à planifier : $ARGUMENTS

Délègue cette demande au sous-agent `project-management-project-shepherd-fr`, avec la fiche de cadrage (lis le fichier si un chemin est donné), le CLAUDE.md et les lignes utiles du registre. S'il n'y a pas encore de fiche ou si des décisions restent ouvertes, propose d'abord `/cadrage`.

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant (offres, tarifs, outils, règles de l'agence) ;
- pour toute règle datée (droit, fiscalité, plateformes, licences d'outils), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi ; ses points « À vérifier » restent des réserves du plan, transmises telles quelles au sous-agent, jamais présentées comme acquises ni « conformes ». Quand l'instance n8n de l'agence sert le client, la réponse écrite de n8n sur sa licence est un prérequis de l'étape 0, à obtenir avant l'envoi du devis, et le plan décrit l'architecture de repli (instance sur un serveur au nom du client).

Le plan attendu est écrit pour quelqu'un qui n'a vu ni le client ni la fiche (un freelance, ou le fondateur dans trois semaines) :
- **En-tête** : objectif en une phrase, outils (n8n auto-hébergé, Make, modèle d'IA et région d'hébergement), lien vers la fiche, contraintes du projet reprises mot pour mot (validations humaines, données personnelles, budget mensuel HT), réserves du registre.
- **Étape 0, prérequis avant toute donnée réelle** : contrat de sous-traitance signé (art. 28 RGPD), sous-traitants ultérieurs (hébergeur, modèle d'IA, Make) autorisés par écrit par le client, analyse d'impact si nécessaire, accès en lecture seule demandés au client. Jusque-là, uniquement des données fictives ou anonymisées.
- **Étapes courtes** : chacune produit un résultat que l'on peut vérifier de façon indépendante (un scénario qui tourne, un connecteur qui répond, un message bien formé). Dans chaque étape, dans cet ordre : le test (scénario avec des données fictives : entrée exacte → sortie attendue, joué en mode test, jamais sur la production), puis les actions de construction, puis « Terminé quand : » avec la preuve attendue, et la charge estimée en heures. L'en-tête donne la charge totale et la compare au prix de mise en place prévu, en signalant tout écart.
- **Cas limites** : les six à huit situations que ce projet rencontrera le plus probablement sans que la fiche les mentionne (par exemple pièce jointe manquante, doublon, réponse vide de l'IA, service indisponible, montant ou date mal lus, à adapter au projet), y compris celles qu'entraînent les règles datées citées par la fiche (par exemple une même facture reçue par la plateforme agréée et en PDF par e-mail). Chacune a un comportement attendu et un test qui provoque réellement ce cas, rattaché à l'étape concernée ; les autres variantes tiennent en une ligne dans les points à confirmer.
- **Points de validation humaine et reprise manuelle**, placés avant tout envoi, paiement ou suppression.
- **Retour arrière** pour chaque mise en production : désactiver le scénario, revenir à la version précédente, et dire ce que deviennent les éléments en cours (en attente de validation, à moitié traités) pour qu'aucun ne reste sans issue.
- **Interprétations** : tout critère ambigu de la fiche (délai en heures ouvrées, seuil, pourcentage) est signalé avec l'interprétation retenue, à confirmer.

Règle de preuve, pour le plan comme pour le suivi : une étape n'est « terminée » que si l'on montre la preuve fraîche qu'elle fonctionne (exécution réussie dans l'historique n8n ou Make, sortie obtenue sur le scénario de test, capture), jamais sur un « ça devrait marcher ». Si un test échoue, on le dit avec le résultat obtenu.

Termine par la recette finale avec `/recette`, puis propose d'enregistrer le plan dans `plans/` du dossier de l'agence, avec l'accord du fondateur et des cases à cocher (- [ ]) pour le suivi ; dans l'application, il faut que la création de fichiers soit autorisée. Avant cet accord, n'écris aucun fichier dans le dossier de l'agence, même temporaire ou caché.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes.

Réponse au fondateur, en français :
- annonce d'abord en une ligne que le plan demande plusieurs minutes, puis lance le sous-agent au premier plan et attends son résultat avant de répondre ; dans son brief, précise qu'il fait le travail lui-même, sans lancer de commande /slash ;
- parle en ton nom, avec le ton du CLAUDE.md (tutoiement par défaut), sans évoquer le sous-agent ni les fichiers qu'il a lus, et sans commenter tes retouches : donne directement la version corrigée ; vouvoie toujours dans les textes destinés aux clients et aux prospects ;
- recopie en entier le plan produit ; tu peux resserrer l'analyse, jamais les étapes, les tests ni les cas limites ;
- garde tels quels les garde-fous, les réserves « à vérifier », les conditions de périmètre, les dates, les articles cités et les coûts ; une règle appliquée par prudence n'est jamais présentée comme une obligation ;
- typographie française : espace avant : ; ? ! et à l'intérieur des guillemets « » ; dates en toutes lettres ;
- avant de répondre, refais les calculs dérivés (coûts, délais, dates) à partir des valeurs affichées ;
- termine par la prochaine étape concrète, avec la commande à lancer s'il y en a une.

<!-- Méthode adaptée d'obra/superpowers (skills « writing-plans », « test-driven-development » et « verification-before-completion », licence MIT, © 2025 Jesse Vincent, https://github.com/obra/superpowers/blob/main/LICENSE). -->
