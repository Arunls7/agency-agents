#!/usr/bin/env node
// serveur.mjs — application locale « Agence IA » : le tableau de bord du kit et une
// discussion avec chaque agent -fr, servis sur 127.0.0.1 uniquement.
//
// Usage : node serveur.mjs [--kit <dossier>] [--agence <dossier>] [--claude <commande>]
//                          [--port <n>] [--inactivite <secondes>]
//
// Chaque message lance `claude -p --agent <agent>` : la réponse vient de votre compte
// Claude, comme dans le terminal, et s'affiche au fil de l'eau. L'agent peut lire vos
// fichiers et chercher sur le web ; il ne crée ou ne modifie des fichiers que dans le
// dossier de l'agence, et seulement si vous l'autorisez dans la discussion.
// Discussions enregistrées dans ~/.claude/agence-ia-fr/discussions/.
//
// Sécurité : écoute sur 127.0.0.1 ; jeton aléatoire (lisible seulement dans app.json, mode 600)
// exigé pour la page (transmis une fois par app.sh, puis cookie) et pour /api ; en-têtes Host,
// Origin et Sec-Fetch-Site vérifiés (contre les sites web et le DNS rebinding).
// Le serveur s'arrête seul quand la fenêtre est fermée depuis quelques minutes.

import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { genererPage } from '../outils/tableau-de-bord.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const HOME = os.homedir();
const CLAUDE_DIR = path.join(HOME, '.claude');
const REF_DIR = path.join(CLAUDE_DIR, 'agence-ia-fr');
const DISCUSSIONS = path.join(REF_DIR, 'discussions');
const ETAT = path.join(REF_DIR, 'app.json');

const args = process.argv.slice(2);
const option = (nom, defaut) => { const i = args.indexOf(`--${nom}`); return i >= 0 && args[i + 1] ? args[i + 1] : defaut; };
const KIT_DIR = path.resolve(option('kit', path.join(ICI, '..')));
const AGENCE_DIR = path.resolve(option('agence', path.join(HOME, 'Agence')));
const CLAUDE_BIN = option('claude', 'claude');
const PORT_DEMANDE = Number(option('port', 0));
const INACTIVITE_MS = Number(option('inactivite', 180)) * 1000;
const PORTS = PORT_DEMANDE ? [PORT_DEMANDE] : Array.from({ length: 31 }, (_, i) => 37800 + i);

const JETON = crypto.randomBytes(24).toString('hex');
// Task (nommé Agent dans les versions récentes) permet de confier une partie du travail à un autre agent -fr.
const OUTILS_LECTURE = ['Read', 'Glob', 'Grep', 'WebSearch', 'WebFetch', 'Task', 'Agent'];
const OUTILS_ECRITURE = ['Write', 'Edit'];
const CONTEXTE_APP = "Tu réponds dans l'application de bureau « Agence IA » : une fenêtre de discussion, pas un terminal. "
  + 'Tes réponses sont affichées en Markdown. Tu ne peux pas exécuter de commande shell. '
  + "Si tu dois créer ou modifier un fichier et que l'outil d'écriture n'est pas disponible, demande à l'utilisateur de cocher "
  + "« Autoriser la création de fichiers » en haut de la discussion puis de renvoyer sa demande ; tu n'écris que dans le dossier de l'agence. "
  + `Dossier personnel de l'utilisateur (~) : ${HOME}. Dossier de l'agence : ${AGENCE_DIR}.`;
let port = 0;
let dernierSigne = Date.now();
const enCours = new Map(); // id de discussion -> { partiel, outils, enfant, arrete }

// ---------------------------------------------------------------------------
// Outils

const maintenant = () => new Date().toISOString();
const court = s => String(s ?? '').split(HOME).join('~');
const tronquer = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const dossierAgence = () => { try { return fs.statSync(AGENCE_DIR).isDirectory(); } catch { return false; } };
const agentInstalle = nom => /^[a-z0-9][a-z0-9-]{0,80}$/.test(nom) && fs.existsSync(path.join(CLAUDE_DIR, 'agents', `${nom}.md`));
// Fiche de l'agence (CLAUDE.md) : absente, incomplète (champs du modèle non remplis) ou prête.
function ficheAgence() {
  let t;
  try { t = fs.readFileSync(path.join(AGENCE_DIR, 'CLAUDE.md'), 'utf8'); } catch { return 'absent'; }
  return /\{\{[A-Z_0-9]+\}\}|à compléter/i.test(t) ? 'incomplet' : 'pret';
}
const idValide = id => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id);

