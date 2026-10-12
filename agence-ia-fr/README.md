# 🇫🇷 Agence IA — kit Claude Code pour les TPE-PME françaises

21 agents de [The Agency](https://github.com/msitarzewski/agency-agents) **adaptés au marché français** : réponses en français, vouvoiement des dirigeants, prix en euros HT, RGPD, AI Act, CNIL, logiciels utilisés en France (Pennylane, Qonto, Apimo, Obat, PrestaShop…), sans références propres aux États-Unis ou à la Chine.

Cible : dirigeants de cabinets d'expertise comptable, d'agences immobilières, d'entreprises artisanales et de sites e-commerce.

Le kit installe aussi [claude-mem](https://github.com/thedotmack/claude-mem) en **mode local** : mémoire persistante entre les sessions, sans compte ni cloud.

## Installation

Dans un terminal, depuis votre dossier personnel :

```bash
git clone https://github.com/Arunls7/agency-agents ~/tools/agency-agents
bash ~/tools/agency-agents/agence-ia-fr/setup-agence.sh
```

Le script :

1. vérifie git, Node ≥ 20, npm et Claude Code ;
2. sauvegarde `~/.claude/agents`, `~/.claude/settings.json` et `~/.claude/plugins` dans `~/.claude/backups/AAAA-MM-JJ-HHMMSS/` ;
3. vérifie que les 21 agents d'origine existent toujours dans le dépôt ;
4. copie les 21 agents `-fr` dans `~/.claude/agents/`. Il demande avant d'écraser un fichier et contrôle le frontmatter ;
5. installe claude-mem en local (`--provider claude`), coupe la télémétrie, démarre le service ;
6. affiche les tests à faire.

Il demande confirmation avant chaque étape qui écrit des fichiers. Il ne touche qu'à `~/.claude`, `~/.claude-mem` et `~/tools` (et, seulement si vous l'acceptez, à `~/.bun` et `~/.local/bin` : voir plus bas). Il n'utilise jamais sudo.

| Option | Effet |
|---|---|
| `--avec-originaux` | installe aussi les 21 versions anglaises. Déconseillé : Claude pourrait choisir la version anglaise. |
| `--sans-mem` | n'installe pas claude-mem |

## Les agents

Pour appeler un agent, nommez-le dans votre demande (« Utilise `sales-discovery-coach-fr` pour… »). Vous pouvez aussi laisser Claude choisir d'après la description de chaque agent.

### Vente

| Agent | Fichier | À quoi il sert | Exemple de demande |
|---|---|---|---|
| `sales-discovery-coach-fr` | [agents/sales-discovery-coach-fr.md](agents/sales-discovery-coach-fr.md) | Préparer et débriefer les rendez-vous de découverte (SPIN, Gap Selling, Sandler) | « Propose 5 questions d'ouverture pour un entretien avec un dirigeant de cabinet comptable. » |
| `sales-outbound-strategist-fr` | [agents/sales-outbound-strategist-fr.md](agents/sales-outbound-strategist-fr.md) | Prospection sortante : cible, signaux, séquences e-mail, LinkedIn et téléphone conformes CNIL | « Construis une séquence de 4 e-mails vers les agences immobilières indépendantes de Bordeaux. » |
| `sales-proposal-strategist-fr` | [agents/sales-proposal-strategist-fr.md](agents/sales-proposal-strategist-fr.md) | Propositions commerciales et devis (ROI, mentions obligatoires, sous-traitance RGPD) | « Rédige la proposition pour automatiser la collecte des pièces d'un cabinet de 8 personnes. » |
| `sales-offer-lead-gen-strategist-fr` | [agents/sales-offer-lead-gen-strategist-fr.md](agents/sales-offer-lead-gen-strategist-fr.md) | Offres, lead magnets, canaux d'acquisition et partenariats | « Imagine une offre d'appel pour les artisans du bâtiment, avec un lead magnet. » |
| `sales-engineer-fr` | [agents/sales-engineer-fr.md](agents/sales-engineer-fr.md) | Avant-vente : démos, preuves de concept, objections techniques | « Prépare une démo de 15 minutes pour un e-commerçant sous PrestaShop. » |
| `specialized-pricing-analyst-fr` | [agents/specialized-pricing-analyst-fr.md](agents/specialized-pricing-analyst-fr.md) | Grilles tarifaires : diagnostic, forfaits, abonnements, marges | « Calcule le prix d'un abonnement de maintenance qui couvre l'API, n8n et 2 h par mois. » |

### Acquisition

| Agent | Fichier | À quoi il sert | Exemple de demande |
|---|---|---|---|
| `marketing-linkedin-content-creator-fr` | [agents/marketing-linkedin-content-creator-fr.md](agents/marketing-linkedin-content-creator-fr.md) | Posts et ligne éditoriale LinkedIn du fondateur | « Écris un post sur les 3 tâches qu'un cabinet comptable peut automatiser avant la période fiscale. » |
| `marketing-seo-specialist-fr` | [agents/marketing-seo-specialist-fr.md](agents/marketing-seo-specialist-fr.md) | SEO local, Google Business Profile, contenu, visibilité dans les moteurs IA | « Audite le SEO local de mon site pour "agence IA Lyon". » |
| `marketing-email-strategist-fr` | [agents/marketing-email-strategist-fr.md](agents/marketing-email-strategist-fr.md) | Newsletters et séquences de nurturing conformes au RGPD | « Crée une séquence de bienvenue pour les inscrits au webinaire. » |

### Production

| Agent | Fichier | À quoi il sert | Exemple de demande |
|---|---|---|---|
| `engineering-ai-engineer-fr` | [agents/engineering-ai-engineer-fr.md](agents/engineering-ai-engineer-fr.md) | Concevoir et livrer agents, RAG et automatisations LLM | « Conçois un agent qui trie les e-mails entrants d'une agence immobilière. » |
| `engineering-multi-agent-systems-architect-fr` | [agents/engineering-multi-agent-systems-architect-fr.md](agents/engineering-multi-agent-systems-architect-fr.md) | Architecture multi-agents (et savoir quand un seul agent suffit) | « Faut-il plusieurs agents pour gérer devis, relances et factures d'un artisan ? » |
| `specialized-mcp-builder-fr` | [agents/specialized-mcp-builder-fr.md](agents/specialized-mcp-builder-fr.md) | Serveurs MCP qui relient Claude aux logiciels du client | « Crée un serveur MCP en lecture seule sur l'API Pennylane. » |
| `specialized-workflow-architect-fr` | [agents/specialized-workflow-architect-fr.md](agents/specialized-workflow-architect-fr.md) | Cartographier un processus et concevoir l'automatisation (n8n, Make) | « Cartographie le parcours demande de devis → acompte d'un plombier. » |
| `engineering-rag-pipeline-engineer-fr` | [agents/engineering-rag-pipeline-engineer-fr.md](agents/engineering-rag-pipeline-engineer-fr.md) | Assistants qui répondent à partir des documents du client | « Monte un assistant sur les procédures internes d'un cabinet de 15 personnes. » |
| `engineering-voice-ai-integration-engineer-fr` | [agents/engineering-voice-ai-integration-engineer-fr.md](agents/engineering-voice-ai-integration-engineer-fr.md) | Standard téléphonique et secrétariat IA en français | « Conçois un standard IA qui prend les urgences d'un chauffagiste quand il est sur chantier. » |
| `engineering-prompt-engineer-fr` | [agents/engineering-prompt-engineer-fr.md](agents/engineering-prompt-engineer-fr.md) | Prompts et jeux de tests des agents livrés | « Écris le prompt système de l'assistant SAV d'une boutique Shopify, avec 10 cas de test. » |
| `project-management-project-shepherd-fr` | [agents/project-management-project-shepherd-fr.md](agents/project-management-project-shepherd-fr.md) | Pilotage des projets clients, du cadrage à la recette | « Fais le planning d'un projet de 6 semaines pour un cabinet, en évitant la période fiscale. » |
| `testing-reality-checker-fr` | [agents/testing-reality-checker-fr.md](agents/testing-reality-checker-fr.md) | Recette exigeante avant livraison | « Vérifie si cet agent est prêt à être livré au client. » |

### Rétention

| Agent | Fichier | À quoi il sert | Exemple de demande |
|---|---|---|---|
| `customer-success-manager-fr` | [agents/customer-success-manager-fr.md](agents/customer-success-manager-fr.md) | Onboarding, bilans trimestriels, renouvellements, ventes additionnelles | « Prépare le bilan trimestriel de l'agence immobilière Dupont. » |

### Gouvernance et conformité

| Agent | Fichier | À quoi il sert | Exemple de demande |
|---|---|---|---|
| `automation-governance-architect-fr` | [agents/automation-governance-architect-fr.md](agents/automation-governance-architect-fr.md) | Go/no-go d'une automatisation : risques, supervision humaine, RGPD, AI Act | « Cette relance automatique des impayés est-elle raisonnable ? Quels garde-fous ? » |
| `data-privacy-officer-fr` | [agents/data-privacy-officer-fr.md](agents/data-privacy-officer-fr.md) | Registre, AIPD, contrat de sous-traitance, information des personnes | « Rédige le contrat de sous-traitance RGPD entre mon agence et un cabinet comptable. » |

Ces agents donnent un cadre et posent les bonnes questions. Ils **ne remplacent pas un avocat, un DPO ou un expert-comptable**.

## claude-mem : ce qu'il faut savoir

Le kit a été testé avec claude-mem 13.36 (octobre 2026).

- **Mode local** (`--provider claude`). Les souvenirs restent dans `~/.claude-mem`. Aucun compte cmem.ai, aucune synchronisation cloud, aucun essai payant. Les résumés sont produits par votre propre abonnement Claude.
- **Télémétrie** : activée par défaut par claude-mem, le script la désactive (`npx claude-mem telemetry disable`).
- **Bun et uv** : s'ils manquent, l'installeur de claude-mem les télécharge lui-même (`curl … | bash`) dans `~/.bun` et `~/.local/bin`. Le script vous demande d'abord. Vous pouvez aussi les installer vous-même : `brew install oven-sh/bun/bun uv`.
- **Le jeton crypto « CMEM »** mentionné dans le README de claude-mem n'a aucun rapport avec l'outil : à ignorer.
- Visionneuse locale : <http://127.0.0.1:37700> · état du service : `npx claude-mem status`.

## Annuler

```bash
bash ~/tools/agency-agents/agence-ia-fr/annuler.sh            # dernière sauvegarde
bash ~/tools/agency-agents/agence-ia-fr/annuler.sh ~/.claude/backups/2026-10-12-143000
```

Le script désinstalle claude-mem, en gardant vos souvenirs dans `~/.claude-mem`. Il supprime ensuite les agents ajoutés par le kit, puis restaure les agents et `settings.json` d'avant. Il demande confirmation à chaque étape.

## Mettre à jour

```bash
bash ~/tools/agency-agents/agence-ia-fr/mettre-a-jour.sh
```

Le script fait un `git pull` et liste les agents d'origine qui ont changé (leur version `-fr` est peut-être à revoir), puis relance l'installation avec une nouvelle sauvegarde. Pour récupérer les nouveautés du dépôt d'origine, cliquez d'abord sur **Sync fork** sur la page GitHub du fork.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `agents/*-fr.md` | les 21 agents adaptés |
| `agency-team.txt` | identifiants des agents d'origine (utilisés par `--avec-originaux` et par les vérifications) |
| `setup-agence.sh` | installation |
| `annuler.sh` | retour en arrière |
| `mettre-a-jour.sh` | mise à jour |

Ce dossier n'est pas une « division » d'agency-agents : l'installeur d'origine ne le parcourt pas. Il est exclu de `scripts/check-divisions.sh`.

## Liens

- agency-agents (original) : <https://github.com/msitarzewski/agency-agents> · application de bureau : <https://agencyagents.app>
- claude-mem : <https://github.com/thedotmack/claude-mem> · installation : <https://docs.claude-mem.ai/installation> · configuration : <https://docs.claude-mem.ai/configuration>
- Claude Code et Agent SDK : <https://docs.claude.com> · SDK [Python](https://github.com/anthropics/claude-agent-sdk-python) / [TypeScript](https://github.com/anthropics/claude-agent-sdk-typescript) · [démos](https://github.com/anthropics/claude-agent-sdk-demos) · [cookbooks](https://github.com/anthropics/claude-cookbooks)
- Serveurs MCP de référence : <https://github.com/modelcontextprotocol/servers>
- CNIL et IA : <https://www.cnil.fr/fr/intelligence-artificielle> · prospection commerciale : <https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique>
- Facturation électronique : <https://www.impots.gouv.fr/facturation-electronique-et-plateformes-agreees>
