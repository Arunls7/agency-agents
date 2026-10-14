---
description: "Préparer un questionnaire à envoyer à un client ou un prospect pour obtenir les informations qui vous manquent"
argument-hint: "[destinataire et sujet, par exemple : DAF du cabinet Martin, relances clients]"
---
Questionnaire à préparer : $ARGUMENTS

Objectif : obtenir d'une personne (client, prospect, collaborateur du client) ce que le fondateur ne sait pas seul, sous la forme d'un questionnaire qu'elle remplit à son rythme ou pendant un rendez-vous. Tu le prépares toi-même, en tutoyant le fondateur selon le CLAUDE.md, y compris dans tes remarques autour du questionnaire ; le questionnaire, lui, vouvoie toujours le destinataire.

1. Ne pose au fondateur que des questions sur l'envoi, auxquelles il sait toujours répondre, en un seul échange :
   - **À qui ?** Fonction du destinataire, ce qu'il connaît, sa relation avec l'agence (prospect, client, prescripteur). Cela fixe le ton, la longueur et la quantité de contexte à donner.
   - **Pour décider quoi ?** Les décisions ou les faits précis dont il a besoin pour avancer (chiffrage, faisabilité, choix d'outil, données disponibles).
   - **Contact et conservation** : l'adresse e-mail de contact (prends celle de la signature du CLAUDE.md si elle y figure) et la durée de conservation des réponses (par défaut : six mois après le dernier échange si le projet ne se fait pas ; s'il se fait, elles rejoignent le dossier du projet). Écris une durée de ce type, jamais « le temps de la proposition » seul.
   Si $ARGUMENTS et le CLAUDE.md y répondent déjà, passe directement à l'étape 2.
2. Rédige le questionnaire avec le modèle ci-dessous. Les questions visent l'écart entre ce que le destinataire sait et ce dont le fondateur a besoin, classées par importance pour la décision (pour un chiffrage : outils et volumes d'abord, puis les étapes actuelles, de l'arrivée d'une demande jusqu'à son issue, et le temps passé ; les irritants et les souhaits ensuite). Une idée par question, jamais deux, y compris dans les précisions entre parenthèses (pas de « Précisez aussi… »). Au plus 10 questions et une dizaine de minutes pour un prospect ; plus seulement pour un client engagé, et en le disant. Ajoute « Pourquoi c'est utile » seulement quand une question peut être mal comprise.
3. Minimisation des données : ne demande ni mot de passe, ni clé d'accès, ni identifiant de connexion, ni IBAN, numéro de sécurité sociale ou donnée de santé, ni données personnelles de tiers (clients du client, salariés nommés). Pour un volume ou un exemple, demande un ordre de grandeur ou un exemple anonymisé.
4. Avant de montrer le questionnaire, vérifie que chaque point demandé à l'étape 1 est couvert par au moins une question (pour un chiffrage, une question porte sur les étapes actuelles : savoir qui traite ne suffit pas), qu'aucun crochet ne reste dans la ligne « Usage de vos réponses » et que le contexte ne prête au destinataire aucune parole, aucun chiffre ni aucun besoin que le fondateur n'a pas rapportés. Relis chaque question avec sa précision : si elle demande deux choses reliées par « et », « ou » ou « aussi », coupe-la en deux ou garde la plus utile. N'annonce au fondateur que les vérifications réellement faites.
5. Montre le questionnaire en deux versions : le fichier en Markdown, et une version en texte simple prête à coller dans un e-mail (sans #, * ni >) : l'objet de l'e-mail sur une ligne à part, au-dessus du bloc, puis le bloc, qui commence par « Bonjour, » et reprend tout le contenu, y compris la phrase d'objet. Après toute modification demandée par le fondateur, redonne la version texte complète et corrigée. Propose de l'enregistrer dans `questionnaires/` du dossier de l'agence, avec l'accord du fondateur ; dans l'application, il faut que la création de fichiers soit autorisée. N'installe aucun outil pour produire un autre format : si le fondateur veut un document Word, il colle la version texte.

Modèle :

```
# [Titre du questionnaire]

**Objet :** pourquoi ce questionnaire, et la décision qui en dépend, en nommant concrètement ce qui est envisagé (par exemple « un assistant automatique qui répond aux demandes de visite », pas seulement « un assistant »).
**De :** [prénom, agence] — **À :** [fonction du destinataire]
**Usage de vos réponses :** elles servent uniquement à [préparer le chiffrage / concevoir l'automatisation] et ne sont ni revendues ni utilisées à d'autres fins. Elles sont conservées [durée], puis supprimées. Vous pouvez y accéder, les faire corriger ou supprimer en écrivant à [adresse e-mail].

## Contexte
Un paragraphe pour situer le destinataire, sans jargon, avec les seuls faits donnés par le fondateur (lieu de la rencontre, sujet évoqué). S'il manque un détail utile, laisse-le entre crochets ([nom du salon]) et signale-le au fondateur.

## Comment répondre
Date de réponse souhaitée, en toutes lettres et calculée à partir de la date du jour (par exemple « d'ici le mardi 20 octobre »), et temps estimé. (Signale au fondateur la date retenue pour qu'il l'ajuste.) Une réponse partielle ou « je ne sais pas » est utile : signalez simplement ce dont vous n'êtes pas sûr.

## [Thème]
### [Question, une seule idée]
_Pourquoi c'est utile : …_ (seulement si nécessaire)
>

## Autre chose ?
Y a-t-il un point que nous n'avons pas abordé et que nous devrions connaître ?
```

Français soigné, vouvoiement, typographie française (espace avant : ; ? ! et à l'intérieur des guillemets « », dates en toutes lettres), pas de jargon technique. Pour la suite : `/decouverte` pour préparer le rendez-vous, ou `/cadrage` une fois les réponses reçues.

<!-- Méthode adaptée de mattpocock/skills (skill « to-questionnaire », licence MIT, © 2026 Matt Pocock, https://github.com/mattpocock/skills/blob/main/LICENSE). Rôle d'orientation : `sales-discovery-coach-fr`. -->