function ecrireFichier(p, contenu) {
  fs.mkdirSync(path.dirname(p), { recursive: true, mode: 0o700 });
  const tmp = `${p}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, contenu, { mode: 0o600 });
  fs.renameSync(tmp, p);
}

const cheminDiscussion = id => path.join(DISCUSSIONS, `${id}.json`);
function charger(id) {
  if (!idValide(id)) return null;
  try { return JSON.parse(fs.readFileSync(cheminDiscussion(id), 'utf8')); } catch { return null; }
}
const sauver = conv => ecrireFichier(cheminDiscussion(conv.id), JSON.stringify(conv, null, 1));
const resume = conv => ({
  id: conv.id, titre: conv.titre, agent: conv.agent, cree: conv.cree, maj: conv.maj,
  messages: conv.messages.length, enCours: enCours.has(conv.id),
});

function liste() {
  let fichiers = [];
  try { fichiers = fs.readdirSync(DISCUSSIONS).filter(f => f.endsWith('.json')); } catch { /* aucune */ }
  return fichiers.map(f => charger(f.slice(0, -5))).filter(Boolean).map(resume).sort((a, b) => (a.maj < b.maj ? 1 : -1));
}

function detailOutil(nom, e = {}) {
  const d = {
    Read: e.file_path, Write: e.file_path, Edit: e.file_path, NotebookEdit: e.notebook_path,
    Glob: e.pattern && (e.path ? `${e.pattern} dans ${e.path}` : e.pattern),
    Grep: e.pattern && (e.path ? `${e.pattern} dans ${e.path}` : e.pattern),
    WebSearch: e.query, WebFetch: e.url, Bash: e.command,
    Task: [e.subagent_type, e.description].filter(Boolean).join(' — '), Agent: [e.subagent_type, e.description].filter(Boolean).join(' — '),
  }[nom];
  return tronquer(court(d || ''), 160);
}

// Message d'erreur compréhensible, avec la marche à suivre quand on la connaît.
function expliquer(brut) {
  const m = String(brut || '').trim();
  if (/ENOENT|not found|introuvable/i.test(m) && /claude/i.test(m) && !/conversation/i.test(m)) {
    return `Claude Code est introuvable (${CLAUDE_BIN}). Relancez setup-agence.sh, ou indiquez le chemin de claude dans ~/.claude/agence-ia-fr/app.conf (CLAUDE_BIN=…).`;
  }
  if (/log ?in|not logged|invalid api key|authenticat|oauth|credential/i.test(m)) {
    return 'Claude Code n\'est pas connecté à votre compte. Ouvrez le Terminal, tapez claude, puis /login, et réessayez.';
  }
  if (/usage limit|rate limit|limit reached|quota|5-hour|weekly limit/i.test(m)) {
    return `Limite d'utilisation de votre abonnement Claude atteinte. Réessayez plus tard (détail : ${tronquer(m, 200)}).`;
  }
  if (/overloaded|529|ECONNRESET|ETIMEDOUT|network|fetch failed/i.test(m)) {
    return `Service Claude momentanément indisponible ou connexion coupée. Réessayez dans un instant (détail : ${tronquer(m, 200)}).`;
  }
  return m ? tronquer(m, 600) : 'Claude Code s\'est arrêté sans réponse.';
}

// ---------------------------------------------------------------------------
// Un tour de discussion : lance claude, relaie le texte et les outils au fil de l'eau.

