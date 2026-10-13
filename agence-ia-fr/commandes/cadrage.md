---
description: "Cadrer un projet d'automatisation ou d'agent IA avant de le construire : questions par rondes, puis fiche de cadrage"
argument-hint: "[client et idée du projet, en une phrase]"
---
Projet à cadrer : $ARGUMENTS

Objectif : comprendre ce que le client veut vraiment, et pourquoi, avant de construire ou de chiffrer quoi que ce soit. Tu mènes toi-même l'entretien avec le fondateur (ne le délègue pas à un sous-agent : il faut pouvoir lui poser des questions). Tutoie-le, selon le CLAUDE.md.

1. Lis le CLAUDE.md du dossier courant (offres, prix, outils, règles de l'agence). Si la demande suffit déjà à tout décider (petit changement clair), dis-le, résume en deux lignes ce qui sera fait et propose directement la suite.
2. Premier message : une ligne pour dire que le fondateur peut sauter les questions (« Vas-y directement » : tu prends alors des choix par défaut prudents, annoncés en une ligne chacun), puis une seule question ouverte sur un moment concret : « Raconte-moi la dernière fois que ce problème s'est produit chez le client. »
3. Ensuite, travaille par rondes. Une ronde regroupe les questions qui peuvent être posées maintenant, sans dépendre d'une réponse encore attendue. Numérote-les, donne pour chacune ta recommandation, puis attends les réponses avant la ronde suivante :

   ❓ **Q1 – titre court** : la question, en langage simple.
   ➡️ Ma recommandation : … (et pourquoi, en une phrase)

   Formule la question pour qu'un « oui » accepte ta recommandation, **seulement** pour les choix gratuits et réversibles. Pour la base légale RGPD, la durée de conservation des données, un fournisseur hors de l'Union européenne, le coût mensuel HT et toute action irréversible (envoi, paiement, suppression), demande un choix explicite et ne compte jamais un « oui » global comme une réponse.
4. Les faits, c'est toi qui les cherches (fichiers du dossier, registre `~/.claude/agence-ia-fr/faits-dates.md`, web) ; les décisions, c'est le fondateur qui les prend. Ne lui demande pas ce que tu peux vérifier toi-même.
5. Terrain à couvrir, sans le réciter comme un questionnaire :
   - le déclencheur et le résultat attendu, ce qui serait un succès et ce qui serait un échec même si « ça marche » ;
   - ce qui existe aujourd'hui : outils du client (logiciel métier, messagerie, CRM), volumes, qui fait quoi ;
   - les étapes, les points où un humain valide (le plus tard possible, mais toujours avant un envoi, un paiement ou une suppression) et la reprise manuelle si l'automatisation tombe ;
   - les données personnelles en jeu (renvoie au besoin vers `/rgpd`) et ce qu'il ne faut pas faire (anti-objectifs) ;
   - le budget, le délai, le coût mensuel HT (API, hébergement) et l'offre du CLAUDE.md qui correspond.
6. Aucune donnée réelle de client ou de prospect dans les exemples : données fictives.
7. L'entretien est fini quand plus aucune décision n'est en suspens. Montre alors la fiche de cadrage ci-dessous, demande au fondateur de confirmer, puis propose de l'enregistrer dans `cadrages/` du dossier de l'agence (avec son accord ; dans l'application, il faut que la création de fichiers soit autorisée).

Fiche de cadrage :

```
# Cadrage — [client] — [projet]
Date : [date]   Offre du CLAUDE.md : [offre]   Statut : à valider par le client

## Le besoin, en une phrase
## Succès / échec (anti-objectifs)
## Situation actuelle (outils, volumes, personnes)
## Déroulé cible, étape par étape (déclencheur → résultat)
## Validations humaines et reprise manuelle
## Données personnelles et RGPD (base légale, durée, sous-traitants, à confirmer avec /rgpd)
## Coûts : mise en place HT, coût mensuel HT, hypothèses
## Critères de recette (comment on saura que c'est prêt)
## Décisions prises (et par qui) / Points encore ouverts
```

Typographie française (espace insécable avant : ; ? !, guillemets « »). Pour la suite, propose `/plan-livraison` (plan par étapes vérifiables), `/automatisation` (conception détaillée par le sous-agent `specialized-workflow-architect-fr`), `/tarif` ou `/proposition`.

<!-- Méthode adaptée de mattpocock/skills (skill « grilling », licence MIT, © 2026 Matt Pocock) et d'obra/superpowers (skill « brainstorming », licence MIT, © 2025 Jesse Vincent). https://github.com/mattpocock/skills · https://github.com/obra/superpowers -->
