#!/usr/bin/env bash
#
# mettre-a-jour.sh — récupère la dernière version du fork (agents FR compris)
# et de claude-mem, puis relance l'installation.
#
# Pour recevoir les nouveautés de l'original (msitarzewski/agency-agents),
# cliquez d'abord sur « Sync fork » sur la page GitHub de votre fork.

set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AA_DIR="$(cd "${KIT_DIR}/.." && pwd)"

before="$(git -C "$AA_DIR" rev-parse --short HEAD)"
git -C "$AA_DIR" pull --ff-only
after="$(git -C "$AA_DIR" rev-parse --short HEAD)"
echo "agency-agents : $before → $after"

if [[ "$before" != "$after" ]]; then
  # Originaux modifiés en amont : leur version -fr (même nom de fichier + -fr) est peut-être à revoir.
  changed=()
  while IFS= read -r f; do
    [[ -e "${KIT_DIR}/agents/$(basename "$f" .md)-fr.md" ]] && changed+=("$f")
  done < <(git -C "$AA_DIR" diff --name-only "$before" "$after" -- '*.md' | grep -v '^agence-ia-fr/')
  if ((${#changed[@]})); then
    echo "Originaux modifiés (à reporter dans leur version -fr si utile) :"
    printf '    %s\n' "${changed[@]}"
  fi
fi

# Réinstalle avec une nouvelle sauvegarde ; les agents -fr du kit sont remplacés par leur nouvelle version.
bash "${KIT_DIR}/setup-agence.sh" --maj "$@"
