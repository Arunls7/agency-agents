---
description: "Une automatisation ou un agent livré ne marche plus : limiter les dégâts, trouver la cause, puis corriger"
argument-hint: "[client, ce qui ne marche pas, depuis quand, message d'erreur]"
---
Panne à diagnostiquer : $ARGUMENTS

Délègue cette demande au sous-agent `engineering-it-service-manager-fr`, avec le CLAUDE.md, les fichiers du client présents dans le dossier de l'agence (fiche de cadrage, plan, journal de maintenance : cherche-les toi-même avant de poser des questions) et la demande du fondateur recopiée mot pour mot, sans la reformuler, avec les éléments fournis (message d'erreur, date de début).

Contexte à respecter :
- le fichier CLAUDE.md du dossier courant (offres, abonnement de maintenance et ce qu'il couvre, règles de l'agence) ;
- pour toute règle datée (RGPD, délais), le registre `~/.claude/agence-ia-fr/faits-dates.md` fait foi ;
- n'annonce aucun délai d'intervention ni engagement de service qui ne figure pas dans le CLAUDE.md ou le contrat du client.

Avant tout, si le fondateur doit coller un journal ou une capture, demande-lui de masquer d'abord les clés, jetons, mots de passe et données personnelles. S'il a déjà collé un secret ou des données personnelles, ne les recopie jamais, même pour lui dire ce qu'il a collé : nomme-les (« le jeton de l'en-tête Authorization », « une adresse e-mail ») ou montre l'extrait masqué (`Authorization: Bearer [MASQUÉ]`). Dis-lui que tout cela reste dans l'historique de la conversation et qu'il doit faire révoquer puis remplacer le secret, même s'il le croit déjà expiré ou révoqué. Si ce qu'il a collé contient des données personnelles du client, note-le dans le compte rendu (quoi, quand, dans quel outil), n'écris pas « aucune exposition constatée » et renvoie vers `/rgpd`, sans juger toi-même du risque.

Méthode imposée, dans cet ordre :
1. **Limiter les dégâts** : si l'automatisation envoie de mauvaises informations, expose des données ou facture à tort, la désactiver d'abord (ou couper l'étape en cause), avec l'accord du fondateur ; ce n'est pas encore la correction.
2. **Masquer** : dans tout ce qui est montré ou recopié (journaux, charges utiles, captures), remplacer secrets et données personnelles (noms, e-mails, téléphones, IBAN, numéros de dossier) par « [MASQUÉ] ».
3. **Lire l'erreur en entier** : message, nœud ou module en cause, code d'erreur, heure de la première exécution en échec.
4. **Reproduire sans risque** : en mode test, avec des données fictives ou une copie anonymisée d'une exécution. Ne jamais rejouer un webhook de production, ne rien envoyer à un client. Un essai qui écrit dans l'outil du client (dépôt d'une pièce, création d'une fiche) n'est pas sans risque : commence par ce qui ne laisse aucune trace, l'état de la clé dans l'interface de l'éditeur ou un appel en lecture (en général, une clé refusée répond 401 quel que soit l'appel, une clé reconnue mais sans droit répond 403). Demander l'accord du fondateur avant tout essai qui consomme des opérations Make, des crédits d'API ou des envois, en indiquant combien.
5. **Chercher ce qui a changé** : version de n8n ou du module, identifiants expirés ou révoqués, mise à jour du logiciel du client, changement de format d'un fichier ou d'une API, quota atteint, modification récente du scénario.
6. **Hypothèses classées** : trois à cinq causes possibles, de la plus probable à la moins probable, chacune avec ce qu'elle prédit (« si c'est X, alors changer Y fait disparaître la panne »). Les montrer au fondateur avant de tester.
7. **Un seul changement à la fois**, chacun lié à une hypothèse, en notant le résultat.
8. **Correction et non-régression** : une fois la cause prouvée, corriger, puis ajouter au plan de recette un scénario de test qui aurait détecté la panne. La preuve de la correction est une exécution réussie après correction, pas un « ça devrait marcher ».
9. **Rattrapage** : les éléments restés en échec pendant la panne sont repris après correction, avec l'accord du fondateur, d'abord un seul, puis par petits lots, en vérifiant qu'aucun n'est traité deux fois.
10. **Données personnelles** : si des données ont pu être exposées ou envoyées au mauvais destinataire, c'est une violation de données possible. L'agence, sous-traitant, prévient le client (responsable de traitement) dans les meilleurs délais, sans juger elle-même du risque (art. 33(2) RGPD, voir le registre) ; c'est au client de décider s'il notifie la CNIL (au plus tard 72 heures après en avoir pris connaissance, sauf si la violation n'est pas susceptible d'engendrer un risque). Renvoyer vers `/rgpd`.
11. **Facturation** : dire ce qui relève de l'abonnement de maintenance du CLAUDE.md et ce qui serait une intervention facturée à part.
12. **Trace** : un court compte rendu (date, symptôme, cause, correction, prévention), à enregistrer dans le dossier du client (`clients/<client>/maintenance.md`) avec l'accord du fondateur.

Le message au client garde les réserves : on n'affirme pas qu'aucune donnée n'a été perdue ou mal envoyée tant que ce n'est pas vérifié. Si on ne parvient pas à reproduire la panne, le dire clairement, lister ce qui a été essayé et demander ce qui manque, sans proposer de correction au hasard. Aux tours suivants de la discussion (nouveau journal, résultat d'un test), la même méthode et les mêmes garde-fous s'appliquent.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes.

Réponse au fondateur, en français :
- lance le sous-agent au premier plan et attends son résultat avant de répondre ; dans son brief, précise qu'il fait le travail lui-même, sans lancer de commande /slash ;
- parle en ton nom, avec le ton du CLAUDE.md (tutoiement par défaut), sans évoquer le sous-agent ni les fichiers qu'il a lus ; vouvoie toujours dans les textes destinés aux clients ;
- fais court : environ 500 mots au plus, hors message client et compte rendu. Dans cet ordre : ce qu'il faut faire maintenant ; au plus trois questions, une seule interrogation chacune, jamais sur ce qu'il a déjà dit ; les causes les plus probables, une ligne chacune. Chaque terme technique est expliqué en quelques mots. Tant que la cause n'est pas établie, ni compte rendu ni détail de facturation : une ligne suffit ;
- dans les messages au client et le compte rendu, n'écris comme un fait que ce que le fondateur a dit ou ce qui figure dans les fichiers de ce client : qui a détecté la panne, qui a changé quoi, depuis quand ;
- recopie en entier les messages prêts à envoyer au client et le compte rendu ;
- garde tels quels les garde-fous, les réserves « à vérifier », les conditions de périmètre, les dates et les articles cités ; une règle appliquée par prudence n'est jamais présentée comme une obligation ;
- typographie française : espace avant : ; ? ! et à l'intérieur des guillemets « » ; dates en toutes lettres ; « à la suite de » plutôt que « suite à » ;
- avant de répondre, refais les calculs dérivés (dates, nombre d'éléments en échec, coûts) à partir des valeurs affichées ;
- termine par la prochaine étape concrète, avec la commande à lancer s'il y en a une (par exemple `/recette` après correction).

<!-- Méthode adaptée de mattpocock/skills (skill « diagnosing-bugs », licence MIT, © 2026 Matt Pocock, https://github.com/mattpocock/skills/blob/main/LICENSE) et d'obra/superpowers (skill « systematic-debugging », licence MIT, © 2025 Jesse Vincent, https://github.com/obra/superpowers/blob/main/LICENSE). -->
