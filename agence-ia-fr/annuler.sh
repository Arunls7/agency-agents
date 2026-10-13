#!/usr/bin/env bash
#
# annuler.sh — défait setup-agence.sh.
#   1. désinstalle claude-mem (vos souvenirs dans ~/.claude-mem sont conservés)
#   2. supprime ce que le kit a installé : agents (-fr et originaux éventuels),
#      commandes /slash et ~/.claude/agence-ia-fr (registre, modèle de CLAUDE.md)
#   3. restaure agents/, commands/, settings.json (et, si vous le voulez, plugins/) depuis la sauvegarde
#   Votre CLAUDE.md d'agence (créé par /configurer-agence) n'est jamais touché.
#
# Usage : bash annuler.sh [dossier-de-sauvegarde]
#         (par défaut : la sauvegarde faite avant la toute première installation du kit,
#          même si des mises à jour ont eu lieu depuis)

set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${HOME}/.claude"
AGENTS_DIR="${CLAUDE_DIR}/agents"
COMMANDS_DIR="${CLAUDE_DIR}/commands"
REF_DIR="${CLAUDE_DIR}/agence-ia-fr"
export DO_NOT_TRACK=1

ask() {
  local reply
  printf '  ? %s [o/N] ' "$1"
  read -r reply </dev/tty || reply=""
  [[ "$reply" =~ ^[oOyY]$ ]]
}

BACKUP_DIR="${1:-$(cat "${CLAUDE_DIR}/backups/AVANT-AGENCE" 2>/dev/null || cat "${CLAUDE_DIR}/backups/LATEST" 2>/dev/null || true)}"
[[ -n "$BACKUP_DIR" && -d "$BACKUP_DIR" ]] \
  || { echo "Sauvegarde introuvable. Usage : bash annuler.sh ~/.claude/backups/AAAA-MM-JJ-HHMMSS" >&2; exit 1; }
echo "Sauvegarde utilisée : $BACKUP_DIR"

# 1. claude-mem
if command -v npx >/dev/null 2>&1 && ask "Désinstaller claude-mem ?"; then
  npx -y claude-mem@latest stop || true
  npx -y claude-mem@latest uninstall || echo "  désinstallation partielle : voir le message ci-dessus"
  echo "  Souvenirs conservés dans ~/.claude-mem. Pour les effacer : rm -rf ~/.claude-mem"
fi

# 2. fichiers installés par le kit : agents -fr et commandes (par leur nom dans le kit),
#    plus tout ce que notent les inventaires des installations successives.
to_remove=()
for f in "${KIT_DIR}"/agents/*-fr.md; do
  [[ -e "${AGENTS_DIR}/$(basename "$f")" ]] && to_remove+=("${AGENTS_DIR}/$(basename "$f")")
done
for f in "${KIT_DIR}"/commandes/*.md; do
  [[ -e "${COMMANDS_DIR}/$(basename "$f")" ]] && to_remove+=("${COMMANDS_DIR}/$(basename "$f")")
done
while IFS= read -r f; do
  # Uniquement des fichiers .md directement dans ~/.claude/agents ou ~/.claude/commands.
  [[ ( "$f" == "${AGENTS_DIR}/"*.md || "$f" == "${COMMANDS_DIR}/"*.md ) && "$f" != */../* && -e "$f" ]] && to_remove+=("$f")
done < <(cat "${CLAUDE_DIR}"/backups/*/fichiers-ajoutes.txt 2>/dev/null | sort -u)
if ((${#to_remove[@]})); then
  echo "Fichiers installés par le kit ($(printf '%s\n' "${to_remove[@]}" | sort -u | wc -l | tr -d ' ')) :"
  printf '%s\n' "${to_remove[@]}" | sed "s|^${CLAUDE_DIR}/|    ~/.claude/|" | sort -u
  if ask "Les supprimer ?"; then
    rm -f -- "${to_remove[@]}"
    echo "  supprimés"
  fi
fi
if [[ -f "${REF_DIR}/app-installee-par-le-kit" ]] && command -v brew >/dev/null 2>&1 \
  && ask "Désinstaller l'application Agency Agents (installée par le kit) ?"; then
  brew uninstall --cask agency-agents && echo "  application désinstallée" || echo "  désinstallation échouée : voir ci-dessus"
fi
if [[ -d "$REF_DIR" ]] && ask "Supprimer ~/.claude/agence-ia-fr (registre, modèle, tableau de bord, propres au kit) ?"; then
  rm -rf -- "$REF_DIR"
  echo "  supprimé"
fi

# Règle de lecture du registre ajoutée par le kit dans settings.json.
if [[ -f "${CLAUDE_DIR}/settings.json" ]] && grep -qF 'Read(~/.claude/agence-ia-fr/**)' "${CLAUDE_DIR}/settings.json"; then
  node -e '
    const fs = require("fs"), p = process.argv[1], rule = "Read(~/.claude/agence-ia-fr/**)";
    const s = JSON.parse(fs.readFileSync(p, "utf8"));
    if (s.permissions && Array.isArray(s.permissions.allow)) {
      s.permissions.allow = s.permissions.allow.filter(r => r !== rule);
    }
    fs.writeFileSync(p, JSON.stringify(s, null, 2) + "\n");
  ' "${CLAUDE_DIR}/settings.json" && echo "  règle de lecture du registre retirée de settings.json" \
    || echo "  impossible de retirer la règle de settings.json (à faire à la main)"
fi

# 3. restauration des fichiers remplacés
if [[ -d "${BACKUP_DIR}/agents" ]] && ask "Restaurer les agents tels qu'ils étaient avant (copie depuis la sauvegarde) ?"; then
  mkdir -p "$AGENTS_DIR"
  cp -R "${BACKUP_DIR}/agents/." "$AGENTS_DIR/"
  echo "  agents restaurés"
fi
if [[ -d "${BACKUP_DIR}/commands" ]] && ask "Restaurer vos commandes /slash d'avant (copie depuis la sauvegarde) ?"; then
  mkdir -p "$COMMANDS_DIR"
  cp -R "${BACKUP_DIR}/commands/." "$COMMANDS_DIR/"
  echo "  commandes restaurées"
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

# La prochaine installation repartira d'une nouvelle sauvegarde de référence.
[[ "$BACKUP_DIR" == "$(cat "${CLAUDE_DIR}/backups/AVANT-AGENCE" 2>/dev/null)" ]] && rm -f "${CLAUDE_DIR}/backups/AVANT-AGENCE"

echo "Terminé. Le dépôt ~/tools/agency-agents est conservé (rm -rf ~/tools/agency-agents pour le supprimer)."
