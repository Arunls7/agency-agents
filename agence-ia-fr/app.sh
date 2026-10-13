#!/usr/bin/env bash
# shellcheck disable=SC2016  # scripts node entre apostrophes : leurs ${…} sont du JavaScript
#
# app.sh — ouvre l'application « Agence IA » : tableau de bord du kit et discussion
# avec les agents -fr, dans sa propre fenêtre (Chrome, Edge, Brave ou Chromium en
# mode application ; à défaut, un onglet du navigateur par défaut).
# Un petit serveur local (127.0.0.1) relaie les messages à Claude Code ; il s'arrête
# seul quelques minutes après la fermeture de la fenêtre.
#
# Usage : bash app.sh [--navigateur] [--sans-ouvrir] [--arreter]
#   --navigateur   ouvrir dans un onglet du navigateur par défaut
#   --sans-ouvrir  démarrer le serveur et afficher l'adresse seulement
#   --arreter      arrêter le serveur
#
# Réglages facultatifs dans ~/.claude/agence-ia-fr/app.conf (écrit par setup-agence.sh) :
#   NODE_BIN=/chemin/vers/node   CLAUDE_BIN=/chemin/vers/claude   AGENCE_DIR=/chemin/de/l/agence

set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REF_DIR="${HOME}/.claude/agence-ia-fr"
ETAT="${REF_DIR}/app.json"
JOURNAL="${REF_DIR}/app.log"
# Lancée depuis le Finder ou le Dock, l'application n'hérite pas du PATH du terminal.
export PATH="${HOME}/.local/bin:/opt/homebrew/bin:/usr/local/bin:${PATH}"

MODE=fenetre
for arg in "$@"; do
  case "$arg" in
    --navigateur) MODE=onglet ;;
    --sans-ouvrir) MODE=aucun ;;
    --arreter) MODE=arreter ;;
    -h|--help) sed -n '4,16p' "$0"; exit 0 ;;
    *) echo "Option inconnue : $arg" >&2; exit 2 ;;
  esac
done

NODE_BIN="" CLAUDE_BIN="" AGENCE_DIR=""
if [[ -f "${REF_DIR}/app.conf" ]]; then
  while IFS='=' read -r cle valeur; do
    case "$cle" in
      NODE_BIN) NODE_BIN="$valeur" ;;
      CLAUDE_BIN) CLAUDE_BIN="$valeur" ;;
      AGENCE_DIR) AGENCE_DIR="$valeur" ;;
    esac
  done < "${REF_DIR}/app.conf"
fi
[[ -x "$NODE_BIN" ]] || NODE_BIN="$(command -v node || true)"
[[ -x "$CLAUDE_BIN" ]] || CLAUDE_BIN="$(command -v claude || true)"
AGENCE_DIR="${AGENCE_DIR:-${HOME}/Agence}"

alerte() {
  echo "$1" >&2
  if [[ "$(uname -s)" == "Darwin" && ! -t 1 ]]; then
    osascript -e "display alert \"Agence IA\" message \"$1\" as critical" >/dev/null 2>&1 || true
  fi
  exit 1
}
[[ -n "$NODE_BIN" ]] || alerte "Node.js est introuvable. Installez-le (https://nodejs.org), puis relancez setup-agence.sh."

# Lit app.json : « port jeton » du serveur en cours, s'il y en a un.
lire_etat() {
  [[ -f "$ETAT" ]] || return 1
  "$NODE_BIN" -e 'const e = require(process.argv[1]); console.log(`${e.port} ${e.jeton}`);' "$ETAT" 2>/dev/null
}
repond() {
  local port="$1" jeton="$2"
  "$NODE_BIN" -e '
    fetch(`http://127.0.0.1:${process.argv[1]}/api/etat`, { headers: { "X-Agence-Jeton": process.argv[2] }, signal: AbortSignal.timeout(2000) })
      .then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1));' "$port" "$jeton"
}

port="" jeton=""
if etat="$(lire_etat)"; then
  read -r port jeton <<<"$etat"
  repond "$port" "$jeton" || port=""
fi

if [[ "$MODE" == arreter ]]; then
  if [[ -n "$port" ]]; then
    "$NODE_BIN" -e '
      fetch(`http://127.0.0.1:${process.argv[1]}/api/quitter`, { method: "POST", headers: { "X-Agence-Jeton": process.argv[2] } })
        .then(() => {}, () => {});' "$port" "$jeton"
    echo "Application arrêtée."
  else
    echo "L'application n'était pas lancée."
  fi
  exit 0
fi

if [[ -z "$port" ]]; then
  mkdir -p "$REF_DIR"
  [[ -f "$JOURNAL" && $(wc -c <"$JOURNAL") -gt 1000000 ]] && mv -f "$JOURNAL" "${JOURNAL}.1"
  rm -f "$ETAT"
  args=(--kit "$KIT_DIR" --agence "$AGENCE_DIR")
  [[ -n "$CLAUDE_BIN" ]] && args+=(--claude "$CLAUDE_BIN")
  # Serveur détaché (nouvelle session) : il survit à la fermeture du terminal qui l'a lancé.
  "$NODE_BIN" -e '
    const fs = require("fs"), journal = fs.openSync(process.argv[1], "a");
    require("child_process").spawn(process.execPath, process.argv.slice(2), { detached: true, stdio: ["ignore", journal, journal] }).unref();
  ' "$JOURNAL" "${KIT_DIR}/app/serveur.mjs" "${args[@]}"
  for _ in $(seq 1 50); do
    sleep 0.2
    if etat="$(lire_etat)"; then
      read -r port jeton <<<"$etat"
      repond "$port" "$jeton" && break
      port=""
    fi
  done
  [[ -n "$port" ]] || alerte "Le serveur de l'application n'a pas démarré. Détails : ${JOURNAL}"
fi

# Le jeton n'est transmis qu'à l'ouverture : le serveur le garde ensuite dans un cookie.
url="http://127.0.0.1:${port}/?jeton=${jeton}"
echo "Agence IA : http://127.0.0.1:${port}/"
[[ "$MODE" == aucun ]] && echo "Adresse d'ouverture (personnelle, ne la partagez pas) : ${url}"

ouvrir_fenetre() {
  local b
  case "$(uname -s)" in
    Darwin)
      # Chrome, Edge, Brave, Chromium, Vivaldi (identifiants d'application) : le premier installé.
      for b in com.google.Chrome com.microsoft.edgemac com.brave.Browser org.chromium.Chromium com.vivaldi.Vivaldi; do
        open -nb "$b" --args --app="$url" --window-size=1280,860 2>/dev/null && return 0
      done
      ;;
    Linux)
      for b in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge brave-browser; do
        if command -v "$b" >/dev/null 2>&1; then
          nohup "$b" --app="$url" --window-size=1280,860 >/dev/null 2>&1 &
          return 0
        fi
      done
      ;;
  esac
  return 1
}
ouvrir_onglet() {
  if command -v open >/dev/null 2>&1; then open "$url"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$url" >/dev/null 2>&1 &
  else echo "Ouvrez cette adresse dans votre navigateur."
  fi
}

case "$MODE" in
  fenetre) ouvrir_fenetre || { echo "Chrome, Edge ou Brave introuvable : ouverture dans le navigateur par défaut."; ouvrir_onglet; } ;;
  onglet) ouvrir_onglet ;;
  aucun) ;;
esac
