---
description: "Une automatisation ou un agent livré ne marche plus : trouver la cause avant de corriger"
argument-hint: "[client, ce qui ne marche pas, depuis quand, message d'erreur]"
---
Panne à diagnostiquer : $ARGUMENTS

Délègue cette demande au sous-agent `engineering-it-service-manager-fr`, avec le CLAUDE.md et les éléments fournis (message d'erreur, capture de l'historique d'exécution, date de début).

Méthode imposée, dans cet ordre (on ne corrige rien avant d'avoir trouvé la cause) :
1. **Masquer d'abord** : dans tout ce qui est montré ou recopié (journaux, charges utiles, captures), remplacer les secrets (clés, jetons, mots de passe, en-têtes d'autorisation) et les données personnelles (noms, e-mails, téléphones, IBAN, numéros de dossier) par « [MASQUÉ] ». Ne jamais demander au fondateur de coller un fichier .env ou un mot de passe.
2. **Lire l'erreur en entier** : message, nœud ou module en cause, code d'erreur, heure de la première exécution en échec.
3. **Reproduire sans risque** : reproduire la panne en mode test, avec des données fictives ou une copie anonymisée d'une exécution. Ne jamais rejouer un webhook de production, ne jamais boucler sur des services réels (envois d'e-mails ou de SMS, opérations Make facturées, appels d'API payants), ne rien envoyer à un client.
4. **Chercher ce qui a changé** : version de n8n ou du module, identifiants expirés ou révoqués, mise à jour du logiciel du client, changement de format d'un fichier ou d'une API, quota atteint, modification récente du scénario.
5. **Hypothèses classées** : trois à cinq causes possibles, de la plus probable à la moins probable, chacune avec ce qu'elle prédit (« si c'est X, alors changer Y fait disparaître la panne »). Les montrer au fondateur avant de tester : il connaît souvent un changement récent.
6. **Un seul changement à la fois**, chacun lié à une hypothèse, en notant le résultat.
7. **Correction et test de non-régression** : une fois la cause prouvée, corriger, puis ajouter au plan de recette un scénario de test qui aurait détecté la panne. La preuve de la correction est une exécution réussie après correction, pas un « ça devrait marcher ».
8. **Conséquences** : si des données personnelles ont pu être exposées ou envoyées au mauvais destinataire, c'est une violation de données possible : renvoyer immédiatement vers `/rgpd` (délai de notification du registre). Indiquer s'il faut prévenir le client et ce qui relève du contrat de maintenance (abonnement du CLAUDE.md) ou d'une intervention facturée à part.
9. **Trace** : un court compte rendu pour le journal de maintenance du client (date, symptôme, cause, correction, prévention).

Si on ne parvient pas à reproduire la panne, le dire clairement, lister ce qui a été essayé et demander ce qui manque (accès en lecture à l'historique d'exécution, exemple anonymisé), sans proposer de correction au hasard.

Si la demande est vide ou trop vague, pose d'abord deux ou trois questions courtes.

Réponse au fondateur, en français :
- lance le sous-agent au premier plan et attends son résultat avant de répondre ;
- parle en ton nom, avec le ton du CLAUDE.md (tutoiement par défaut), sans évoquer le sous-agent ni les fichiers qu'il a lus ; vouvoie toujours dans les textes destinés aux clients ;
- recopie en entier les messages prêts à envoyer au client et le compte rendu ;
- garde tels quels les garde-fous, les réserves « à vérifier » et les délais ;
- typographie française : espace insécable avant : ; ? ! et à l'intérieur des guillemets « » ; dates en toutes lettres ;
- termine par la prochaine étape concrète, avec la commande à lancer s'il y en a une.

<!-- Méthode adaptée de mattpocock/skills (skill « diagnosing-bugs », licence MIT, © 2026 Matt Pocock) et d'obra/superpowers (skill « systematic-debugging », licence MIT, © 2025 Jesse Vincent). https://github.com/mattpocock/skills · https://github.com/obra/superpowers -->