function tour(conv, prompt, ecriture, emettre, suivi) {
  return new Promise(resolve => {
    const permis = ecriture && dossierAgence();
    const argsClaude = [
      '-p', '--output-format', 'stream-json', '--verbose', '--include-partial-messages',
      '--agent', conv.agent,
      // Outils disponibles : lecture et web ; écriture en plus si autorisée. Les écritures ne
      // sont acceptées sans question que dans le dossier de travail (le dossier de l'agence).
      '--tools', [...OUTILS_LECTURE, ...(permis ? OUTILS_ECRITURE : [])].join(','),
      '--allowedTools', OUTILS_LECTURE.join(','),
      ...(permis ? ['--permission-mode', 'acceptEdits'] : []),
      '--append-system-prompt', CONTEXTE_APP,
      ...(conv.demarree ? ['--resume', conv.sessionId] : ['--session-id', conv.sessionId]),
    ];
    const env = { ...process.env, DO_NOT_TRACK: '1' };
    delete env.CLAUDECODE; // pas de « session imbriquée » si l'app est lancée depuis Claude Code
    const debut = Date.now();
    let texte = '', separer = false, deltas = false, resultat = null, stderr = '', tampon = '', fini = false;
    const outils = [];
    suivi.partiel = ''; suivi.outils = outils;

    const ajouter = d => {
      if (separer && texte) d = `\n\n${d}`;
      separer = false;
      texte += d; suivi.partiel = texte;
      emettre({ t: 'texte', d });
    };
    const traiter = ev => {
      if (ev.type === 'system' && ev.subtype === 'init') { conv.demarree = true; emettre({ t: 'debut' }); return; }
      if (ev.type === 'stream_event' && !ev.parent_tool_use_id) {
        const e = ev.event || {};
        if (e.type === 'content_block_start' && e.content_block?.type === 'text') separer = true;
        if (e.type === 'content_block_delta' && e.delta?.type === 'text_delta' && e.delta.text) { deltas = true; ajouter(e.delta.text); }
        return;
      }
      if (ev.type === 'assistant' && !ev.parent_tool_use_id) {
        for (const c of ev.message?.content || []) {
          if (c.type === 'tool_use') {
            const o = { nom: c.name, detail: detailOutil(c.name, c.input) };
            outils.push(o);
            emettre({ t: 'outil', ...o });
          } else if (c.type === 'text' && !deltas && c.text) {
            ajouter(c.text); // version de Claude Code sans messages partiels
          }
        }
        return;
      }
      if (ev.type === 'result') resultat = ev;
    };

    const terminer = (code, erreurLancement) => {
      if (fini) return;
      fini = true;
      const duree = Date.now() - debut;
      if (suivi.arrete) return resolve({ texte, outils, duree, arrete: true });
      if (erreurLancement) return resolve({ texte, outils, duree, erreur: expliquer(`${erreurLancement.code || ''} claude ${erreurLancement.message}`) });
      if (resultat && !resultat.is_error) {
        if (!texte && resultat.result) ajouter(resultat.result);
        const refus = (resultat.permission_denials || []).map(r => ({ nom: r.tool_name, detail: detailOutil(r.tool_name, r.tool_input) }));
        return resolve({ texte, outils, duree, refus });
      }
      const brut = resultat?.result || (resultat?.errors || []).join('\n') || stderr.trim().split('\n').slice(-6).join('\n')
        || `Claude Code s'est arrêté (code ${code}).`;
      const sessionPerdue = conv.demarree && /no conversation found|session.*(not found|introuvable)/i.test(`${brut}\n${stderr}`);
      resolve({ texte, outils, duree, erreur: expliquer(brut), sessionPerdue });
    };

    let enfant;
    try {
      enfant = spawn(CLAUDE_BIN, argsClaude, { cwd: dossierAgence() ? AGENCE_DIR : HOME, env, stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (e) { terminer(null, e); return; }
    suivi.enfant = enfant;
    enfant.on('error', e => terminer(null, e));
    enfant.stdout.setEncoding('utf8');
    enfant.stdout.on('data', morceau => {
      tampon += morceau;
      let i;
      while ((i = tampon.indexOf('\n')) >= 0) {
        const ligne = tampon.slice(0, i);
        tampon = tampon.slice(i + 1);
        if (!ligne.trim()) continue;
        try { traiter(JSON.parse(ligne)); } catch { /* ligne non JSON : ignorée */ }
      }
    });
    enfant.stderr.setEncoding('utf8');
    enfant.stderr.on('data', d => { stderr = (stderr + d).slice(-8000); });
    enfant.on('close', code => terminer(code));
    enfant.stdin.on('error', () => {});
    enfant.stdin.end(prompt);
  });
}

// Si Claude Code ne retrouve plus la session (effacée, autre machine), on repart d'une
// nouvelle session en lui redonnant les derniers échanges.
function reprise(conv, texte) {
  const precedents = conv.messages.slice(0, -1).slice(-12)
    .map(m => `${m.role === 'utilisateur' ? 'Moi' : 'Toi'} : ${tronquer(m.texte || '', 4000)}`);
  return `(Reprise d'une discussion précédente dont l'historique n'est plus disponible. Derniers échanges :)\n\n${precedents.join('\n\n')}\n\n(Nouveau message :)\n${texte}`;
}

// ---------------------------------------------------------------------------
// HTTP

const ENTETES_SURS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store',
};
const CSP = "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; "
  + "img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

function envoyer(res, code, type, corps, extra = {}) {
  res.writeHead(code, { 'Content-Type': type, ...ENTETES_SURS, ...extra });
  res.end(corps);
}
const json = (res, code, obj) => envoyer(res, code, 'application/json; charset=utf-8', JSON.stringify(obj));

const hotesPermis = () => [`127.0.0.1:${port}`, `localhost:${port}`];
const hoteValide = req => hotesPermis().includes(String(req.headers.host || '').toLowerCase());
function origineValide(req) {
  const o = req.headers.origin;
  if (o && !hotesPermis().some(h => o === `http://${h}`)) return false;
  const site = req.headers['sec-fetch-site'];
  return !site || site === 'same-origin' || site === 'none';
}
function egal(valeur) {
  const j = Buffer.from(String(valeur || ''));
  const attendu = Buffer.from(JETON);
  return j.length === attendu.length && crypto.timingSafeEqual(j, attendu);
}
const jetonValide = req => egal(req.headers['x-agence-jeton']);
const nomCookie = () => `agence-${port}`;
function cookieValide(req) {
  const m = new RegExp(`(?:^|;\\s*)${nomCookie()}=([0-9a-f]+)`).exec(String(req.headers.cookie || ''));
  return Boolean(m) && egal(m[1]);
}

function lireCorps(req, max = 1_000_000) {
  return new Promise((resolve, reject) => {
    let taille = 0;
    const morceaux = [];
    req.on('data', m => {
      taille += m.length;
      if (taille > max) { reject(Object.assign(new Error('Message trop long'), { code: 413 })); req.destroy(); return; }
      morceaux.push(m);
    });
    req.on('end', () => {
      try { resolve(morceaux.length ? JSON.parse(Buffer.concat(morceaux).toString('utf8')) : {}); }
      catch { reject(Object.assign(new Error('JSON invalide'), { code: 400 })); }
    });
    req.on('error', reject);
  });
}

const STATIQUES = {
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/app.css': ['app.css', 'text/css; charset=utf-8'],
  '/icone.png': ['icone.png', 'image/png'],
};

async function routeMessage(req, res) {
  const corps = await lireCorps(req);
  const texte = typeof corps.texte === 'string' ? corps.texte.trim() : '';
  if (!texte) return json(res, 400, { erreur: 'Message vide.' });
  if (texte.length > 100_000) return json(res, 413, { erreur: 'Message trop long.' });

  let conv = null;
  if (corps.conversation) {
    conv = charger(corps.conversation);
    if (!conv) return json(res, 404, { erreur: 'Discussion introuvable.' });
  } else {
    const agent = String(corps.agent || '');
    conv = {
      id: crypto.randomUUID(), sessionId: crypto.randomUUID(), demarree: false, agent,
      titre: tronquer(String(typeof corps.titre === 'string' && corps.titre.trim() ? corps.titre : texte).replace(/\s+/g, ' ').trim(), 70),
      cree: maintenant(), maj: maintenant(), messages: [],
    };
  }
  if (!agentInstalle(conv.agent)) {
    return json(res, 400, { erreur: `L'agent « ${conv.agent} » n'est pas installé dans ~/.claude/agents. Relancez setup-agence.sh.` });
  }
  if (enCours.has(conv.id)) return json(res, 409, { erreur: 'L\'agent répond encore dans cette discussion.' });

  const ecriture = corps.ecriture === true && dossierAgence();
  conv.messages.push({ role: 'utilisateur', texte, date: maintenant(), ...(ecriture ? { ecriture: true } : {}) });
  conv.maj = maintenant();
  sauver(conv);

  const suivi = { partiel: '', outils: [], enfant: null, arrete: false };
  enCours.set(conv.id, suivi);
  res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', ...ENTETES_SURS });
  // Si la fenêtre se ferme, la réponse continue et sera enregistrée.
  const emettre = obj => { if (!res.destroyed && !res.writableEnded) res.write(`${JSON.stringify(obj)}\n`); };
  emettre({ t: 'conversation', conversation: resume(conv) });

  let r;
  try {
    r = await tour(conv, texte, ecriture, emettre, suivi);
    if (r.sessionPerdue) {
      conv.sessionId = crypto.randomUUID();
      conv.demarree = false;
      r = await tour(conv, reprise(conv, texte), ecriture, emettre, suivi);
    }
  } finally {
    enCours.delete(conv.id);
  }
  const reponse = {
    role: 'agent', texte: r.texte, outils: r.outils, date: maintenant(), duree: r.duree,
    ...(r.erreur ? { erreur: r.erreur } : {}),
    ...(r.refus && r.refus.length ? { refus: r.refus } : {}),
    ...(r.arrete ? { arrete: true } : {}),
  };
  conv.messages.push(reponse);
  conv.maj = maintenant();
  sauver(conv);
  emettre({ t: 'fin', message: reponse, conversation: resume(conv) });
  res.end();
}

async function routeApi(req, res, url) {
  const m = /^\/api\/conversations(?:\/([^/]+))?$/.exec(url.pathname);
  if (m && req.method === 'GET' && !m[1]) return json(res, 200, liste());
  if (m && m[1]) {
    const conv = charger(m[1]);
    if (!conv) return json(res, 404, { erreur: 'Discussion introuvable.' });
    if (req.method === 'GET') {
      const suivi = enCours.get(conv.id);
      const { sessionId, demarree, ...visible } = conv;
      return json(res, 200, { ...visible, enCours: Boolean(suivi), partiel: suivi?.partiel || '', outilsEnCours: suivi?.outils || [] });
    }
    if (req.method === 'DELETE') {
      if (enCours.has(conv.id)) return json(res, 409, { erreur: 'Arrêtez d\'abord la réponse en cours.' });
      fs.rmSync(cheminDiscussion(conv.id), { force: true });
      return json(res, 200, { ok: true });
    }
  }
  if (req.method === 'GET' && url.pathname === '/api/etat') {
    return json(res, 200, {
      ok: true, pid: process.pid, agence: court(AGENCE_DIR), agenceExiste: dossierAgence(), agenceEtat: ficheAgence(), claude: versionClaude,
    });
  }
  if (req.method === 'POST') {
    if (url.pathname === '/api/message') return routeMessage(req, res);
    if (url.pathname === '/api/battement') return json(res, 200, { ok: true });
    if (url.pathname === '/api/creer-agence') {
      // Bouton « Créer la fiche » : crée le dossier de l'agence (vide), rien d'autre.
      fs.mkdirSync(AGENCE_DIR, { recursive: true });
      return json(res, 200, { ok: true, agence: court(AGENCE_DIR) });
    }
    if (url.pathname === '/api/arreter') {
      const { conversation } = await lireCorps(req);
      const suivi = enCours.get(conversation);
      if (suivi?.enfant) { suivi.arrete = true; suivi.enfant.kill('SIGTERM'); }
      return json(res, 200, { ok: Boolean(suivi) });
    }
    if (url.pathname === '/api/quitter') {
      json(res, 200, { ok: true });
      setTimeout(() => quitter(0), 200);
      return undefined;
    }
  }
  return json(res, 404, { erreur: 'Introuvable.' });
}

const serveur = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (!hoteValide(req)) return envoyer(res, 403, 'text/plain; charset=utf-8', 'Hôte refusé.');
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      // app.sh ouvre /?jeton=… : on le garde dans un cookie et on le retire de l'adresse.
      if (egal(url.searchParams.get('jeton'))) {
        res.writeHead(303, { Location: '/', 'Set-Cookie': `${nomCookie()}=${JETON}; HttpOnly; SameSite=Strict; Path=/`, ...ENTETES_SURS });
        return res.end();
      }
      if (!cookieValide(req)) {
        return envoyer(res, 403, 'text/html; charset=utf-8',
          '<!doctype html><meta charset="utf-8"><title>Agence IA</title><body style="font:15px system-ui;padding:40px;background:#1f1f1e;color:#f0efec">'
          + '<p>Session expirée ou accès direct : ouvrez l\'application avec son icône « Agence IA » ou <code>bash app.sh</code>.</p>');
      }
      const html = await genererPage({ kitDir: KIT_DIR, agenceDir: AGENCE_DIR, jeton: JETON });
      return envoyer(res, 200, 'text/html; charset=utf-8', html, { 'Content-Security-Policy': CSP });
    }
    if (req.method === 'GET' && STATIQUES[url.pathname]) {
      const [fichier, type] = STATIQUES[url.pathname];
      return envoyer(res, 200, type, fs.readFileSync(path.join(ICI, fichier)));
    }
    if (req.method === 'GET' && url.pathname === '/favicon.ico') return envoyer(res, 204, 'text/plain', '');
    if (url.pathname.startsWith('/api/')) {
      if (!origineValide(req) || !jetonValide(req)) return json(res, 403, { erreur: 'Accès refusé.' });
      dernierSigne = Date.now();
      return await routeApi(req, res, url);
    }
    return envoyer(res, 404, 'text/plain; charset=utf-8', 'Introuvable.');
  } catch (e) {
    const client = typeof e.code === 'number' && e.code >= 400 && e.code < 500;
    if (!client) console.error(e);
    if (!res.headersSent) return json(res, client ? e.code : 500, { erreur: client ? e.message : 'Erreur interne.' });
    res.end();
  }
  return undefined;
});
serveur.requestTimeout = 0; // les réponses d'agent peuvent durer plusieurs minutes

