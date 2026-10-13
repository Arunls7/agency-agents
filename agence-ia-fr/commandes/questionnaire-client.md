---
description: "Préparer un questionnaire à envoyer à un client ou un prospect pour obtenir les informations qui vous manquent"
argument-hint: "[destinataire et sujet, par exemple : DAF du cabinet Martin, relances clients]"
---
Questionnaire à préparer : $ARGUMENTS

Objectif : obtenir d'une personne (client, prospect, collaborateur du client) ce que le fondateur ne sait pas seul, sous la forme d'un questionnaire qu'elle remplit à son rythme ou pendant un rendez-vous. Tu le prépares toi-même, en tutoyant le fondateur selon le CLAUDE.md, y compris dans tes remarques autour du questionnaire ; le questionnaire, lui, vouvoie toujours le destinataire.

1. Ne pose au fondateur que des questions sur l'envoi, auxquelles il sait toujours répondre, en un seul échange :
   - **À qui ?** Fonction du destinataire, ce qu'il connaît, sa relation avec l'agence (prospect, client, prescripteur). Cela fixe le ton, la longueur et la quantité de contexte à donner.
   - **Pour décider quoi ?** Les décisions ou les faits précis dont il a besoin pour avancer (chiffrage, faisabilité, choix d'outil, données disponibles).
   - **Contact et conservation** : l'adresse e-mail de contact (prends celle de la signature du CLAUDE.md si elle y figure) et la durée de conservation des réponses (par défaut : le temps du projet ou de la proposition, puis suppression).
   Si $ARGUMENTS et le CLAUDE.md y répondent déjà, passe directement à l'étape 2.
2. Rédige le questionnaire avec le modèle ci-dessous. Les questions visent l'écart entre ce que le destinataire sait et ce dont le fondateur a besoin, classées par importance pour la décision (pour un chiffrage : outils et volumes d'abord). Une idée par question, jamais deux. Au plus 10 questions et une dizaine de minutes pour un prospect ; plus seulement pour un client engagé, et en le disant. Ajoute « Pourquoi c'est utile » seulement quand une question peut être mal comprise.
3. Minimisation des données : ne demande ni mot de passe, ni clé d'accès, ni identifiant de connexion, ni IBAN, numéro de sécurité sociale ou donnée de santé, ni données personnelles de tiers (clients du client, salariés nommés). Pour un volume ou un exemple, demande un ordre de grandeur ou un exemple anonymisé.
4. Avant de montrer le questionnaire, vérifie que chaque point demandé à l'étape 1 est couvert par au moins une question et qu'aucun crochet ne reste dans la ligne « Usage de vos réponses ».
5. Montre le questionnaire en deux versions : le fichier en Markdown, et une version en texte simple prête à coller dans un e-mail (sans #, * ni >). Propose de l'enregistrer dans `questionnaires/` du dossier de l'agence, avec l'accord du fondateur ; dans l'application, il faut que la création de fichiers soit autorisée. N'installe aucun outil pour produire un autre format : si le fondateur veut un document Word, il colle la version texte.

Modèle :

```
# [Titre du questionnaire]

**Objet :** pourquoi ce questionnaire, et la décision qui en dépend.
**De :** [prénom, agence] — **À :** [fonction du destinataire]
**Usage de vos réponses :** elles servent uniquement à [préparer le chiffrage / concevoir l'automatisation] et ne sont ni revendues ni utilisées à d'autres fins. Elles sont conservées [durée], puis supprimées. Vous pouvez y accéder, les faire corriger ou supprimer en écrivant à [adresse e-mail].

## Contexte
Un paragraphe pour situer le destinataire, sans jargon.

## Comment répondre
Délai souhaité et temps estimé. Une réponse partielle ou « je ne sais pas » est utile : signalez simplement ce dont vous n'êtes pas sûr.

## [Thème]
### [Question, une seule idée]
_Pourquoi c'est utile : …_ (seulement si nécessaire)
>

## Autre chose ?
Y a-t-il un point que nous n'avons pas abordé et que nous devrions connaître ?
```

Français soigné, vouvoiement, typographie française (espace avant : ; ? ! et à l'intérieur des guillemets « », dates en toutes lettres), pas de jargon technique. Pour la suite : `/decouverte` pour préparer le rendez-vous, ou `/cadrage` une fois les réponses reçues.

<!-- Méthode adaptée de mattpocock/skills (skill « to-questionnaire », licence MIT, © 2026 Matt Pocock, https://github.com/mattpocock/skills/blob/main/LICENSE). Rôle d'orientation : `sales-discovery-coach-fr`. -->
