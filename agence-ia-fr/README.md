# 🇫🇷 Agence IA — kit Claude Code pour les TPE-PME françaises

38 agents et 22 commandes pour faire tourner une agence IA qui vend à des **dirigeants de TPE-PME françaises** : cabinets d'expertise comptable, agences immobilières, artisans du bâtiment, e-commerçants.

Tout est **adapté à la France** :

- réponses en français, avec le vouvoiement des dirigeants ;
- prix en euros HT ;
- RGPD, AI Act, règles de la CNIL et de la DGCCRF, facture électronique ;
- logiciels utilisés en France (Pennylane, Qonto, Apimo, Obat, PrestaShop…).

Les agents viennent de [The Agency](https://github.com/msitarzewski/agency-agents) (33 adaptés) ou ont été créés pour ce kit (5). Ils ont tous été relus sous trois angles : fidélité, exactitude juridique et qualité du français.

Le kit installe aussi [claude-mem](https://github.com/thedotmack/claude-mem) en **mode local**. C'est une mémoire qui persiste d'une session à l'autre, sans compte ni cloud.

## Avant de commencer

- **Système** : macOS ou Linux. Sous Windows, passez par WSL.
- **À installer** : [git](https://git-scm.com/downloads), [Node.js 20 ou plus](https://nodejs.org) (npm inclus), [Claude Code](https://docs.claude.com/fr/docs/claude-code/setup), et un abonnement Claude.
- **Durée** : environ 10 minutes. Le script pose des questions : lisez-les avant de répondre.
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
5. installe le registre des faits datés et le modèle de `CLAUDE.md` dans `~/.claude/agence-ia-fr/` ;
6. installe claude-mem en local, sans télémétrie.

Il ne touche qu'à `~/.claude`, `~/.claude-mem` et `~/tools`, sauf si vous acceptez que claude-mem installe Bun ou uv (voir plus bas). Il n'utilise jamais sudo.

| Option | Effet |
|---|---|
| `--sans-mem` | n'installe pas claude-mem |
| `--avec-originaux` | installe aussi les versions anglaises. Déconseillé : Claude pourrait les choisir à la place des versions françaises. |

## Premiers pas

1. **Décrivez votre agence, une seule fois.** Créez un dossier de travail (par exemple `mkdir ~/Agence && cd ~/Agence`), lancez `claude`, puis tapez `/configurer-agence`. Une dizaine de questions servent à remplir un `CLAUDE.md` : offres, tarifs HT, cibles, ton, signature. Les agents s'en servent ensuite pour chaque devis, message ou contenu.
2. **Essayez une commande** : `/decouverte dirigeant d'un cabinet comptable de 8 personnes, Lyon`.
3. **Vous ne savez pas quoi utiliser ?** `/agence` suivi de votre demande en une phrase : la demande est confiée au bon agent.

Ouvrez toujours Claude Code dans ce dossier pour que le contexte de l'agence soit pris en compte.

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
| `/automatisation` | Cartographier un processus client et concevoir son automatisation |
| `/recette` | Vérifier qu'une solution est prête à être livrée |
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

Ce qui suit vaut pour claude-mem 13.36, testé en octobre 2026.

- **Mode local** (`--provider claude`). Les souvenirs restent dans `~/.claude-mem`. Pas de compte cmem.ai, pas de synchronisation cloud, pas d'essai payant.
- **Télémétrie** : activée par défaut par claude-mem, le script la désactive.
- **Bun et uv** : s'ils manquent, l'installeur de claude-mem les télécharge (`curl … | bash`) dans `~/.bun` et `~/.local/bin`. Le script demande d'abord. Vous pouvez aussi les installer vous-même : `brew install oven-sh/bun/bun uv`.
- **Le jeton crypto « CMEM »** n'a aucun rapport avec l'outil.
- **Où le consulter** : la visionneuse est sur <http://127.0.0.1:37700>, l'état du service s'affiche avec `npx claude-mem status`.

## Annuler

```bash
bash ~/tools/agency-agents/agence-ia-fr/annuler.sh
```

Ce que fait le script :

- **Il désinstalle claude-mem**, en gardant vos souvenirs.
- **Il supprime ce que le kit a installé** : agents, commandes et `~/.claude/agence-ia-fr`.
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
| `commandes/` | les 22 commandes `/slash` |
| `modele-agence/CLAUDE.md` | modèle du contexte de l'agence, rempli par `/configurer-agence` |
| `faits-dates.md` | registre des faits datés, sourcés et vérifiés |
| `agency-team.txt` | identifiants des agents d'origine adaptés |
| `setup-agence.sh` · `annuler.sh` · `mettre-a-jour.sh` | installation, retour en arrière, mise à jour |

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