// ---------------------------------------------------------------------------
// Démarrage, état partagé avec app.sh, arrêt automatique

let versionClaude = null;
{
  const v = spawnSync(CLAUDE_BIN, ['--version'], { encoding: 'utf8', timeout: 15000 });
  versionClaude = v.status === 0 ? v.stdout.trim() : null;
  if (!versionClaude) console.error(`claude introuvable ou en erreur (${CLAUDE_BIN})`);
}

function quitter(code) {
  for (const suivi of enCours.values()) { suivi.arrete = true; suivi.enfant?.kill('SIGTERM'); }
  try {
    const e = JSON.parse(fs.readFileSync(ETAT, 'utf8'));
    if (e.pid === process.pid) fs.rmSync(ETAT, { force: true });
  } catch { /* déjà supprimé */ }
  process.exit(code);
}
process.on('SIGTERM', () => quitter(0));
process.on('SIGHUP', () => {}); // fermeture du terminal : la fenêtre de l'application reste utilisable
process.on('SIGINT', () => quitter(0));

function ecouter(i) {
  if (i >= PORTS.length) {
    console.error(`Aucun port libre entre ${PORTS[0]} et ${PORTS[PORTS.length - 1]}.`);
    process.exit(1);
  }
  serveur.once('error', e => {
    if (e.code === 'EADDRINUSE') ecouter(i + 1);
    else { console.error(e.message); process.exit(1); }
  });
  serveur.listen(PORTS[i], '127.0.0.1', () => {
    port = serveur.address().port;
    ecrireFichier(ETAT, JSON.stringify({ port, pid: process.pid, jeton: JETON, kit: KIT_DIR, agence: AGENCE_DIR }));
    console.log(`Agence IA : http://127.0.0.1:${port}/ (pid ${process.pid})`);
    setInterval(() => {
      if (enCours.size === 0 && Date.now() - dernierSigne > INACTIVITE_MS) {
        console.log('Fenêtre fermée : arrêt.');
        quitter(0);
      }
    }, 15000).unref();
  });
}
ecouter(0);
