#!/usr/bin/env bash
#
# setup-agence.sh — configure Claude Code pour une agence IA (cible : TPE-PME françaises).
#
#   0 prérequis · 1 sauvegarde · 2 dépôt agency-agents · 3 agents FR ·
#   4 commandes /slash et fichiers de référence · 5 claude-mem (mémoire locale) ·
#   6 application Agence IA (tableau de bord et discussion avec les agents) ·
#   7 application Agency Agents (optionnel) · 8 premiers pas
#
# Ne touche qu'à ~/.claude, ~/.claude-mem et ~/tools. Seulement si vous l'acceptez :
# l'icône « Agence IA » dans ~/Applications (macOS) ou le menu des applications (Linux),
# et l'application Agency Agents installée avec Homebrew. Pas de sudo.
# Demande confirmation avant d'écraser un fichier ou d'installer quoi que ce soit.
#
# Installation :
#   git clone https://github.com/Arunls7/agency-agents ~/tools/agency-agents
#   bash ~/tools/agency-agents/agence-ia-fr/setup-agence.sh
#
# Options :
#   --avec-originaux  installe aussi les versions anglaises d'origine
#                     (déconseillé : Claude risque de choisir la version anglaise)
#   --sans-mem        n'installe pas claude-mem
#   --maj             (utilisé par mettre-a-jour.sh) remplace les fichiers du kit sans demander

set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AA_DIR="$(cd "${KIT_DIR}/.." && pwd)"
TEAM_FILE="${KIT_DIR}/agency-team.txt"
CLAUDE_DIR="${HOME}/.claude"
AGENTS_DIR="${CLAUDE_DIR}/agents"
COMMANDS_DIR="${CLAUDE_DIR}/commands"
REF_DIR="${CLAUDE_DIR}/agence-ia-fr"

WITH_ORIGINALS=false
WITH_MEM=true
UPDATE=false
for arg in "$@"; do
  case "$arg" in
    --avec-originaux) WITH_ORIGINALS=true ;;
    --sans-mem) WITH_MEM=false ;;
    --maj) UPDATE=true ;;  # utilisé par mettre-a-jour.sh : remplace les agents -fr sans demander
    -h|--help) sed -n '2,23p' "$0"; exit 0 ;;
    *) echo "Option inconnue : $arg (voir --help)" >&2; exit 2 ;;
  esac
done

# claude-mem : pas de compte hébergé, pas de télémétrie.
export CLAUDE_MEM_ONLINE_OPTIN=false
export CLAUDE_MEM_TELEMETRY=0
export DO_NOT_TRACK=1

step() { printf '\n\033[1;36m== %s ==\033[0m\n' "$*"; }
info() { printf '  %s\n' "$*"; }
ok()   { printf '  \033[32mOK\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m!!\033[0m %s\n' "$*"; }
die()  { printf '\n  \033[31mÉCHEC\033[0m %s\n' "$*" >&2; exit 1; }

# ask "question" → 0 si oui. Lit le terminal même si stdin est redirigé.
ask() {
  local reply
  printf '  \033[1m?\033[0m %s [o/N] ' "$1"
  read -r reply </dev/tty || reply=""
  [[ "$reply" =~ ^[oOyY]$ ]]
}

# ask_oui "question" → comme ask, mais Entrée vaut oui (étapes sans risque).
ask_oui() {
  local reply
  printf '  \033[1m?\033[0m %s [O/n] ' "$1"
  read -r reply </dev/tty || reply=""
  [[ ! "$reply" =~ ^[nN]$ ]]
}

team_ids() { grep -vE '^[[:space:]]*(#|$)' "$TEAM_FILE"; }

# Table « identifiant<TAB>fichier » de tout le dépôt, calculée comme l'installeur
# (slug du champ name:), ex. discovery-coach → sales/sales-discovery-coach.md.
[[ -f "${AA_DIR}/scripts/lib.sh" ]] \
  || { echo "Lancez ce script depuis un clone d'agency-agents (voir l'en-tête)." >&2; exit 1; }
# shellcheck source=/dev/null
source "${AA_DIR}/scripts/lib.sh"
SLUG_MAP=""
build_slug_map() {
  local div f
  for div in $(sed -n 's/^ *"\([a-z-]*\)": { "label".*/\1/p' "${AA_DIR}/divisions.json"); do
    while IFS= read -r -d '' f; do
      is_agent_file "$f" && printf '%s\t%s\n' "$(agent_slug "$f")" "$f"
    done < <(find "${AA_DIR}/${div}" -name '*.md' -type f -print0)
  done
  return 0
}
source_file() {
  local f
  f="$(awk -F'\t' -v id="$1" '$1 == id { print $2; exit }' <<<"$SLUG_MAP")"
  [[ -n "$f" ]] && echo "$f"
}

