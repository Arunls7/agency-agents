---
description: "Cadrer un projet d'automatisation ou d'agent IA avant de le construire : questions par rondes, puis fiche de cadrage"
argument-hint: "[client et idée du projet, en une phrase]"
---
Projet à cadrer : $ARGUMENTS

Objectif : comprendre ce que le client veut vraiment, et pourquoi, avant de construire ou de chiffrer quoi que ce soit. Tu mènes toi-même l'entretien avec le fondateur : ne le délègue pas à un sous-agent, il faut pouvoir lui poser des questions. Tutoie-le, selon le CLAUDE.md.

1. Lis le CLAUDE.md du dossier courant (offres, prix, outils, règles de l'agence) et, s'ils existent, les fichiers du client dans le dossier de l'agence. Si la demande suffit déjà à tout décider (petit changement clair), dis-le, résume en deux lignes ce qui sera fait et propose directement la suite.
2. Premier message : une ligne pour dire que le fondateur peut sauter les questions (« Vas-y directement »), puis une seule question ouverte sur un moment concret : « Raconte-moi la dernière fois que ce problème s'est produit chez le client. » S'il saute les questions, tu prends des choix par défaut prudents pour ce qui est gratuit et réversible, annoncés en une ligne chacun. Les points sensibles (étape 3) restent alors « à décider » dans la fiche, jamais tranchés par toi.
3. Ensuite, travaille par rondes. Une ronde regroupe les questions qui peuvent être posées maintenant, sans dépendre d'une réponse encore attendue. Numérote-les, donne pour chacune ta recommandation, puis attends les réponses avant la ronde suivante :

   **Q1 – titre court** : la question, en langage simple.
   → Ma recommandation : … (et pourquoi, en une phrase)

   Formule la question pour qu'un « oui » accepte ta recommandation, **seulement** pour les choix gratuits et réversibles. Pour la base légale RGPD, la durée de conservation des données, un fournisseur hors de l'Union européenne, le coût mensuel HT et toute action irréversible (envoi, paiement, suppression), demande un choix explicite. Un « oui » global ne vaut jamais réponse sur ces points : repose-les. La base légale et les durées de conservation appartiennent au client, responsable de traitement : le fondateur choisit ce que l'agence lui proposera, et la fiche les range dans les décisions à obtenir du client. La répartition des rôles se vérifie aussi : un client qui traite les données de ses propres clients (paie, comptabilité) peut être lui-même leur sous-traitant ; sans source, marque-la « à vérifier ».
4. Les faits, c'est toi qui les cherches (fichiers du dossier, registre `~/.claude/agence-ia-fr/faits-dates.md`, web) ; les décisions, c'est le fondateur qui les prend. Ne lui demande pas ce que tu peux vérifier toi-même. Un fait que tu n'as pas pu vérifier (tarif, région de traitement d'un fournisseur, limite d'une API) est marqué « à vérifier » avec la page à consulter, y compris pour l'option que tu recommandes (« fournisseur X, si son traitement dans l'Union européenne se confirme »). Tout ce que tu as annoncé pendant l'entretien (« je regarde… », règle datée, réserve du registre) figure dans la fiche, avec ce que tu as trouvé ou comme point ouvert.
5. Terrain à couvrir, sans le réciter comme un questionnaire :
   - le déclencheur et le résultat attendu, ce qui serait un succès et ce qui serait un échec même si « ça marche » ;
   - ce qui existe aujourd'hui : outils du client (logiciel métier, messagerie, CRM), volumes, qui fait quoi, et ce que ces outils font déjà nativement pour ce besoin (adresse e-mail de collecte, import, règles de tri de la messagerie). Si une fonction existante couvre tout ou partie du besoin, dis-le avant de cadrer une construction et compare les deux ; si tu ne peux pas le vérifier, classe-le « à vérifier » avec la page à consulter ;
   - ce qui va changer dans les douze prochains mois et peut modifier le besoin (règle datée du registre, changement d'outil chez le client), avec sa date et son effet sur le flux que l'automatisation traitera : quelle part du volume disparaît, à partir de quand, et combien de mois le projet servira à plein. Pour un projet qui traite des factures, raisonne sur l'émetteur : avec la facturation électronique, les factures des fournisseurs assujettis arriveront par la plateforme agréée du destinataire, et non plus en PDF par e-mail, selon les dates du registre ;
   - les étapes, les points où un humain valide (le plus tard possible, mais toujours avant un envoi, un paiement ou une suppression) et la reprise manuelle si l'automatisation tombe ;
   - où tourne l'automatisation (instance n8n de l'agence ou serveur du client), qui accède à quoi, et par où le client intervient (file de validation, pièces mises de côté, alertes, reprise manuelle) compte tenu des accès accordés (un accès en lecture seule ne permet ni de marquer ni de déplacer un e-mail). Si c'est l'instance de l'agence, reprends en point ouvert la réserve du registre sur la licence n8n (section « À vérifier ») : à faire valider par écrit avant toute proposition ;
   - les données personnelles en jeu (catégories, personnes concernées, données très identifiantes comme le numéro de sécurité sociale ou l'IBAN, et ce que le modèle d'IA lit pour les trier) et chaque copie que l'automatisation va créer (historique des exécutions, fichiers temporaires, file de validation, pièces mises de côté, journal, sauvegardes du serveur, données gardées par le fournisseur d'IA) : pour chacune, une durée choisie explicitement, ou « à vérifier » si elle dépend du fournisseur. Les outils déjà utilisés par le client ne sont pas des sous-traitants de l'agence ; ceux que l'agence ajoute (hébergeur, modèle d'IA) sont des sous-traitants ultérieurs à faire autoriser par écrit par le client. Renvoie au besoin vers `/rgpd` ;
   - ce qu'il ne faut surtout pas faire (anti-objectifs) ;
   - le budget, le délai, le coût mensuel HT (API, hébergement) et l'offre du CLAUDE.md qui correspond. Si tu ne peux pas vérifier un tarif, donne la formule (volume mensuel × prix unitaire) et la page de tarifs à consulter, et marque le montant « à vérifier ». Ne fais pas fixer de plafond de coût sans ordre de grandeur. Donne le coût total pour le client sur douze mois (mise en place, abonnement, coûts mensuels) à côté de son budget ; si le montage suppose un abonnement, son acceptation va dans les décisions à obtenir du client. Reporte dans la fiche l'ordre de grandeur annoncé pendant l'entretien, marqué « estimation non vérifiée ».
6. Aucune donnée réelle de client ou de prospect dans les exemples : données fictives.
7. L'entretien est fini quand plus aucune décision n'est en suspens : n'en ajoute aucune dans la fiche qui n'ait été posée au fondateur, et n'en renvoie aucune à plus tard sous un autre nom (« à fixer en conception », « à préciser »). Avant de montrer la fiche, relis ses points ouverts : ils ne contiennent que des vérifications et des réponses attendues du client ; une décision qui reste (condition pour alléger une validation humaine, destinataire des alertes) fait l'objet d'une dernière ronde. Montre alors la fiche ci-dessous, demande-lui de confirmer, puis propose de l'enregistrer dans `cadrages/` du dossier de l'agence (avec son accord ; dans l'application, il faut que la création de fichiers soit autorisée). C'est un document interne : propose ensuite, s'il le souhaite, une version à envoyer au client (vouvoiement, sans noms de commandes ni jargon interne).

Fiche de cadrage :

```
# Cadrage — [client] — [projet]
Date : [date]   Offre de l'agence : [offre]   Statut : document interne, à valider avec le client

## Le besoin, en une phrase
## Succès / échec (anti-objectifs)
## Situation actuelle (outils, volumes, personnes) et ce qui va changer (règles datées, outils)
## Déroulé cible, étape par étape (déclencheur → résultat)
## Où ça tourne, qui accède à quoi
## Validations humaines et reprise manuelle
## Données personnelles et RGPD (base légale, durée de chaque copie, sous-traitants ultérieurs, à confirmer avec /rgpd)
## Coûts : mise en place HT, coût mensuel HT (formule, montants vérifiés ou « à vérifier »)
## Critères de recette (comment on saura que c'est prêt)
## Décisions prises (par le fondateur, par le client) / Points encore ouverts
```

« Le besoin » dit en une phrase le résultat attendu (qui, quoi, pour quel résultat), pas seulement le problème actuel. Aucun chiffre dans la fiche que le fondateur n'a pas donné ou que tu n'as pas calculé devant lui. Les critères de recette se mesurent pendant la recette ; un objectif mesurable seulement après la mise en service (temps gagné par mois) va dans « Succès / échec ».

Typographie française : espace avant : ; ? ! et à l'intérieur des guillemets « », dates en toutes lettres. Pour la suite, propose `/plan-livraison` (plan par étapes vérifiables), `/automatisation` (conception détaillée), `/tarif` ou `/proposition`.

<!-- Méthode adaptée de mattpocock/skills (skill « grilling », licence MIT, © 2026 Matt Pocock, https://github.com/mattpocock/skills/blob/main/LICENSE) et d'obra/superpowers (skill « brainstorming », licence MIT, © 2025 Jesse Vincent, https://github.com/obra/superpowers/blob/main/LICENSE). Rôle d'orientation : `specialized-workflow-architect-fr`. -->
