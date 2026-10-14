#!/usr/bin/env bash
#
# tableau-de-bord.sh — génère et ouvre le tableau de bord local du kit :
# agents et commandes (à jour, modifiés, manquants), registre des faits datés,
# claude-mem, CLAUDE.md de l'agence. Page autonome, aucune donnée envoyée.
#
# Usage : bash tableau-de-bord.sh [dossier-de-l-agence] [--sans-ouvrir]
#         (dossier de l'agence par défaut : ~/Agence)

set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENCE_DIR="${HOME}/Agence"
OUVRIR=true
for arg in "$@"; do
  case "$arg" in
    --sans-ouvrir) OUVRIR=false ;;
    -h|--help) sed -n '2,9p' "$0"; exit 0 ;;
    *) AGENCE_DIR="$arg" ;;
  esac
done

command -v node >/dev/null 2>&1 || { echo "Node.js est requis (https://nodejs.org)." >&2; exit 1; }
page="$(node "${KIT_DIR}/outils/tableau-de-bord.mjs" "$KIT_DIR" "$AGENCE_DIR")"
echo "Tableau de bord : $page"

if $OUVRIR; then
  if command -v open >/dev/null 2>&1; then
    open "$page"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$page" >/dev/null 2>&1 &
  else
    echo "Ouvrez ce fichier dans votre navigateur."
  fi
fi
