#!/usr/bin/env bash
#
# annuler.sh — défait setup-agence.sh.
#   1. désinstalle claude-mem (vos souvenirs dans ~/.claude-mem sont conservés)
#   2. supprime les agents que setup-agence.sh a créés
#   3. restaure agents/, settings.json (et, si vous le voulez, plugins/) depuis la sauvegarde
#
# Usage : bash annuler.sh [dossier-de-sauvegarde]
#         (par défaut : la dernière, indiquée dans ~/.claude/backups/LATEST)

set -euo pipefail

CLAUDE_DIR="${HOME}/.claude"
AGENTS_DIR="${CLAUDE_DIR}/agents"
export DO_NOT_TRACK=1

ask() {
  local reply
  printf '  ? %s [o/N] ' "$1"
  read -r reply </dev/tty || reply=""
  [[ "$reply" =~ ^[oOyY]$ ]]
}

BACKUP_DIR="${1:-$(cat "${CLAUDE_DIR}/backups/LATEST" 2>/dev/null || true)}"
[[ -n "$BACKUP_DIR" && -d "$BACKUP_DIR" ]] \
  || { echo "Sauvegarde introuvable. Usage : bash annuler.sh ~/.claude/backups/AAAA-MM-JJ-HHMMSS" >&2; exit 1; }
echo "Sauvegarde utilisée : $BACKUP_DIR"

# 1. claude-mem
if command -v npx >/dev/null 2>&1 && ask "Désinstaller claude-mem ?"; then
  npx -y claude-mem@latest stop || true
  npx -y claude-mem@latest uninstall || echo "  désinstallation partielle : voir le message ci-dessus"
  echo "  Souvenirs conservés dans ~/.claude-mem. Pour les effacer : rm -rf ~/.claude-mem"
fi

# 2. agents créés par le kit
MANIFEST="${BACKUP_DIR}/fichiers-ajoutes.txt"
if [[ -s "$MANIFEST" ]]; then
  echo "Agents créés par le kit :"
  sed 's|^|    |' "$MANIFEST"
  if ask "Les supprimer ?"; then
    while IFS= read -r f; do
      # Uniquement des fichiers .md directement dans ~/.claude/agents.
      [[ "$f" == "${AGENTS_DIR}/"*.md && "$f" != */../* ]] && rm -f -- "$f"
    done <"$MANIFEST"
    echo "  supprimés"
  fi
fi

# 3. restauration des fichiers remplacés
if [[ -d "${BACKUP_DIR}/agents" ]] && ask "Restaurer les agents tels qu'ils étaient avant (copie depuis la sauvegarde) ?"; then
  mkdir -p "$AGENTS_DIR"
  cp -R "${BACKUP_DIR}/agents/." "$AGENTS_DIR/"
  echo "  agents restaurés"
fi
if [[ -f "${BACKUP_DIR}/settings.json" ]] && ask "Restaurer ~/.claude/settings.json ?"; then
  [[ -f "${CLAUDE_DIR}/settings.json" ]] && cp "${CLAUDE_DIR}/settings.json" "${CLAUDE_DIR}/settings.json.avant-annulation"
  cp "${BACKUP_DIR}/settings.json" "${CLAUDE_DIR}/settings.json"
  echo "  settings.json restauré (version remplacée : settings.json.avant-annulation)"
fi
if [[ -d "${BACKUP_DIR}/plugins" ]] && ask "Remplacer ~/.claude/plugins par la sauvegarde ? (inutile si claude-mem s'est bien désinstallé)"; then
  [[ -d "${CLAUDE_DIR}/plugins" ]] && mv "${CLAUDE_DIR}/plugins" "${CLAUDE_DIR}/plugins.avant-annulation-$(date +%s)"
  cp -R "${BACKUP_DIR}/plugins" "${CLAUDE_DIR}/plugins"
  echo "  plugins restaurés (ancienne version renommée plugins.avant-annulation-*)"
fi

echo "Terminé. Le dépôt ~/tools/agency-agents est conservé (rm -rf ~/tools/agency-agents pour le supprimer)."
