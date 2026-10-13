# 🇫🇷 Agence IA — kit Claude Code pour les TPE-PME françaises

38 agents et 26 commandes pour faire tourner une agence IA qui vend à des **dirigeants de TPE-PME françaises** : cabinets d'expertise comptable, agences immobilières, artisans du bâtiment, e-commerçants.

Tout est **adapté à la France** :

- réponses en français : vouvoiement des clients et des prospects, tutoiement du fondateur (sauf préférence contraire) ;
- prix en euros HT ;
- RGPD, AI Act, règles de la CNIL et de la DGCCRF, facture électronique ;
- logiciels utilisés en France (Pennylane, Qonto, Apimo, Obat, PrestaShop…).

Les agents viennent de [The Agency](https://github.com/msitarzewski/agency-agents) (33 adaptés) ou ont été créés pour ce kit (5). Ils ont tous été relus sous trois angles : fidélité, exactitude juridique et qualité du français.

Le kit installe aussi :

- **l'application Agence IA** : une fenêtre à part pour discuter avec chaque agent et suivre l'installation, avec son icône dans vos Applications ;
- [claude-mem](https://github.com/thedotmack/claude-mem) en **mode local** : une mémoire qui persiste d'une session à l'autre, sans compte ni cloud.

## Avant de commencer

- **Système** : macOS ou Linux. Sous Windows, passez par WSL.
- **À installer** : [git](https://git-scm.com/downloads), [Node.js 20 ou plus](https://nodejs.org) (npm inclus), [Claude Code](https://docs.claude.com/fr/docs/claude-code/setup), et un abonnement Claude.
- **Durée** : environ 10 minutes. Le script pose des questions : lisez-les avant de répondre.
- **« command not found: claude »** : l'installeur de Claude Code le place dans `~/.local/bin`, que le terminal ne connaît pas toujours. Le script du kit le trouve quand même. Pour taper `claude` dans le terminal, lancez `echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zprofile`, puis ouvrez un nouveau terminal. Si le terminal répond « permission denied », ce fichier appartient à un autre compte : `ls -l ~/.zprofile ~/.zshrc` vous le montre.
- **Aucun code à écrire.** Les agents techniques (« Production ») servent à concevoir les solutions que vous vendez. Les autres s'utilisent en langage courant.

## Installation

Dans un terminal :

```bash
git clone https://github.com/Arunls7/agency-agents ~/tools/agency-agents
bash ~/tools/agency-agents/agence-ia-fr/setup-agence.sh
```

Le script :

1. vérifie git, Node, npm et Claude Code ;
2. sauvegarde `~/.claude/agents`, `~/.claude/commands`, `~/.claude/settings.json` et `~/.claude/plugins` dans `~/.claude/backups/` ;
3. vérifie que les agents d'origine existent toujours ;
4. copie les agents `-fr` dans `~/.claude/agents/` et les commandes dans `~/.claude/commands/`. Il demande toujours avant d'écraser un fichier ;
5. installe le registre des faits datés et le modèle de `CLAUDE.md` dans `~/.claude/agence-ia-fr/`, puis propose d'ajouter à `~/.claude/settings.json` la règle `Read(~/.claude/agence-ia-fr/**)`. Sans elle, Claude vous demande l'autorisation chaque fois qu'un agent consulte le registre ;
6. installe claude-mem en local, sans télémétrie et sans les publicités de l'offre payante ;
7. prépare l'application Agence IA et propose d'ajouter son icône : `~/Applications/Agence IA.app` sur Mac (Launchpad, Spotlight, Dock), le menu des applications sous Linux ;
8. propose d'installer l'application de bureau Agency Agents (sur Mac, avec Homebrew) ;
9. propose d'ouvrir l'application Agence IA.

Les questions sans risque (`git pull`, « Continuer ? », lecture du registre, icône de l'application, ouverture de l'application) sont à « oui » par défaut : Entrée suffit. Celles qui écrasent un fichier ou installent un logiciel sont à « non » par défaut : tapez `o` pour accepter.

Il ne touche qu'à `~/.claude`, `~/.claude-mem` et `~/tools`. Exceptions, seulement si vous les acceptez : l'icône de l'application (voir l'étape 7) et l'installation de Bun ou uv par claude-mem (voir plus bas). Il n'utilise jamais sudo.

| Option | Effet |
|---|---|
| `--sans-mem` | n'installe pas claude-mem |
| `--avec-originaux` | installe aussi les versions anglaises. Déconseillé : Claude pourrait les choisir à la place des versions françaises. |

## Premiers pas

1. **Décrivez votre agence, une seule fois.** Ouvrez l'application Agence IA et cliquez sur **Créer la fiche**. Le bras droit vous pose une dizaine de questions, puis écrit `~/Agence/CLAUDE.md` : offres, tarifs HT, cibles, ton, signature. Les agents s'en servent ensuite pour chaque devis, message ou contenu. Dans le terminal, c'est `mkdir ~/Agence && cd ~/Agence`, puis `claude` et `/configurer-agence`.
2. **Discutez avec un agent** : choisissez-le en haut de la discussion, ou partez d'une des suggestions.
3. **Vous ne savez pas lequel choisir ?** Écrivez au **bras droit** : il répond lui-même ou confie la demande au bon agent. Dans le terminal, c'est `/agence` suivi de votre demande en une phrase.

Dans le terminal, ouvrez toujours Claude Code dans le dossier de l'agence pour que son contexte soit pris en compte. L'application le fait pour vous.

## L'application Agence IA

Ouvrez **Agence IA** depuis le Launchpad, Spotlight ou le Dock (glissez-y l'icône). Vous pouvez aussi lancer :

```bash
bash ~/tools/agency-agents/agence-ia-fr/app.sh
```

L'application s'ouvre dans sa propre fenêtre, sans barre d'adresse. Elle a besoin de Google Chrome, Microsoft Edge, Brave ou Chromium. Sans eux, elle s'ouvre dans un onglet de votre navigateur.

**La discussion** (premier onglet) :

- **Choix de l'agent** : liste par domaine en haut de la discussion, bouton **Discuter** sur chaque fiche de l'onglet Agents, ou suggestions tirées des commandes de l'agent.
- **Réponses au fil de l'eau**, mises en forme (titres, listes, tableaux), avec un bouton **Copier**. Échap ou le bouton carré arrête une réponse.
- **Actions visibles** : les fichiers lus, les recherches web et les délégations à un autre agent s'affichent au-dessus de la réponse.
- **Création de fichiers** : désactivée par défaut, l'agent lit et cherche sans rien modifier. Activez **Autoriser la création de fichiers** pour qu'il écrive un devis ou une note, uniquement dans `~/Agence`.
- **Historique** : chaque discussion garde sa mémoire. Elle est rangée par date, consultable, exportable en Markdown ou supprimable.

**Ce qu'il faut savoir** :

- **Quota** : les réponses passent par Claude Code (`claude -p --agent …`) et décomptent de votre abonnement, comme dans le terminal.
- **Confidentialité** : les discussions restent sur votre ordinateur, dans `~/.claude/agence-ia-fr/discussions/`. Un petit serveur local fait le lien entre la fenêtre et Claude Code. Il n'écoute que sur `127.0.0.1` et exige un jeton aléatoire. Il s'arrête seul quelques minutes après la fermeture de la fenêtre.
- **En cas de problème** :
  - « Claude Code n'est pas connecté » : ouvrez le Terminal, tapez `claude`, puis `/login`.
  - Le journal est dans `~/.claude/agence-ia-fr/app.log`.
  - `bash …/app.sh --arreter` arrête le serveur.
  - Les chemins de `node` et `claude` sont dans `~/.claude/agence-ia-fr/app.conf`.

## Le tableau de bord

Il est dans l'application (onglet **Tableau de bord**). Pour une page autonome, sans serveur :

```bash
bash ~/tools/agency-agents/agence-ia-fr/tableau-de-bord.sh
```

Une page locale, sur le modèle du tableau de bord de l'application Agency Agents, qui s'ouvre dans votre navigateur. Elle est générée sur votre ordinateur, sans aucune ressource externe ni donnée envoyée.

- **Tableau de bord** :
  - agents disponibles et installés ;
  - santé de l'installation (à jour, obsolètes, modifiés, non suivis, manquants) ;
  - couverture par outil ;
  - remplissage de votre fiche d'agence ;
  - catalogue par domaine.
- **Agents** : recherche et filtre par domaine, avec les commandes qui appellent chaque agent.
- **Commandes**, **Registre** (règles par thème et points à vérifier), **Outils** (claude-mem, application, commandes utiles) et **Activité** (installations et mises à jour).

Relancez la commande pour l'actualiser. Pour un autre dossier d'agence : `bash …/tableau-de-bord.sh ~/MonAgence`.

## L'application Agency Agents

L'application de bureau du projet d'origine ([agencyagents.app](https://agencyagents.app)) parcourt le catalogue **anglais** (environ 230 agents) et l'installe en un clic. `setup-agence.sh` propose de l'installer ; vous pouvez aussi le faire vous-même :

```bash
brew install --cask msitarzewski/agency-agents/agency-agents
```

Sur Linux ou Windows, ou sans Homebrew, passez par la [page de téléchargement](https://github.com/msitarzewski/agency-agents-app/releases/latest).

L'application ne connaît pas les agents `-fr` : pour eux, utilisez l'application Agence IA. N'y installez pas tout le catalogue anglais, sinon Claude risque de choisir une version anglaise à la place d'un agent français. `annuler.sh` la désinstalle si c'est le kit qui l'a installée.

## Les commandes

| Commande | À quoi elle sert |
|---|---|
| `/agence` | Point d'entrée : décrivez la demande, le bon agent s'en charge |
| `/configurer-agence` | Créer ou mettre à jour le `CLAUDE.md` de l'agence |
| `/decouverte` | Préparer ou débriefer un rendez-vous de découverte |
| `/prospection` | Séquence de prospection e-mail, LinkedIn ou téléphone, conforme |
| `/proposition` | Proposition commerciale ou devis |
| `/tarif` | Calcul d'un prix et de sa marge |
| `/offre` | Offre d'appel ou lead magnet pour un métier |
| `/post-linkedin` | Post LinkedIn |
| `/contenu-semaine` | Une idée déclinée en post, vidéo courte et newsletter |
| `/video` | Script, découpage et prompts d'une vidéo IA (Higgsfield, Veo, Kling…) |
| `/pub` | Campagne Meta, LinkedIn ou Google Ads |
| `/avis` | Obtenir des avis Google ou répondre à un avis |
| `/cadrage` | Cadrer un projet avant de le construire : questions par rondes, puis fiche de cadrage |
| `/questionnaire-client` | Questionnaire à envoyer à un client ou un prospect pour obtenir ce qui vous manque |
| `/automatisation` | Cartographier un processus client et concevoir son automatisation |
| `/plan-livraison` | Plan de livraison par petites étapes, chacune avec son test et sa preuve |
| `/recette` | Vérifier qu'une solution est prête à être livrée |
| `/diagnostic` | Une automatisation livrée ne marche plus : trouver la cause avant de corriger |
| `/rgpd` | Question RGPD |
| `/contrat` | Préparer ou relire un contrat |
| `/tresorerie` | Point trésorerie et marge |
| `/relance` | Relancer une facture impayée |
| `/aides` | Trouver un financement, pour un client ou pour l'agence |
| `/partenaires` | Développer des prescripteurs |
| `/veille` | Bulletin de veille IA, réglementation et marché |
| `/bilan-client` | Bilan trimestriel d'un client en abonnement |

Vous pouvez aussi appeler un agent par son nom : « Utilise `juriste-contrats-fr` pour relire ce contrat ».

## Les agents

### Vente

| Agent | À quoi il sert |
|---|---|
| `sales-discovery-coach-fr` | Rendez-vous de découverte (SPIN, Gap Selling, Sandler) |
| `sales-outbound-strategist-fr` | Prospection sortante conforme (consentement préalable au téléphone pour les particuliers depuis le 11/08/2026) |
| `sales-proposal-strategist-fr` | Propositions et devis : ROI, mentions obligatoires, sous-traitance RGPD |
| `sales-offer-lead-gen-strategist-fr` | Offres, lead magnets, canaux d'acquisition |
| `sales-engineer-fr` | Avant-vente : démos, preuves de concept, objections techniques |
| `specialized-pricing-analyst-fr` | Grilles tarifaires et marges |

### Acquisition et contenu

| Agent | À quoi il sert |
|---|---|
| `marketing-linkedin-content-creator-fr` | Posts et ligne éditoriale LinkedIn |
| `marketing-seo-specialist-fr` | SEO local, Google Business Profile, visibilité dans les moteurs IA |
| `marketing-email-strategist-fr` | Newsletters et nurturing conformes |
| `paid-media-paid-social-strategist-fr` | Publicité Meta et LinkedIn |
| `paid-media-ppc-strategist-fr` | Google Ads (Search, Performance Max, Shopping) |
| `paid-media-tracking-specialist-fr` | Mesure conforme CNIL (Consent Mode, conversions hors ligne) |
| `paid-media-creative-strategist-fr` | Accroches, visuels, variantes et tests |
| `contenu-video-ia-fr` ✨ | Vidéos courtes et visuels IA, avec une check-list légale |
| `avis-reputation-locale-fr` ✨ | Avis Google et réputation locale |

### Production

| Agent | À quoi il sert |
|---|---|
| `engineering-ai-engineer-fr` | Concevoir et livrer agents, RAG et automatisations LLM |
| `engineering-multi-agent-systems-architect-fr` | Architecture multi-agents, et savoir quand un seul agent suffit |
| `specialized-mcp-builder-fr` | Serveurs MCP vers les logiciels des clients |
| `specialized-workflow-architect-fr` | Cartographie de processus et automatisations (n8n, Make) |
| `engineering-rag-pipeline-engineer-fr` | Assistants qui répondent à partir des documents du client |
| `engineering-voice-ai-integration-engineer-fr` | Standard téléphonique et secrétariat IA en français |
| `engineering-prompt-engineer-fr` | Prompts et jeux de tests des agents livrés |
| `project-management-project-shepherd-fr` | Pilotage des projets, du cadrage à la recette |
| `testing-reality-checker-fr` | Recette exigeante avant livraison |
| `engineering-it-service-manager-fr` | Maintenance, incidents et rapport mensuel |

### Clients

| Agent | À quoi il sert |
|---|---|
| `customer-success-manager-fr` | Onboarding, bilans, renouvellements, ventes additionnelles |

### Argent

| Agent | À quoi il sert |
|---|---|
| `chief-financial-officer-fr` | Trésorerie sur 13 semaines, marge par projet, échéances |
| `legal-billing-time-tracking-fr` | Suivi des temps, facturation électronique, relances et recouvrement |
| `grant-writer-fr` | Aides et financements pour les clients et pour l'agence |

### Développement et marché

| Agent | À quoi il sert |
|---|---|
| `partenaires-prescripteurs-fr` ✨ | Experts-comptables, éditeurs, CCI/CMA, BNI, Activateurs France Num |
| `business-strategist-fr` | Choix de niche, plan à 12-24 mois, menaces concurrentielles |
| `product-manager-fr` | Offres packagées et revenus récurrents |
| `veille-marche-ia-fr` ✨ | Bulletin du lundi : 5 signaux IA, réglementation et marché |

### Conformité, contrats, organisation

| Agent | À quoi il sert |
|---|---|
| `automation-governance-architect-fr` | Feu vert ou non à une automatisation : risques, supervision humaine |
| `data-privacy-officer-fr` | RGPD : registre, AIPD, sous-traitance, information des personnes |
| `support-legal-compliance-checker-fr` | Veille réglementaire et contrôle de conformité |
| `juriste-contrats-fr` ✨ | CGV, contrats de prestation et de maintenance, propriété intellectuelle |
| `specialized-chief-of-staff-fr` | Bras droit : oriente les demandes, fiche client, comptes rendus |

✨ = agent créé pour ce kit.

Ces agents donnent un cadre et posent les bonnes questions. Ils **ne remplacent pas un avocat, un DPO ou un expert-comptable**.

## Méthodes reprises d'autres projets

Quatre projets open source ont été étudiés : leur code a été relu, puis contre-expertisé pour la sécurité. Le kit n'en installe aucun. Il reprend des méthodes de deux d'entre eux, réécrites en français pour une agence qui livre des automatisations ; les deux autres sont écartés.

| Projet | Ce que le kit en reprend | Pourquoi pas plus |
|---|---|---|
| [superpowers](https://github.com/obra/superpowers) (Jesse Vincent, MIT) | `/cadrage` (questions avant de construire), `/plan-livraison` (petites étapes, test écrit avant, preuve avant de dire « fini »), `/diagnostic` (la cause avant la correction) | Installé tel quel, il injecterait au début de chaque session une consigne impérative en anglais (utiliser ses skills avant toute réponse) et pourrait lancer seul des installations de paquets (npm install, pip install) : il court-circuiterait les commandes du kit et rendrait l'application Agence IA imprévisible. |
| [skills de Matt Pocock](https://github.com/mattpocock/skills) (MIT) | les rondes de questions numérotées avec recommandation (`/cadrage`), `/questionnaire-client`, la méthode de diagnostic (`/diagnostic`) | La plupart des skills supposent un développeur (dépôt git, tickets, revues de code), et certains publient des résumés de conversation dans des tickets GitHub, ce qui pose problème avec des données de clients. La version installée par la place de marché officielle n'est pas celle qui a été relue et se met à jour seule ; le skill « wizard » lit les fichiers .env (clés d'API). |
| [Hermes Agent](https://github.com/NousResearch/hermes-agent) (Nous Research, MIT) | rien | À ne pas installer sur votre Mac : par défaut, il emprunte la connexion de votre abonnement Claude, ce que les conditions d'Anthropic interdisent (risque de suspension du compte qui fait tourner tout le kit, et Claude Code peut se retrouver déconnecté) ; son code est même écrit pour échapper à la détection par laquelle Anthropic facture à part les applications tierces. L'installation par défaut ajoute aussi un service relancé à chaque ouverture de session. Déconseillé aussi pour les clients en l'état : un pilote demanderait une machine virtuelle par client, une clé d'API au nom du client, un seul utilisateur par instance (jamais un bot ouvert à des prospects), de nombreux réglages de sécurité, un contrat de sous-traitance et l'information « vous échangez avec une IA » (AI Act, art. 50). Le dépôt agency-agents sait déjà y exporter ses agents anglais (`integrations/hermes`), mais pas les agents `-fr` de ce kit. |
| [Agent-Reach](https://github.com/Panniantong/Agent-Reach) (Agent Eyes, MIT) | rien | Il fait coller dans la conversation les cookies de votre compte X, pilote votre session LinkedIn et votre Chrome principal avec toutes ses sessions ouvertes, fait lire des profils LinkedIn de prospects par un service tiers (Jina Reader) sans contrat et contacte des serveurs chinois à chaque diagnostic ; son installation complète ajoute des paquets globaux. C'est incompatible avec le RGPD et les conditions d'utilisation de LinkedIn. La recherche web de Claude Code suffit pour la veille. |

Chaque commande adaptée garde la mention de sa source et de sa licence.

## Le registre des faits datés

[`faits-dates.md`](faits-dates.md) rassemble les règles datées dont les agents ont besoin : démarchage, AI Act, facture électronique, délais de paiement, seuils fiscaux, aides… Chaque règle a sa source et sa date de vérification. Les agents doivent rester cohérents avec ce registre. Les points incertains sont dans une section « À vérifier ».

Relisez-le chaque trimestre : `/veille` propose les mises à jour, sources à l'appui.

## Vidéo IA et Higgsfield

`contenu-video-ia-fr` écrit le brief, le script, le découpage plan par plan, les prompts et les sous-titres. Il fonctionne sans aucun outil branché : vous collez ensuite les prompts dans Higgsfield, Veo, Kling ou Runway.

Higgsfield propose aussi un MCP officiel (`https://mcp.higgsfield.ai/mcp`), un CLI et une API, à brancher plus tard si vous le souhaitez. Avant tout usage commercial :

- vérifiez l'offre et les conditions d'utilisation (droits commerciaux, entraînement des modèles sur vos contenus) ;
- signalez les hypertrucages et les avatars réalistes (AI Act, art. 50) ;
- ne présentez jamais un avatar comme un vrai client ;
- obtenez un accord écrit avant de reproduire un visage ou une voix.

## claude-mem : ce qu'il faut savoir

Ce qui suit vaut pour claude-mem 13.36 et 13.37, testés en octobre 2026.

- **Mode local** (`--provider claude`). Les souvenirs restent dans `~/.claude-mem`. Pas de compte cmem.ai, pas de synchronisation cloud, rien à payer.
- **Quota** : en mode local, claude-mem résume vos sessions avec **votre propre quota Claude**. Si vous atteignez souvent votre limite, retirez-le (`npx claude-mem uninstall`) : Claude Code garde sa mémoire native et votre `CLAUDE.md`.
- **Publicités** : claude-mem affiche par défaut une offre d'essai payante (« 30 Day Free Trial ») au démarrage. Le script la masque avec deux réglages de `~/.claude-mem/settings.json` (`CLAUDE_MEM_CONTEXT_SHOW_TERMINAL_OUTPUT` et `CLAUDE_MEM_WELCOME_HINT_ENABLED` à `"false"`). La mémoire reste transmise à Claude.
- **Télémétrie** : activée par défaut par claude-mem, le script la désactive.
- **Bun et uv** : s'ils manquent, l'installeur de claude-mem les télécharge (`curl … | bash`) dans `~/.bun` et `~/.local/bin`. Le script demande d'abord. Vous pouvez aussi les installer vous-même : `brew install oven-sh/bun/bun uv`.
- **Le jeton crypto « CMEM »** n'a aucun rapport avec l'outil.
- **Où le consulter** : la visionneuse est sur `http://127.0.0.1:` suivi du port de votre session. Il vaut 37700 plus votre numéro d'utilisateur modulo 100, donc souvent **37701** sur Mac. Le script et le tableau de bord affichent la bonne adresse, et `npx claude-mem status` donne l'état du service.

## Annuler

```bash
bash ~/tools/agency-agents/agence-ia-fr/annuler.sh
```

Ce que fait le script :

- **Il désinstalle claude-mem**, en gardant vos souvenirs.
- **Il supprime ce que le kit a installé** : agents, commandes, application Agence IA (icône, discussions), `~/.claude/agence-ia-fr` et la règle de lecture ajoutée à `settings.json`.
- **Il restaure** vos agents, vos commandes et `settings.json` tels qu'ils étaient avant la toute première installation, même après plusieurs mises à jour.

Votre `CLAUDE.md` d'agence n'est jamais touché. Le script demande confirmation à chaque étape.

## Mettre à jour

```bash
bash ~/tools/agency-agents/agence-ia-fr/mettre-a-jour.sh
```

Le script :

1. fait un `git pull` ;
2. signale les agents d'origine modifiés depuis la dernière mise à jour ;
3. réinstalle les agents et commandes du kit, avec une nouvelle sauvegarde.

Pour récupérer les nouveautés du dépôt d'origine, cliquez d'abord sur **Sync fork** sur la page GitHub du fork.

## Contenu du dossier

| Élément | Rôle |
|---|---|
| `agents/` | les 38 agents `-fr` |
| `commandes/` | les 26 commandes `/slash` |
| `modele-agence/CLAUDE.md` | modèle du contexte de l'agence, rempli par `/configurer-agence` |
| `faits-dates.md` | registre des faits datés, sourcés et vérifiés |
| `agency-team.txt` | identifiants des agents d'origine adaptés |
| `setup-agence.sh` · `annuler.sh` · `mettre-a-jour.sh` | installation, retour en arrière, mise à jour |
| `app.sh` · `app/` | application Agence IA : lanceur, serveur local (`serveur.mjs`), interface de discussion, icône |
| `tableau-de-bord.sh` · `outils/tableau-de-bord.mjs` | tableau de bord (page autonome, et dans l'application) |

Ce dossier n'est pas une « division » d'agency-agents : l'installeur d'origine ne le parcourt pas, et il est exclu de `scripts/check-divisions.sh`.

## Liens

- **agency-agents (original)** : <https://github.com/msitarzewski/agency-agents>
- **claude-mem** : <https://github.com/thedotmack/claude-mem>, avec sa [documentation d'installation](https://docs.claude-mem.ai/installation)
- **Claude Code et Agent SDK** : [documentation](https://docs.claude.com), SDK [Python](https://github.com/anthropics/claude-agent-sdk-python) et [TypeScript](https://github.com/anthropics/claude-agent-sdk-typescript), [démos](https://github.com/anthropics/claude-agent-sdk-demos), [cookbooks](https://github.com/anthropics/claude-cookbooks)
- **Serveurs MCP de référence** : <https://github.com/modelcontextprotocol/servers>
- **CNIL** : [IA](https://www.cnil.fr/fr/intelligence-artificielle), [prospection commerciale par e-mail](https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique)
- **DGCCRF** : [démarchage téléphonique](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/les-regles-du-demarchage-telephonique-simposant-aux-entreprises)
- **Facturation électronique** : <https://www.impots.gouv.fr/facturation-electronique-et-plateformes-agreees>
- **Higgsfield** : [MCP et Claude](https://higgsfield.ai/creator-hub/help-center/mcp-cli/how-do-i-connect-higgsfield-to-claude), [droits sur les générations](https://higgsfield.ai/creator-hub/help-center/account/who-owns-my-generations-and-can-i-use-them-commercially)
