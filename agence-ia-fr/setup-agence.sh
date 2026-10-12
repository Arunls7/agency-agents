#!/usr/bin/env bash
#
# setup-agence.sh — configure Claude Code pour une agence IA (cible : TPE-PME françaises).
#
#   0 prérequis · 1 sauvegarde · 2 dépôt agency-agents · 3 agents FR ·
#   4 claude-mem (mémoire locale) · 5 vérifications
#
# Ne touche qu'à ~/.claude, ~/.claude-mem et ~/tools. Pas de sudo.
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

set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AA_DIR="$(cd "${KIT_DIR}/.." && pwd)"
TEAM_FILE="${KIT_DIR}/agency-team.txt"
CLAUDE_DIR="${HOME}/.claude"
AGENTS_DIR="${CLAUDE_DIR}/agents"

WITH_ORIGINALS=false
WITH_MEM=true
for arg in "$@"; do
  case "$arg" in
    --avec-originaux) WITH_ORIGINALS=true ;;
    --sans-mem) WITH_MEM=false ;;
    -h|--help) sed -n '2,19p' "$0"; exit 0 ;;
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
info "→ crée $BACKUP_DIR et y copie agents/, settings.json et plugins/ s'ils existent"
mkdir -p "$BACKUP_DIR"
for item in agents settings.json plugins; do
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
ok "sauvegarde : $BACKUP_DIR"

# ---------------------------------------------------------------------------
step "Étape 2 — Dépôt agency-agents"
info "dépôt : $AA_DIR ($(git -C "$AA_DIR" log -1 --format='%h du %cs' 2>/dev/null || echo 'hors git'))"
if git -C "$AA_DIR" rev-parse --git-dir >/dev/null 2>&1 && ask "Récupérer la dernière version (git pull) ?"; then
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
ask "Continuer ?" || die "arrêt à votre demande."
n_ok=0
for src in "${fr_files[@]}"; do
  name="$(basename "$src")"
  dest="${AGENTS_DIR}/${name}"
  # Frontmatter : 1re ligne '---', puis name: et description: avant la fermeture.
  fm="$(awk 'NR==1 && $0!="---"{exit 1} NR>1 && $0=="---"{exit} NR>1{print}' "$src")" \
    || { warn "$name : ne commence pas par '---', ignoré."; continue; }
  grep -q "^name: ${name%.md}\$" <<<"$fm" || { warn "$name : champ name invalide, ignoré."; continue; }
  grep -q '^description: ' <<<"$fm" || { warn "$name : description manquante, ignoré."; continue; }
  if [[ -e "$dest" ]]; then
    if cmp -s "$src" "$dest"; then ok "$name (déjà à jour)"; n_ok=$((n_ok + 1)); continue; fi
    ask "$name existe déjà et diffère. L'écraser (l'ancien est dans la sauvegarde) ?" \
      || { info "conservé : $name"; continue; }
  else
    echo "$dest" >>"$MANIFEST"
  fi
  cp "$src" "$dest"
  ok "$name"
  n_ok=$((n_ok + 1))
done
ok "$n_ok/${#fr_files[@]} agents FR en place"

# ---------------------------------------------------------------------------
step "Étape 4 — claude-mem (mémoire locale)"
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
  ask "Installer claude-mem en mode local (npx claude-mem install --provider claude) ?" || die "arrêt à votre demande."
  npx -y claude-mem@latest install --provider claude || die "installation de claude-mem échouée."
  npx -y claude-mem@latest telemetry disable || warn "à refaire à la main : npx claude-mem telemetry disable"
  npx -y claude-mem@latest start || warn "le worker n'a pas démarré : npx claude-mem start"
  npx -y claude-mem@latest status || true
  if grep -q '"CLAUDE_MEM_CLOUD_SYNC_TOKEN": ""' "${HOME}/.claude-mem/settings.json" 2>/dev/null; then
    ok "données locales (~/.claude-mem), aucune synchronisation cloud"
  else
    warn "vérifiez CLAUDE_MEM_PROVIDER et CLAUDE_MEM_CLOUD_SYNC_* dans ~/.claude-mem/settings.json"
  fi
  info "Visionneuse locale : http://127.0.0.1:37700"
fi

# ---------------------------------------------------------------------------
step "Étape 5 — À vérifier dans Claude Code"
info "1. Ouvrez Claude Code et tapez /agents : les agents en -fr doivent apparaître."
info "2. Test : « Utilise sales-discovery-coach-fr : propose 5 questions d'ouverture"
info "   pour un entretien avec un dirigeant de cabinet comptable. »"
info "   Attendu : réponse en français, vouvoiement, contexte cabinet comptable."
$WITH_MEM && info "3. npx claude-mem status  (ou http://127.0.0.1:37700)"
echo
ok "Terminé. Sauvegarde : $BACKUP_DIR"
info "Annuler       : bash ${KIT_DIR}/annuler.sh"
info "Mettre à jour : bash ${KIT_DIR}/mettre-a-jour.sh"
