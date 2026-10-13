---
description: "Préparer un questionnaire à envoyer à un client ou un prospect pour obtenir les informations qui vous manquent"
argument-hint: "[destinataire et sujet, par exemple : DAF du cabinet Martin, relances clients]"
---
Questionnaire à préparer : $ARGUMENTS

Objectif : obtenir d'une personne (client, prospect, collaborateur du client) ce que le fondateur ne sait pas seul, sous la forme d'un document qu'elle remplit à son rythme ou pendant un rendez-vous. Tu prépares toi-même le questionnaire, en tutoyant le fondateur selon le CLAUDE.md ; le questionnaire, lui, vouvoie toujours le destinataire.

1. Ne pose au fondateur que des questions sur l'envoi, auxquelles il sait toujours répondre, en un seul échange chacune :
   - **À qui ?** Fonction du destinataire, ce qu'il connaît, sa relation avec l'agence (prospect, client, prescripteur). Cela fixe le ton et la quantité de contexte à donner.
   - **Pour décider quoi ?** Les décisions ou les faits précis que le fondateur doit obtenir pour avancer (chiffrage, faisabilité, choix d'outil, données disponibles).
   Si $ARGUMENTS y répond déjà, passe directement à l'étape 2.
2. Rédige le questionnaire avec le modèle ci-dessous : les questions visent l'écart entre ce que le destinataire sait et ce dont le fondateur a besoin, de la plus importante à la moins importante (on n'a souvent qu'un seul passage). Une idée par question, jamais de question double. Ajoute une ligne « Pourquoi c'est utile » seulement quand une question peut être mal comprise.
3. Minimisation des données : ne demande ni mot de passe, ni clé d'accès, ni identifiant de connexion, ni données personnelles de tiers (clients du client, salariés nommés), ni donnée de santé. Pour décrire un volume ou un exemple, demande des ordres de grandeur ou un exemple anonymisé.
4. Montre le questionnaire, puis propose de l'enregistrer dans `questionnaires/` du dossier de l'agence (avec l'accord du fondateur ; dans l'application, il faut que la création de fichiers soit autorisée). Vérifie que chaque point demandé à l'étape 1 est couvert par au moins une question.

Modèle :

```
# [Titre du questionnaire]

**Objet :** pourquoi ce questionnaire, et la décision qui en dépend.
**De :** [prénom, agence] — **À :** [fonction du destinataire]
**Usage de vos réponses :** elles servent uniquement à [préparer le chiffrage / concevoir l'automatisation] ; elles ne sont ni revendues ni utilisées pour autre chose. [Durée de conservation, contact pour les supprimer.]

## Contexte
Un paragraphe pour situer le destinataire, sans jargon.

## Comment répondre
Délai souhaité et temps estimé (par exemple 15 minutes). Une réponse partielle ou « je ne sais pas » est utile : signalez simplement ce dont vous n'êtes pas sûr.

## [Thème]
### [Question, une seule idée]
_Pourquoi c'est utile : …_ (seulement si nécessaire)
>

## Autre chose ?
Y a-t-il un point que nous n'avons pas abordé et que nous devrions connaître ?
```

Français soigné, vouvoiement, typographie française (espace insécable avant : ; ? !, guillemets « »), pas de jargon technique. Pour la suite : `/decouverte` pour préparer le rendez-vous avec le sous-agent `sales-discovery-coach-fr`, ou `/cadrage` une fois les réponses reçues.

<!-- Méthode adaptée de mattpocock/skills (skill « to-questionnaire », licence MIT, © 2026 Matt Pocock). https://github.com/mattpocock/skills -->