# install_kit_file <source> <destination> — copie un fichier du kit sans écraser
# en silence un fichier différent ; note les créations dans l'inventaire.
install_kit_file() {
  local src="$1" dest="$2" name
  name="$(basename "$dest")"
  if [[ -e "$dest" ]]; then
    if cmp -s "$src" "$dest"; then ok "$name (déjà à jour)"; return 0; fi
    if $UPDATE; then
      info "nouvelle version de $name (l'ancienne est dans la sauvegarde)"
    else
      ask "$name existe déjà et diffère. L'écraser (l'ancien est dans la sauvegarde) ?" \
        || { warn "conservé tel quel, la version du kit n'est PAS installée : $name"; return 1; }
    fi
  else
    echo "$dest" >>"$MANIFEST"
  fi
  cp "$src" "$dest"
  ok "$name"
}

# ---------------------------------------------------------------------------
step "Étape 0 — Prérequis"
missing=()
for bin in git node npm claude; do
  if command -v "$bin" >/dev/null 2>&1; then
    info "$bin : $("$bin" --version 2>/dev/null | head -1)"
  else
    missing+=("$bin")
  fi
done
if ((${#missing[@]})); then
  warn "Manquant : ${missing[*]}"
  info "git    → https://git-scm.com/downloads"
  info "node   → https://nodejs.org (version 20 ou plus, npm inclus)"
  info "claude → https://docs.claude.com/fr/docs/claude-code/setup"
  die "installez les outils manquants puis relancez."
fi
node_major="$(node -p 'process.versions.node.split(".")[0]')"
((node_major >= 20)) || die "Node $node_major détecté, il faut Node 20 ou plus."
[[ -x "${AA_DIR}/scripts/install.sh" ]] || die "lancez ce script depuis un clone d'agency-agents (voir l'en-tête)."
ok "prérequis présents (Node $node_major)"

# ---------------------------------------------------------------------------
step "Étape 1 — Sauvegarde"
BACKUP_DIR="${CLAUDE_DIR}/backups/$(date +%Y-%m-%d-%H%M%S)"
info "→ crée $BACKUP_DIR et y copie agents/, commands/, settings.json et plugins/ s'ils existent"
mkdir -p "$BACKUP_DIR"
for item in agents commands settings.json plugins; do
  if [[ -e "${CLAUDE_DIR}/${item}" ]]; then
    cp -R "${CLAUDE_DIR}/${item}" "$BACKUP_DIR/"
    ok "sauvegardé : ~/.claude/${item}"
  else
    info "absent, rien à sauvegarder : ~/.claude/${item}"
  fi
done
# Fichiers créés par ce script (annuler.sh les supprime ; les autres sont restaurés).
MANIFEST="${BACKUP_DIR}/fichiers-ajoutes.txt"
: >"$MANIFEST"
echo "$BACKUP_DIR" >"${CLAUDE_DIR}/backups/LATEST"
# La toute première sauvegarde (avant le kit) sert de référence à annuler.sh,
# même après plusieurs mises à jour.
[[ -s "${CLAUDE_DIR}/backups/AVANT-AGENCE" ]] || echo "$BACKUP_DIR" >"${CLAUDE_DIR}/backups/AVANT-AGENCE"
ok "sauvegarde : $BACKUP_DIR"

# ---------------------------------------------------------------------------
step "Étape 2 — Dépôt agency-agents"
info "dépôt : $AA_DIR ($(git -C "$AA_DIR" log -1 --format='%h du %cs' 2>/dev/null || echo 'hors git'))"
if git -C "$AA_DIR" rev-parse --git-dir >/dev/null 2>&1 && ask_oui "Récupérer la dernière version (git pull) ?"; then
  git -C "$AA_DIR" pull --ff-only || die "git pull a échoué dans $AA_DIR."
fi

info "Contrôle de scripts/install.sh : copie de fichiers .md dans ~/.claude/agents,"
info "aucun téléchargement ni sudo (vérifié sur la version d'octobre 2026)."
if grep -nwE 'sudo|curl|wget' "${AA_DIR}/scripts/install.sh" "${AA_DIR}/scripts/lib.sh" | grep -vE ':[0-9]+:[[:space:]]*#'; then
  warn "install.sh contient désormais sudo/curl/wget (lignes ci-dessus)."
  ask "Ce n'était pas le cas lors de la vérification. Continuer quand même ?" || die "arrêt à votre demande."
fi

SLUG_MAP="$(build_slug_map)"
n_missing=0
for id in $(team_ids); do
  if src="$(source_file "$id")"; then
    ok "$id ← ${src#"$AA_DIR"/}"
  else
    warn "introuvable dans le dépôt : $id"; n_missing=$((n_missing + 1))
  fi
done
((n_missing == 0)) || warn "$n_missing agent(s) introuvable(s) : leur version FR reste installée, mais l'original n'existe plus."

if $WITH_ORIGINALS; then
  "${AA_DIR}/scripts/install.sh" --tool claude-code --agents-file "$TEAM_FILE" --no-interactive --dry-run
  for id in $(team_ids); do
    src="$(source_file "$id")" || continue
    dest="${AGENTS_DIR}/$(basename "$src")"
    [[ -e "$dest" ]] && warn "sera remplacé (copie dans la sauvegarde) : $(basename "$dest")" || echo "$dest" >>"$MANIFEST"
  done
  ask "Installer les versions anglaises d'origine ?" || die "arrêt à votre demande."
  "${AA_DIR}/scripts/install.sh" --tool claude-code --agents-file "$TEAM_FILE" --no-interactive \
    || die "install.sh a échoué (voir ci-dessus)."
  ok "originaux installés"
else
  info "Versions anglaises non installées (option --avec-originaux pour les ajouter)."
fi

# ---------------------------------------------------------------------------
step "Étape 3 — Agents adaptés à la France"
mkdir -p "$AGENTS_DIR"
fr_files=("${KIT_DIR}"/agents/*-fr.md)
[[ -e "${fr_files[0]}" ]] || die "aucun agent dans ${KIT_DIR}/agents."
info "${#fr_files[@]} agents à copier dans ~/.claude/agents/"
ask_oui "Continuer ?" || die "arrêt à votre demande."
n_ok=0
for src in "${fr_files[@]}"; do
  name="$(basename "$src")"
  dest="${AGENTS_DIR}/${name}"
  # Frontmatter : 1re ligne '---', puis name: et description: avant la fermeture.
  fm="$(awk 'NR==1 && $0!="---"{exit 1} NR>1 && $0=="---"{exit} NR>1{print}' "$src")" \
    || { warn "$name : ne commence pas par '---', ignoré."; continue; }
  grep -q "^name: ${name%.md}\$" <<<"$fm" || { warn "$name : champ name invalide, ignoré."; continue; }
  grep -q '^description: ' <<<"$fm" || { warn "$name : description manquante, ignoré."; continue; }
  install_kit_file "$src" "$dest" && n_ok=$((n_ok + 1))
done
ok "$n_ok/${#fr_files[@]} agents FR en place"

# ---------------------------------------------------------------------------
step "Étape 4 — Commandes /slash et fichiers de référence"
mkdir -p "$COMMANDS_DIR" "$REF_DIR"
cmd_files=("${KIT_DIR}"/commandes/*.md)
info "${#cmd_files[@]} commandes à copier dans ~/.claude/commands/ (ex. /agence, /decouverte, /proposition)"
n_cmd=0
for src in "${cmd_files[@]}"; do
  install_kit_file "$src" "${COMMANDS_DIR}/$(basename "$src")" && n_cmd=$((n_cmd + 1))
done
ok "$n_cmd/${#cmd_files[@]} commandes en place"
# Fichiers de référence lus par les agents et les commandes (propres au kit).
cp "${KIT_DIR}/modele-agence/CLAUDE.md" "${REF_DIR}/modele-CLAUDE.md"
ok "modèle de CLAUDE.md d'agence : ~/.claude/agence-ia-fr/modele-CLAUDE.md"
if [[ -f "${KIT_DIR}/faits-dates.md" ]]; then
  cp "${KIT_DIR}/faits-dates.md" "${REF_DIR}/faits-dates.md"
  ok "registre des faits datés : ~/.claude/agence-ia-fr/faits-dates.md"
else
  warn "registre des faits datés absent du kit : les agents s'appuieront sur les sources officielles."
fi
# Le registre est hors du dossier de travail : sans règle explicite, Claude Code
# demande l'autorisation de le lire à chaque consultation par un agent.
READ_RULE='Read(~/.claude/agence-ia-fr/**)'
if grep -qF "$READ_RULE" "${CLAUDE_DIR}/settings.json" 2>/dev/null; then
  ok "lecture du registre déjà autorisée"
elif ask_oui "Autoriser les agents à lire ~/.claude/agence-ia-fr (registre, modèle, en lecture seule) sans vous le demander à chaque fois ?"; then
  if node -e '
    const fs = require("fs"), p = process.argv[1], rule = process.argv[2];
    let s = {};
    if (fs.existsSync(p)) {
      try { s = JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { process.exit(2); }
    }
    s.permissions = s.permissions || {};
    s.permissions.allow = s.permissions.allow || [];
    if (!s.permissions.allow.includes(rule)) s.permissions.allow.push(rule);
    fs.writeFileSync(p, JSON.stringify(s, null, 2) + "\n");
  ' "${CLAUDE_DIR}/settings.json" "$READ_RULE"; then
    ok "règle ajoutée à ~/.claude/settings.json : $READ_RULE"
  else
    warn "settings.json n'est pas un JSON valide : règle non ajoutée (Claude demandera l'autorisation)."
  fi
else
  info "règle non ajoutée : Claude demandera l'autorisation quand un agent lira le registre."
fi

# ---------------------------------------------------------------------------
step "Étape 5 — claude-mem (mémoire locale)"
if ! $WITH_MEM; then
  info "ignoré (--sans-mem)"
else
  info "Mode --provider claude : souvenirs stockés dans ~/.claude-mem, aucun compte cmem.ai,"
  info "synchronisation cloud désactivée, télémétrie désactivée. Le jeton « CMEM » est sans rapport : ignoré."
  for dep in bun uv; do
    if ! command -v "$dep" >/dev/null 2>&1 && [[ ! -x "${HOME}/.bun/bin/$dep" && ! -x "${HOME}/.local/bin/$dep" ]]; then
      warn "$dep absent : l'installeur claude-mem le téléchargera lui-même (curl | bash),"
      warn "dans ~/.bun ou ~/.local/bin, donc hors de ~/.claude."
      info "Alternative : macOS → brew install oven-sh/bun/bun uv ; sinon https://bun.sh et https://docs.astral.sh/uv"
      ask "Autoriser claude-mem à installer $dep ?" || die "installez $dep puis relancez avec --sans-mem si besoin."
    fi
  done
  if [[ -f "${HOME}/.claude-mem/settings.json" ]]; then
    question="claude-mem est déjà installé. Le mettre à jour (mode local) ?"
  else
    question="Installer claude-mem en mode local (npx claude-mem install --provider claude) ?"
  fi
  if ask "$question"; then
    if npx -y claude-mem@latest install --provider claude; then
      npx -y claude-mem@latest telemetry disable || warn "à refaire à la main : npx claude-mem telemetry disable"
      # Pas de publicité pour l'offre payante dans Claude Code : bandeau de démarrage et
      # message de bienvenue masqués (la mémoire reste transmise à Claude).
      if node -e '
        const fs = require("fs"), f = process.argv[1];
        const s = JSON.parse(fs.readFileSync(f, "utf8"));
        s.CLAUDE_MEM_CONTEXT_SHOW_TERMINAL_OUTPUT = "false";
        s.CLAUDE_MEM_WELCOME_HINT_ENABLED = "false";
        fs.writeFileSync(f, JSON.stringify(s, null, 2) + "\n");
      ' "${HOME}/.claude-mem/settings.json" 2>/dev/null; then
        ok "publicités claude-mem masquées"
      else
        warn "impossible de masquer les publicités de claude-mem (~/.claude-mem/settings.json)"
      fi
      npx -y claude-mem@latest restart >/dev/null 2>&1 || npx -y claude-mem@latest start || warn "le worker n'a pas démarré : npx claude-mem start"
      if grep -q '"CLAUDE_MEM_CLOUD_SYNC_TOKEN": ""' "${HOME}/.claude-mem/settings.json" 2>/dev/null; then
        ok "données locales (~/.claude-mem), aucune synchronisation cloud"
      else
        warn "vérifiez CLAUDE_MEM_PROVIDER et CLAUDE_MEM_CLOUD_SYNC_* dans ~/.claude-mem/settings.json"
      fi
      MEM_PORT="$(node -e 'try { const s = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")); if (s.CLAUDE_MEM_WORKER_PORT) { console.log(s.CLAUDE_MEM_WORKER_PORT); process.exit(0); } } catch (e) {} console.log(37700 + (process.getuid ? process.getuid() : 77) % 100);' "${HOME}/.claude-mem/settings.json")"
      info "Visionneuse locale : http://127.0.0.1:${MEM_PORT}"
      info "En mode local, claude-mem utilise votre quota Claude pour résumer vos sessions."
    else
      warn "installation de claude-mem échouée : le reste du kit fonctionne sans (réessayez : npx claude-mem install --provider claude)."
    fi
  else
    info "claude-mem non installé : Claude Code garde sa mémoire native."
  fi
fi

# ---------------------------------------------------------------------------
step "Étape 6 — Application Agence IA"
info "Une fenêtre à part pour discuter avec chaque agent (réponses au fil de l'eau, historique,"
info "export) et consulter le tableau de bord. Elle passe par Claude Code et votre abonnement,"
info "comme dans le terminal ; les discussions restent sur cet ordinateur (~/.claude/agence-ia-fr)."
# Chemins absolus de node et claude : lancée depuis le Dock, l'application n'a pas le PATH du terminal.
mkdir -p "$REF_DIR"
printf 'NODE_BIN=%s\nCLAUDE_BIN=%s\nAGENCE_DIR=%s\n' "$(command -v node)" "$(command -v claude)" "${HOME}/Agence" >"${REF_DIR}/app.conf"
ok "réglages de l'application : ~/.claude/agence-ia-fr/app.conf"
navigateur=""
case "$(uname -s)" in
  Darwin)
    for b in "Google Chrome" "Microsoft Edge" "Brave Browser" "Chromium" "Vivaldi"; do
      [[ -d "/Applications/${b}.app" || -d "${HOME}/Applications/${b}.app" ]] && { navigateur="$b"; break; }
    done
    APP_BUNDLE="${HOME}/Applications/Agence IA.app"
    if [[ -f "${REF_DIR}/app-bundle-par-le-kit" && -d "$APP_BUNDLE" ]]; then
      creer_bundle=true  # créée par le kit lors d'une installation précédente : mise à jour
    elif [[ -e "$APP_BUNDLE" ]]; then
      creer_bundle=false
      ask "« ${APP_BUNDLE} » existe déjà et n'a pas été créée par le kit. La remplacer ?" && creer_bundle=true
    else
      creer_bundle=false
      ask_oui "Ajouter l'icône « Agence IA » dans ~/Applications (Launchpad, Dock, Spotlight) ?" && creer_bundle=true
    fi
    if $creer_bundle; then
      tmp="${REF_DIR}/Agence IA.app"
      rm -rf "$tmp" "${REF_DIR}/icone.iconset"
      mkdir -p "${tmp}/Contents/MacOS" "${tmp}/Contents/Resources" "${REF_DIR}/icone.iconset"
      cat >"${tmp}/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Agence IA</string>
  <key>CFBundleDisplayName</key><string>Agence IA</string>
  <key>CFBundleIdentifier</key><string>fr.agence-ia.kit</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleExecutable</key><string>agence-ia</string>
  <key>CFBundleIconFile</key><string>icone</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundleVersion</key><string>1</string>
  <key>LSMinimumSystemVersion</key><string>11.0</string>
</dict>
</plist>
PLIST
      printf '#!/bin/bash\nexec /bin/bash %q\n' "${KIT_DIR}/app.sh" >"${tmp}/Contents/MacOS/agence-ia"
      chmod +x "${tmp}/Contents/MacOS/agence-ia"
      icone_ok=true
      for t in 16 32 128 256 512; do
        sips -z "$t" "$t" "${KIT_DIR}/app/icone.png" --out "${REF_DIR}/icone.iconset/icon_${t}x${t}.png" >/dev/null 2>&1 || icone_ok=false
        sips -z $((t * 2)) $((t * 2)) "${KIT_DIR}/app/icone.png" --out "${REF_DIR}/icone.iconset/icon_${t}x${t}@2x.png" >/dev/null 2>&1 || icone_ok=false
      done
      { $icone_ok && iconutil -c icns "${REF_DIR}/icone.iconset" -o "${tmp}/Contents/Resources/icone.icns"; } \
        || warn "icône non générée (sips/iconutil) : l'application aura l'icône par défaut."
      rm -rf "${REF_DIR}/icone.iconset"
      mkdir -p "${HOME}/Applications"
      rm -rf "$APP_BUNDLE"
      mv "$tmp" "$APP_BUNDLE"
      touch "${REF_DIR}/app-bundle-par-le-kit"
      /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$APP_BUNDLE" >/dev/null 2>&1 || true
      ok "« Agence IA » ajoutée : ${APP_BUNDLE} (Launchpad, Spotlight ; glissez-la dans le Dock)"
    else
      info "icône non ajoutée. L'application s'ouvre aussi avec : bash ${KIT_DIR}/app.sh"
    fi
    ;;
  Linux)
    for b in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge brave-browser; do
      command -v "$b" >/dev/null 2>&1 && { navigateur="$b"; break; }
    done
    DESKTOP_FILE="${HOME}/.local/share/applications/agence-ia.desktop"
    if [[ -f "${REF_DIR}/app-menu-par-le-kit" ]] || ask_oui "Ajouter « Agence IA » au menu des applications (${DESKTOP_FILE}) ?"; then
      mkdir -p "$(dirname "$DESKTOP_FILE")"
      printf '[Desktop Entry]\nType=Application\nName=Agence IA\nComment=Discussion avec les agents et tableau de bord du kit agence-ia-fr\nExec=bash "%s"\nIcon=%s\nTerminal=false\nCategories=Office;\n' \
        "${KIT_DIR}/app.sh" "${KIT_DIR}/app/icone.png" >"$DESKTOP_FILE"
      touch "${REF_DIR}/app-menu-par-le-kit"
      ok "« Agence IA » ajoutée au menu des applications"
    else
      info "non ajoutée au menu. L'application s'ouvre aussi avec : bash ${KIT_DIR}/app.sh"
    fi
    ;;
esac
if [[ -n "$navigateur" ]]; then
  ok "fenêtre d'application ouverte avec ${navigateur} (sans barre d'adresse)"
else
  info "Chrome, Edge ou Brave non trouvé : l'application s'ouvrira dans un onglet du navigateur par défaut."
fi

# ---------------------------------------------------------------------------
step "Étape 7 — Application Agency Agents (optionnel)"
info "Application de bureau du projet d'origine : parcourt le catalogue anglais (232 agents)"
info "et l'installe en un clic. Elle ne connaît pas les agents -fr : n'installez pas tout le catalogue,"
info "sinon Claude risque de choisir des versions anglaises."
if [[ "$(uname -s)" == "Darwin" ]] && command -v brew >/dev/null 2>&1; then
  if brew list --cask agency-agents >/dev/null 2>&1; then
    ok "application déjà installée"
  elif ask "Installer l'application Agency Agents (brew install --cask msitarzewski/agency-agents/agency-agents) ?"; then
    if brew install --cask msitarzewski/agency-agents/agency-agents; then
      mkdir -p "$REF_DIR" && touch "${REF_DIR}/app-installee-par-le-kit"
      ok "application installée (dans vos Applications)"
    else
      warn "installation de l'application échouée : téléchargez-la sur https://agencyagents.app"
    fi
  else
    info "non installée. Plus tard : brew install --cask msitarzewski/agency-agents/agency-agents"
  fi
else
  info "Téléchargement : https://github.com/msitarzewski/agency-agents-app/releases/latest (https://agencyagents.app)"
fi

# ---------------------------------------------------------------------------
step "Étape 8 — Premiers pas"
info "1. Ouvrez l'application Agence IA, puis « Créer la fiche » : le bras droit vous pose une"
info "   dizaine de questions sur vos offres et vos tarifs et écrit ~/Agence/CLAUDE.md."
info "   (Dans le terminal : mkdir ~/Agence && cd ~/Agence && claude, puis /configurer-agence.)"
info "2. Discutez avec un agent, ou avec le bras droit si vous ne savez pas lequel choisir."
info "3. Dans le terminal, /agents liste les agents -fr et /agence oriente votre demande."
info "4. Application : bash ${KIT_DIR}/app.sh   ·   Tableau de bord seul : bash ${KIT_DIR}/tableau-de-bord.sh"
echo
ok "Terminé. Sauvegarde : $BACKUP_DIR"
info "Annuler       : bash ${KIT_DIR}/annuler.sh"
info "Mettre à jour : bash ${KIT_DIR}/mettre-a-jour.sh"
if ! $UPDATE && ask_oui "Ouvrir l'application Agence IA maintenant ?"; then
  bash "${KIT_DIR}/app.sh" || warn "l'application ne s'est pas ouverte (voir ci-dessus)."
fi
