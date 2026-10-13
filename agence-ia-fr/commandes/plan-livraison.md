---
description: "Transformer une fiche de cadrage en plan de livraison par petites étapes, chacune avec son test et sa preuve"
argument-hint: "[fiche de cadrage (chemin du fichier) ou description du projet validé]"
---
Projet à planifier : $ARGUMENTS

Délègue cette demande au sous-agent `project-management-project-shepherd-fr`, avec la fiche de cadrage (lis le fichier si un chemin est donné) et le CLAUDE.md. S'il n'y a pas encore de fiche ou si des décisions restent ouvertes, propose d'abord `/cadrage`.

Le plan attendu est écrit pour quelqu'un qui n'a vu ni le client ni la fiche (un freelance, ou le fondateur dans trois semaines) :
- **En-tête** : objectif en une phrase, outils (n8n auto-hébergé, Make, modèle d'IA et région d'hébergement), lien vers la fiche, contraintes du projet reprises mot pour mot (validations humaines, données personnelles, budget mensuel HT).
- **Étapes courtes** : chacune produit un résultat que l'on peut vérifier seul (un scénario qui tourne, un connecteur qui répond, un message bien formé), et se découpe en actions qui ont chacune un résultat contrôlable.
- **Test écrit avant de construire** : pour chaque étape, un scénario de test avec des données fictives (entrée exacte → sortie attendue), à faire passer en mode test, jamais sur la production ni avec les vraies données du client.
- **Cas limites** : les cinq situations que le client rencontrera le plus probablement sans que la fiche les mentionne (pièce jointe manquante, doublon, réponse vide de l'IA, service indisponible, montant ou date mal lus), chacune avec le comportement attendu et le test rattaché à l'étape concernée.
- **Points de validation humaine et reprise manuelle**, placés avant tout envoi, paiement ou suppression.
- **Retour arrière** pour chaque mise en production (désactiver le scénario, revenir à la version précédente).

Règle de preuve, pour le plan comme pour le suivi : une étape n'est « terminée » que si l'on montre la preuve fraîche qu'elle fonctionne (exécution réussie dans l'historique n8n ou Make, sortie obtenue sur le scénario de test, capture), jamais sur un « ça devrait marcher ». Si un test échoue, on le dit avec le résultat obtenu.

Termine par la recette finale avec `/recette` (sous-agent `testing-reality-checker-fr`) et propose d'enregistrer le plan dans `plans/` du dossier de l'agence, avec des cases à cocher (- [ ]) pour le suivi.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes.

Réponse au fondateur, en français :
- lance le sous-agent au premier plan et attends son résultat avant de répondre ;
- parle en ton nom, avec le ton du CLAUDE.md (tutoiement par défaut), sans évoquer le sous-agent ni les fichiers qu'il a lus ; vouvoie toujours dans les textes destinés aux clients et aux prospects ;
- recopie en entier le plan produit ; tu peux resserrer l'analyse, jamais les étapes, les tests ni les cas limites ;
- garde tels quels les garde-fous, les réserves « à vérifier », les dates et les coûts ;
- typographie française : espace insécable avant : ; ? ! et à l'intérieur des guillemets « » ; dates en toutes lettres ;
- termine par la prochaine étape concrète, avec la commande à lancer s'il y en a une.

<!-- Méthode adaptée d'obra/superpowers (skills « writing-plans », « test-driven-development » et « verification-before-completion », licence MIT, © 2025 Jesse Vincent). https://github.com/obra/superpowers -->
