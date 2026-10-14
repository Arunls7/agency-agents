#!/usr/bin/env node
// tableau-de-bord.mjs — génère le tableau de bord local du kit agence-ia-fr,
// sur le modèle de celui de l'application Agency Agents.
//
// Usage : node tableau-de-bord.mjs <dossier-du-kit> [<dossier-de-l-agence>]
// Écrit ~/.claude/agence-ia-fr/tableau-de-bord.html (page autonome, aucune
// ressource externe) et affiche son chemin. Lecture seule partout ailleurs.
//
// Importé par app/serveur.mjs, genererPage({ jeton }) produit la même page en
// mode application : vue Discussion, boutons « Discuter », app.js et app.css.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HOME = os.homedir();
const CLAUDE_DIR = path.join(HOME, '.claude');
const REF_DIR = path.join(CLAUDE_DIR, 'agence-ia-fr');
const OUT = path.join(REF_DIR, 'tableau-de-bord.html');

// Domaines dans l'ordre d'affichage (ordre fixe = couleur fixe).
const DOMAINES = [
  ['Vente', ['sales-discovery-coach-fr', 'sales-outbound-strategist-fr', 'sales-proposal-strategist-fr', 'sales-offer-lead-gen-strategist-fr', 'sales-engineer-fr', 'specialized-pricing-analyst-fr']],
  ['Acquisition et contenu', ['marketing-linkedin-content-creator-fr', 'marketing-seo-specialist-fr', 'marketing-email-strategist-fr', 'paid-media-paid-social-strategist-fr', 'paid-media-ppc-strategist-fr', 'paid-media-tracking-specialist-fr', 'paid-media-creative-strategist-fr', 'contenu-video-ia-fr', 'avis-reputation-locale-fr']],
  ['Production', ['engineering-ai-engineer-fr', 'engineering-multi-agent-systems-architect-fr', 'specialized-mcp-builder-fr', 'specialized-workflow-architect-fr', 'engineering-rag-pipeline-engineer-fr', 'engineering-voice-ai-integration-engineer-fr', 'engineering-prompt-engineer-fr', 'project-management-project-shepherd-fr', 'testing-reality-checker-fr', 'engineering-it-service-manager-fr']],
  ['Clients', ['customer-success-manager-fr']],
  ['Argent', ['chief-financial-officer-fr', 'legal-billing-time-tracking-fr', 'grant-writer-fr']],
  ['Développement et marché', ['partenaires-prescripteurs-fr', 'business-strategist-fr', 'product-manager-fr', 'veille-marche-ia-fr']],
  ['Conformité et organisation', ['automation-governance-architect-fr', 'data-privacy-officer-fr', 'support-legal-compliance-checker-fr', 'juriste-contrats-fr', 'specialized-chief-of-staff-fr']],
  ['Cybersécurité', ['cybersecurite-offre-fr', 'cybersecurite-diagnostic-fr', 'cybersecurite-sensibilisation-fr', 'cybersecurite-fraude-ia-fr', 'cybersecurite-comptes-cloud-fr', 'cybersecurite-incident-fr', 'cybersecurite-ia-fr', 'cybersecurite-veille-menaces-fr']],
];
const AUTRES = 'Autres';

// Nom court affiché pour chaque agent (le nom technique reste celui de Claude Code).
const TITRES = {
  'specialized-chief-of-staff-fr': 'Bras droit',
  'sales-discovery-coach-fr': 'Découverte commerciale', 'sales-outbound-strategist-fr': 'Prospection',
  'sales-proposal-strategist-fr': 'Propositions et devis', 'sales-offer-lead-gen-strategist-fr': 'Offres et acquisition',
  'sales-engineer-fr': 'Avant-vente', 'specialized-pricing-analyst-fr': 'Tarifs',
  'marketing-linkedin-content-creator-fr': 'LinkedIn', 'marketing-seo-specialist-fr': 'SEO',
  'marketing-email-strategist-fr': 'E-mailing', 'paid-media-paid-social-strategist-fr': 'Pub Meta et LinkedIn',
  'paid-media-ppc-strategist-fr': 'Google Ads', 'paid-media-tracking-specialist-fr': 'Mesure des campagnes',
  'paid-media-creative-strategist-fr': 'Créations publicitaires', 'contenu-video-ia-fr': 'Vidéos et visuels IA',
  'avis-reputation-locale-fr': 'Avis et réputation locale',
  'engineering-ai-engineer-fr': 'Ingénieur IA', 'engineering-multi-agent-systems-architect-fr': 'Architecte multi-agents',
  'specialized-mcp-builder-fr': 'Connecteurs MCP', 'specialized-workflow-architect-fr': 'Workflows',
  'engineering-rag-pipeline-engineer-fr': 'Assistants documentaires (RAG)',
  'engineering-voice-ai-integration-engineer-fr': 'Standard téléphonique IA', 'engineering-prompt-engineer-fr': 'Prompts',
  'project-management-project-shepherd-fr': 'Chef de projet', 'testing-reality-checker-fr': 'Recette',
  'engineering-it-service-manager-fr': 'Maintenance et support', 'customer-success-manager-fr': 'Fidélisation clients',
  'chief-financial-officer-fr': 'DAF', 'legal-billing-time-tracking-fr': 'Facturation et temps',
  'grant-writer-fr': 'Aides et financements', 'partenaires-prescripteurs-fr': 'Partenaires et prescripteurs',
  'business-strategist-fr': 'Stratégie', 'product-manager-fr': 'Offres packagées', 'veille-marche-ia-fr': 'Veille marché',
  'cybersecurite-offre-fr': 'Offre cybersécurité', 'cybersecurite-diagnostic-fr': 'Diagnostic cyber',
  'cybersecurite-sensibilisation-fr': 'Sensibilisation cyber', 'cybersecurite-fraude-ia-fr': 'Fraudes et hypertrucages',
  'cybersecurite-comptes-cloud-fr': 'Comptes en ligne', 'cybersecurite-incident-fr': 'Cyberattaque',
  'cybersecurite-ia-fr': 'Sécurité des livrables IA', 'cybersecurite-veille-menaces-fr': 'Veille des menaces',
  'automation-governance-architect-fr': 'Gouvernance des automatisations', 'data-privacy-officer-fr': 'RGPD',
  'support-legal-compliance-checker-fr': 'Conformité réglementaire', 'juriste-contrats-fr': 'Contrats',
};
const titreDe = nom => TITRES[nom] || nom.replace(/-fr$/, '').replace(/-/g, ' ');

// ---------------------------------------------------------------------------
// Lecture

const lire = p => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };
const mtime = p => { try { return fs.statSync(p).mtimeMs; } catch { return 0; } };
const listeMd = d => { try { return fs.readdirSync(d).filter(f => f.endsWith('.md')).sort(); } catch { return []; } };

function frontmatter(texte) {
  const m = /^---\n([\s\S]*?)\n---/.exec(texte || '');
  const champs = {};
  if (!m) return champs;
  for (const ligne of m[1].split('\n')) {
    const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(ligne);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) { try { v = JSON.parse(v); } catch { v = v.slice(1, -1); } }
    else if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1).replace(/''/g, "'");
    champs[kv[1]] = v;
  }
  return champs;
}

// État d'un fichier installé par rapport au kit : identique, kit plus récent
// (obsolète : une mise à jour l'apportera), modifié après l'installation, ou absent.
function etat(source, installe) {
  const a = lire(source), b = lire(installe);
  if (b === null) return 'manquant';
  if (a === b) return 'a-jour';
  return mtime(source) > mtime(installe) ? 'obsolete' : 'modifie';
}

const KIT_PAR_DEFAUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function genererPage({ kitDir = KIT_PAR_DEFAUT, agenceDir = path.join(HOME, 'Agence'), jeton = null } = {}) {
const KIT_DIR = path.resolve(kitDir);
const AGENCE_DIR = path.resolve(agenceDir);
const APP = Boolean(jeton);
const domaineDe = new Map();
DOMAINES.forEach(([nom, liste]) => liste.forEach(a => domaineDe.set(a, nom)));
const agents = listeMd(path.join(KIT_DIR, 'agents')).map(f => {
  const fm = frontmatter(lire(path.join(KIT_DIR, 'agents', f)));
  const nom = fm.name || f.replace(/\.md$/, '');
  return {
    nom,
    titre: titreDe(nom),
    emoji: fm.emoji || '•',
    description: fm.description || '',
    domaine: domaineDe.get(nom) || AUTRES,
    etat: etat(path.join(KIT_DIR, 'agents', f), path.join(CLAUDE_DIR, 'agents', f)),
    commandes: [],
  };
});
const agentParNom = new Map(agents.map(a => [a.nom, a]));

const commandes = listeMd(path.join(KIT_DIR, 'commandes')).map(f => {
  const texte = lire(path.join(KIT_DIR, 'commandes', f)) || '';
  const fm = frontmatter(texte);
  const nom = '/' + f.replace(/\.md$/, '');
  const corps = texte.replace(/^---\n[\s\S]*?\n---/, '');
  const cites = [...new Set([...corps.matchAll(/`([a-z0-9-]+-fr)`/g)].map(m => m[1]))].filter(n => agentParNom.has(n));
  cites.forEach(n => agentParNom.get(n).commandes.push(nom));
  return {
    nom,
    description: fm.description || '',
    exemple: fm['argument-hint'] || '',
    agents: cites,
    domaine: cites.length ? agentParNom.get(cites[0]).domaine : AUTRES,
    etat: etat(path.join(KIT_DIR, 'commandes', f), path.join(CLAUDE_DIR, 'commands', f)),
  };
});

// Fichiers présents dans ~/.claude mais pas dans le kit (vos agents, vos commandes, originaux anglais).
const nonSuivisAgents = listeMd(path.join(CLAUDE_DIR, 'agents')).filter(f => !agents.some(a => `${a.nom}.md` === f));
const nonSuivisCommandes = listeMd(path.join(CLAUDE_DIR, 'commands')).filter(f => !commandes.some(c => `${c.nom.slice(1)}.md` === f));

// Registre des faits datés.
function infoRegistre(texte) {
  if (!texte) return null;
  const verif = /Dernière vérification\s*:\s*([^.*\n]+)/.exec(texte);
  const relecture = /prochaine relecture\s*:\s*([^)\n]+)/.exec(texte);
  const sections = [];
  let courante = null;
  const aVerifier = [];
  for (const l of texte.split('\n')) {
    const h = /^## (.+)$/.exec(l);
    if (h) { courante = { titre: h[1].trim(), regles: 0 }; sections.push(courante); continue; }
    if (!courante || !/^\| /.test(l) || /^\| (Thème|-)/.test(l)) continue;
    courante.regles += 1;
    if (/^À vérifier/.test(courante.titre)) {
      const cols = l.split('|').map(c => c.trim());
      aVerifier.push({ theme: cols[1] || '', point: cols[2] || '', raison: cols[3] || '' });
    }
  }
  const regles = sections.filter(s => !/^À vérifier/.test(s.titre));
  return {
    verification: verif ? verif[1].trim() : '?',
    relecture: relecture ? relecture[1].trim() : '',
    sections: regles,
    regles: regles.reduce((n, s) => n + s.regles, 0),
    aVerifier,
  };
}
const registre = infoRegistre(lire(path.join(REF_DIR, 'faits-dates.md'))) || infoRegistre(lire(path.join(KIT_DIR, 'faits-dates.md')));
const registreInstalle = lire(path.join(REF_DIR, 'faits-dates.md')) !== null;
const registreEtat = etat(path.join(KIT_DIR, 'faits-dates.md'), path.join(REF_DIR, 'faits-dates.md'));

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
function relectureDepassee(relecture) {
  const m = /([a-zéû]+)\s+(\d{4})/i.exec(relecture || '');
  if (!m) return false;
  const mois = MOIS.indexOf(m[1].toLowerCase());
  return mois >= 0 && new Date() > new Date(Number(m[2]), mois + 1, 0, 23, 59);
}

const regleLecture = (lire(path.join(CLAUDE_DIR, 'settings.json')) || '').includes('Read(~/.claude/agence-ia-fr/**)');

async function infoMemoire() {
  const brut = lire(path.join(HOME, '.claude-mem', 'settings.json'));
  if (brut === null) return { installe: false };
  let s = {};
  try { s = JSON.parse(brut); } catch { /* valeurs par défaut */ }
  const uid = typeof process.getuid === 'function' ? process.getuid() : 77;
  const port = Number(s.CLAUDE_MEM_WORKER_PORT) || 37700 + (uid % 100);
  let actif = false;
  try { actif = (await fetch(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(1500) })).ok; } catch { /* arrêté */ }
  return {
    installe: true, port, actif,
    fournisseur: s.CLAUDE_MEM_PROVIDER || '?',
    cloud: Boolean(s.CLAUDE_MEM_CLOUD_SYNC_TOKEN),
    pubCachee: s.CLAUDE_MEM_CONTEXT_SHOW_TERMINAL_OUTPUT === 'false' && s.CLAUDE_MEM_WELCOME_HINT_ENABLED === 'false',
  };
}
const memoire = await infoMemoire();

function infoAgence() {
  const p = path.join(AGENCE_DIR, 'CLAUDE.md');
  const t = lire(p);
  const champsModele = new Set((lire(path.join(KIT_DIR, 'modele-agence', 'CLAUDE.md')) || '').match(/\{\{[A-Z_0-9]+\}\}/g) || []).size || 1;
  if (t === null) return { chemin: p, etat: 'absent', remplissage: 0 };
  const trous = (t.match(/\{\{[A-Z_0-9]+\}\}/g) || []).length + (t.match(/à compléter/gi) || []).length;
  const nom = /Nom commercial\s*:\s*(.+)/.exec(t);
  return {
    chemin: p, etat: trous ? 'incomplet' : 'pret', trous,
    remplissage: Math.max(0, Math.min(100, Math.round(100 * (1 - trous / champsModele)))),
    nom: nom ? nom[1].trim() : '',
  };
}
const agence = infoAgence();

function infoApp() {
  const r = spawnSync('brew', ['list', '--cask', 'agency-agents'], { stdio: 'ignore' });
  if (r.error) return 'inconnue';
  return r.status === 0 ? 'installee' : 'absente';
}
const app = infoApp();
const iconeApp = fs.existsSync(path.join(REF_DIR, 'app-bundle-par-le-kit')) || fs.existsSync(path.join(REF_DIR, 'app-menu-par-le-kit'));

// Activité : chaque sauvegarde correspond à une installation ou une mise à jour.
const activite = (() => {
  const dir = path.join(CLAUDE_DIR, 'backups');
  const reference = (lire(path.join(dir, 'AVANT-AGENCE')) || '').trim();
  let dossiers = [];
  try { dossiers = fs.readdirSync(dir).filter(d => /^\d{4}-\d{2}-\d{2}-\d{4,6}$/.test(d)).sort().reverse(); } catch { /* aucune */ }
  return dossiers.map(d => {
    const [a, mo, j, h] = d.split('-');
    const ajouts = (lire(path.join(dir, d, 'fichiers-ajoutes.txt')) || '').split('\n').filter(Boolean).length;
    return { dossier: d, date: `${j}/${mo}/${a} à ${h.slice(0, 2)}:${h.slice(2, 4)}`, ajouts, reference: path.join(dir, d) === reference };
  });
})();

// ---------------------------------------------------------------------------
// Rendu

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const nb = (liste, e) => liste.filter(x => x.etat === e).length;
const installes = liste => liste.filter(x => x.etat !== 'manquant').length;
const domainesPresents = [...DOMAINES.map(d => d[0]), AUTRES].filter(d => agents.some(a => a.domaine === d));
const varDomaine = d => `--serie-${DOMAINES.findIndex(x => x[0] === d) + 1 || 9}`;

const ETATS = [
  ['a-jour', 'À jour', '--good', '✓'],
  ['obsolete', 'Obsolètes', '--warning', '↻'],
  ['modifie', 'Modifiés', '--serious', '✎'],
  ['non-suivi', 'Non suivis', '--neutre', '?'],
  ['manquant', 'Manquants', '--critical', '✕'],
];
const libEtat = { 'a-jour': 'À jour', obsolete: 'Obsolète', modifie: 'Modifié', manquant: 'Manquant' };
const badge = e => {
  const def = ETATS.find(x => x[0] === e);
  return `<span class="badge" style="--c:var(${def[2]})"><span aria-hidden="true">${def[3]}</span> ${libEtat[e]}</span>`;
};

// Anneau SVG : segments séparés par un espace de 2 px, info-bulle au survol.
function anneau(segments, { taille = 150, epaisseur = 14, centre = '', sous = '', icone = '' } = {}) {
  const r = (taille - epaisseur) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((n, s) => n + s.valeur, 0);
  const visibles = segments.filter(s => s.valeur > 0);
  const espace = visibles.length > 1 ? 2.5 : 0;
  let decalage = 0;
  const arcs = visibles.map(s => {
    const long = (s.valeur / total) * c;
    const arc = `<circle class="arc" cx="${taille / 2}" cy="${taille / 2}" r="${r}" fill="none" stroke="var(${s.couleur})" stroke-width="${epaisseur}"
      stroke-dasharray="${Math.max(long - espace, 0.5)} ${c}" stroke-dashoffset="${-decalage}" tabindex="0"
      data-tip="${esc(`${s.libelle} : ${s.valeur}`)}"/>`;
    decalage += long;
    return arc;
  }).join('');
  const milieu = icone
    ? `<div class="anneau-icone">${icone}</div>`
    : `<div class="anneau-centre"><b>${esc(centre)}</b><span>${esc(sous)}</span></div>`;
  return `<div class="anneau" style="width:${taille}px;height:${taille}px" role="img" aria-label="${esc(visibles.map(s => `${s.libelle} ${s.valeur}`).join(', ') || 'vide')}">
    <svg viewBox="0 0 ${taille} ${taille}" width="${taille}" height="${taille}"><g transform="rotate(-90 ${taille / 2} ${taille / 2})">
      <circle cx="${taille / 2}" cy="${taille / 2}" r="${r}" fill="none" stroke="var(--piste)" stroke-width="${epaisseur}"/>${arcs}</g></svg>${milieu}</div>`;
}

const ligneLegende = (couleur, libelle, valeur, niveau = 0) =>
  `<li class="niv${niveau}"><span class="carre" style="background:var(${couleur})"></span><span class="lib">${esc(libelle)}</span><b>${valeur}</b></li>`;

const carte = (titre, contenu, classe = '') => `<section class="carte ${classe}"><h2>${esc(titre)}</h2>${contenu}</section>`;

// ----- Vue « Tableau de bord »

const nbInstalles = installes(agents) + installes(commandes);
const santeTotaux = {
  'a-jour': nb(agents, 'a-jour') + nb(commandes, 'a-jour'),
  obsolete: nb(agents, 'obsolete') + nb(commandes, 'obsolete'),
  modifie: nb(agents, 'modifie') + nb(commandes, 'modifie'),
  'non-suivi': nonSuivisAgents.length + nonSuivisCommandes.length,
  manquant: nb(agents, 'manquant') + nb(commandes, 'manquant'),
};

const tuiles = `
<div class="rang deux">
  <section class="carte tuile"><div class="grand">${agents.length}</div><div class="petit">agents FR disponibles</div></section>
  <section class="carte tuile"><div class="grand">${nbInstalles}</div><div class="petit">installés par vous (agents et commandes)</div></section>
</div>`;

const installesParVous = carte('Installés par vous', `
  <div class="duo">
    ${anneau([
      { libelle: 'Agents FR', valeur: installes(agents), couleur: '--serie-2' },
      { libelle: 'Commandes', valeur: installes(commandes), couleur: '--serie-3' },
      { libelle: 'Vos autres agents et commandes', valeur: santeTotaux['non-suivi'], couleur: '--neutre' },
    ], { centre: nbInstalles + santeTotaux['non-suivi'], sous: 'INSTALLÉS' })}
    <ul class="legende-arbre">
      ${ligneLegende('--serie-2', 'Claude Code (global)', nbInstalles)}
      ${ligneLegende('--serie-2', 'Agents FR', installes(agents), 1)}
      ${ligneLegende('--serie-3', 'Commandes /slash', installes(commandes), 1)}
      ${ligneLegende('--neutre', 'Hors kit', santeTotaux['non-suivi'])}
      ${ligneLegende('--neutre', 'Vos agents', nonSuivisAgents.length, 1)}
      ${ligneLegende('--neutre', 'Vos commandes', nonSuivisCommandes.length, 1)}
    </ul>
  </div>`);

const projets = carte('Projets', agence.etat === 'absent'
  ? `<p class="vide">Aucune fiche d'agence dans <code>${esc(agence.chemin)}</code>.<br>Lancez <code>claude</code> dans ce dossier puis <code>/configurer-agence</code>.</p>`
  : `<div class="projet">
      <div class="projet-tete"><b>${esc(path.basename(AGENCE_DIR))}</b><span>${agence.remplissage} % rempli</span></div>
      <div class="jauge" role="img" aria-label="Fiche remplie à ${agence.remplissage} %"><div style="width:${agence.remplissage}%"></div></div>
      <div class="projet-pied"><span class="carre" style="background:var(--rose)"></span><span>${esc(agence.nom || 'Fiche d\'agence')}${agence.etat === 'incomplet' ? ` · ${agence.trous} champ(s) à compléter (<code>/configurer-agence</code>)` : ' · lue par tous les agents'}</span></div>
    </div>`);

const sante = carte('Santé de l\'installation', `
  <div class="duo">
    ${anneau(ETATS.map(([cle, lib, coul]) => ({ libelle: lib, valeur: santeTotaux[cle], couleur: coul })), { centre: nbInstalles + santeTotaux['non-suivi'], sous: 'FICHIERS' })}
    <ul class="legende-arbre plate">${ETATS.map(([cle, lib, coul]) => ligneLegende(coul, lib, santeTotaux[cle])).join('')}</ul>
  </div>
  ${santeTotaux.obsolete + santeTotaux.manquant > 0 ? '<p class="conseil">Mettre à jour : <code>bash ~/tools/agency-agents/agence-ia-fr/mettre-a-jour.sh</code></p>' : ''}`);

const barreOutil = (libelle, valeur, max, detail) => {
  const pct = max ? Math.round((valeur / max) * 100) : 0;
  return `<li><span class="point" style="background:var(${pct ? '--good' : '--neutre'})"></span><span class="lib">${esc(libelle)}</span>
    <span class="piste-barre" role="img" aria-label="${esc(`${libelle} : ${detail}`)}"><span style="width:${pct}%"></span></span><b>${esc(detail)}</b></li>`;
};
const couverture = carte('Couverture par outil', `
  <ul class="outils">
    ${barreOutil('Claude Code · agents', installes(agents), agents.length, `${installes(agents)}/${agents.length}`)}
    ${barreOutil('Claude Code · commandes', installes(commandes), commandes.length, `${installes(commandes)}/${commandes.length}`)}
    ${barreOutil('Registre des faits datés', registreInstalle ? 1 : 0, 1, registreInstalle ? `${registre.regles} règles` : 'absent')}
    ${barreOutil('claude-mem', memoire.actif ? 1 : 0, 1, memoire.installe ? (memoire.actif ? 'actif' : 'arrêté') : 'non installé')}
    ${barreOutil('Application Agency Agents', app === 'installee' ? 1 : 0, 1, app === 'installee' ? 'installée' : 'non installée')}
  </ul>
  <a class="lien" href="#outils">Gérer les outils →</a>`);

const parDomaine = d => agents.filter(a => a.domaine === d).length;
const commandesParDomaine = d => commandes.filter(c => c.domaine === d).length;
const croisee = carte('Couverture croisée', `
  <div class="anneaux">
    <figure>${anneau(domainesPresents.map(d => ({ libelle: d, valeur: parDomaine(d), couleur: varDomaine(d) })), { taille: 140, icone: '<span class="logo fr">FR</span>' })}
      <figcaption><b>Agents FR</b><span>${agents.length} agents</span></figcaption></figure>
    <figure>${anneau(domainesPresents.map(d => ({ libelle: d, valeur: commandesParDomaine(d), couleur: varDomaine(d) })).concat([{ libelle: 'Sans agent', valeur: commandes.filter(c => c.domaine === AUTRES).length, couleur: '--neutre' }]), { taille: 140, icone: '<span class="logo slash">/</span>' })}
      <figcaption><b>Commandes</b><span>${commandes.length} commandes</span></figcaption></figure>
    <figure>${anneau([{ libelle: 'Règles vérifiées', valeur: registre ? registre.regles : 0, couleur: '--good' }, { libelle: 'À vérifier', valeur: registre ? registre.aVerifier.length : 0, couleur: '--warning' }], { taille: 140, icone: '<span class="logo reg">§</span>' })}
      <figcaption><b>Registre</b><span>${registre ? `${registre.regles} règles` : 'absent'}</span></figcaption></figure>
  </div>
  <div class="separateur"><span>CATALOGUE PAR DOMAINE</span></div>
  <div class="cat-tete"><b>${agents.length} agents</b><span>100 %</span></div>
  <div class="catalogue" id="catalogue">
    <div class="cat-etiquettes haut"></div>
    <div class="cat-barre">${domainesPresents.map(d => `<div class="seg" style="flex:${parDomaine(d)} 1 0;background:var(${varDomaine(d)})" data-lib="${esc(d)}" data-val="${parDomaine(d)}" data-couleur="${varDomaine(d)}" tabindex="0" data-tip="${esc(`${d} : ${parDomaine(d)} agent(s)`)}"></div>`).join('')}</div>
    <div class="cat-etiquettes bas"></div>
  </div>
  <ul class="cat-legende">${domainesPresents.map(d => `<li><span class="carre" style="background:var(${varDomaine(d)})"></span>${esc(d)} <b>${parDomaine(d)}</b></li>`).join('')}</ul>`, 'large');

const vueTableau = `${tuiles}<div class="rang">${installesParVous}${projets}</div><div class="rang">${sante}${couverture}</div>${croisee}`;

// ----- Vue « Agents »

const vueAgents = `
<div class="filtres">
  <input class="recherche" id="recherche" type="search" placeholder="Rechercher un agent, une commande, un sujet (devis, LinkedIn, RGPD…)" aria-label="Rechercher">
  <div class="puces-filtre" role="group" aria-label="Filtrer par domaine">
    <button class="filtre actif" data-domaine="">Tous <b>${agents.length}</b></button>
    ${domainesPresents.map(d => `<button class="filtre" data-domaine="${esc(d)}"><span class="carre" style="background:var(${varDomaine(d)})"></span>${esc(d)} <b>${parDomaine(d)}</b></button>`).join('')}
  </div>
</div>
<div class="grille">
  ${[...agents].sort((x, y) => domainesPresents.indexOf(x.domaine) - domainesPresents.indexOf(y.domaine) || x.nom.localeCompare(y.nom)).map(a => `
  <article class="agent" data-domaine="${esc(a.domaine)}" data-texte="${esc(`${a.titre} ${a.nom} ${a.description} ${a.commandes.join(' ')} ${a.domaine}`.toLowerCase())}">
    <header><span class="emoji" aria-hidden="true">${esc(a.emoji)}</span><div class="noms"><b>${esc(a.titre)}</b><code>${esc(a.nom)}</code></div></header>
    <div class="meta"><span class="carre" style="background:var(${varDomaine(a.domaine)})"></span>${esc(a.domaine)} ${badge(a.etat)}</div>
    <p>${esc(a.description)}</p>
    <footer>${a.commandes.length ? a.commandes.map(c => `<span class="puce">${esc(c)}</span>`).join('') : `<span class="puce discrete">« Utilise ${esc(a.nom)} pour… »</span>`}${APP ? `<button type="button" class="discuter" data-agent="${esc(a.nom)}">Discuter</button>` : ''}</footer>
  </article>`).join('')}
</div>
<p class="vide cache" id="aucun">Aucun agent ne correspond.</p>`;

// ----- Vue « Commandes »

const vueCommandes = carte('Commandes', `
  <p class="sous">À taper dans Claude Code, lancé depuis le dossier de l'agence (<code>cd ~/Agence && claude</code>).</p>
  <div class="defile"><table>
    <thead><tr><th>Commande</th><th>À quoi elle sert</th><th>Agent(s)</th><th>État</th></tr></thead>
    <tbody>${commandes.map(c => `<tr><td><code>${esc(c.nom)}</code><span class="indice">${esc(c.exemple)}</span></td><td>${esc(c.description)}</td><td>${c.agents.map(n => `<code>${esc(n)}</code>`).join('<br>') || '—'}</td><td>${badge(c.etat)}</td></tr>`).join('')}</tbody>
  </table></div>`, 'large');

// ----- Vue « Registre »

const maxSection = registre ? Math.max(...registre.sections.map(s => s.regles), 1) : 1;
const vueRegistre = registre ? `
<div class="rang trois">
  <section class="carte tuile"><div class="grand">${registre.regles}</div><div class="petit">règles vérifiées et sourcées</div></section>
  <section class="carte tuile"><div class="grand">${registre.aVerifier.length}</div><div class="petit">points « à vérifier »</div></section>
  <section class="carte tuile"><div class="moyen">${esc(registre.verification)}</div><div class="petit">dernière vérification${registre.relecture ? ` · relecture prévue : ${esc(registre.relecture)}` : ''}${relectureDepassee(registre.relecture) ? ' <span class="badge" style="--c:var(--warning)">↻ À relire</span>' : ''}</div></section>
</div>
${carte('Règles par thème', `
  <ul class="outils">${registre.sections.map(s => `<li><span class="lib">${esc(s.titre)}</span><span class="piste-barre"><span style="width:${Math.round((s.regles / maxSection) * 100)}%;background:var(--serie-1)"></span></span><b>${s.regles}</b></li>`).join('')}</ul>
  <p class="sous">Fichier : <code>~/.claude/agence-ia-fr/faits-dates.md</code> ${badge(registreEtat)} · lecture par les agents ${regleLecture ? 'autorisée' : 'non autorisée (Claude demandera à chaque fois)'}. <code>/veille</code> propose les mises à jour.</p>`, 'large')}
${carte('À vérifier', `<div class="defile"><table><thead><tr><th>Thème</th><th>Point</th><th>Pourquoi</th></tr></thead><tbody>${registre.aVerifier.map(v => `<tr><td>${esc(v.theme)}</td><td>${esc(v.point)}</td><td>${esc(v.raison)}</td></tr>`).join('')}</tbody></table></div>`, 'large')}`
  : carte('Registre', '<p class="vide">Registre absent : relancez <code>setup-agence.sh</code>.</p>', 'large');

// ----- Vue « Outils »

const ligneOutil = (etatTxt, couleur, titre, texte) =>
  `<li><span class="badge" style="--c:var(${couleur})">${esc(etatTxt)}</span><div><b>${titre}</b><p>${texte}</p></div></li>`;
const vueOutils = carte('Outils', `
  <ul class="liste-outils">
    ${ligneOutil(installes(agents) === agents.length ? 'À jour' : 'Incomplet', installes(agents) === agents.length ? '--good' : '--warning', 'Claude Code', `${installes(agents)} agents FR et ${installes(commandes)} commandes dans <code>~/.claude</code>. Lancez-le depuis le dossier de l'agence : <code>cd ~/Agence && claude</code>.`)}
    ${ligneOutil(registreInstalle ? 'Installé' : 'Absent', registreInstalle ? '--good' : '--critical', 'Registre des faits datés', `${registre ? registre.regles : 0} règles, vérifié le ${esc(registre ? registre.verification : '?')}. Lecture par les agents : ${regleLecture ? 'autorisée' : 'non autorisée — relancez <code>setup-agence.sh</code> pour ajouter la règle'}.`)}
    ${memoire.installe
      ? ligneOutil(memoire.actif ? 'Actif' : 'Arrêté', memoire.actif ? '--good' : '--warning', 'claude-mem (mémoire)', `${memoire.actif ? `Visionneuse : <a href="http://127.0.0.1:${memoire.port}">http://127.0.0.1:${memoire.port}</a>` : 'Démarrer : <code>npx claude-mem start</code>'}. Fournisseur : ${esc(memoire.fournisseur)}${memoire.fournisseur === 'claude' ? ' (local, consomme votre quota Claude)' : ''} · cloud ${memoire.cloud ? 'activé' : 'désactivé'} · publicités ${memoire.pubCachee ? 'masquées' : 'affichées'}. Retirer : <code>npx claude-mem uninstall</code>.`)
      : ligneOutil('Option', '--neutre', 'claude-mem (mémoire)', 'Non installé : Claude Code garde sa mémoire native et votre <code>CLAUDE.md</code>.')}
    ${ligneOutil(APP ? 'Ouverte' : iconeApp ? 'Installée' : 'Option', APP || iconeApp ? '--good' : '--neutre', 'Application Agence IA', `Discussion avec les agents et ce tableau de bord, dans sa propre fenêtre. ${iconeApp ? 'Icône dans vos Applications.' : 'Ouvrir : <code>bash ~/tools/agency-agents/agence-ia-fr/app.sh</code>.'} Discussions enregistrées dans <code>~/.claude/agence-ia-fr/discussions</code>.`)}
    ${ligneOutil(app === 'installee' ? 'Installée' : 'Option', app === 'installee' ? '--good' : '--neutre', 'Application Agency Agents', `Catalogue anglais d'origine (${app === 'installee' ? 'installée' : 'non installée'}) : elle ne connaît pas les agents <code>-fr</code>. Sur Mac : <code>brew install --cask msitarzewski/agency-agents/agency-agents</code> · <a href="https://agencyagents.app">agencyagents.app</a>.`)}
  </ul>
  <h3>Commandes utiles</h3>
  <ul class="cmds">
    <li><span>Ouvrir l'application Agence IA</span><code>bash ~/tools/agency-agents/agence-ia-fr/app.sh</code></li>
    <li><span>Mettre à jour le kit</span><code>bash ~/tools/agency-agents/agence-ia-fr/mettre-a-jour.sh</code></li>
    <li><span>Régénérer ce tableau de bord</span><code>bash ~/tools/agency-agents/agence-ia-fr/tableau-de-bord.sh</code></li>
    <li><span>Tout annuler</span><code>bash ~/tools/agency-agents/agence-ia-fr/annuler.sh</code></li>
  </ul>`, 'large');

// ----- Vue « Activité »

const vueActivite = carte('Activité', activite.length ? `
  <ol class="frise">${activite.map((a, i) => `<li><span class="puce-frise"></span><div><b>${i === activite.length - 1 ? 'Première installation' : 'Installation ou mise à jour'}</b> · ${esc(a.date)}${a.reference ? ' <span class="badge" style="--c:var(--serie-1)">sauvegarde de référence</span>' : ''}<p>${a.ajouts} fichier(s) ajouté(s) · sauvegarde <code>~/.claude/backups/${esc(a.dossier)}</code></p></div></li>`).join('')}</ol>`
  : '<p class="vide">Aucune installation enregistrée.</p>', 'large');

// ----- Page

const genere = new Date().toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
const icone = d => `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const NAV = [
  ['tableau', 'Tableau de bord', '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'],
  ['agents', 'Agents', '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9 17h6"/>'],
  ['commandes', 'Commandes', '<path d="M7 20 17 4"/>'],
  ['registre', 'Registre', '<path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 14h6M9 18h4"/>'],
  ['outils', 'Outils', '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>'],
  ['activite', 'Activité', '<path d="M3 12h4l3-8 4 16 3-8h4"/>'],
];
if (APP) NAV.unshift(['discussion', 'Discussion', '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>']);
const vueDiscussion = `
<div class="disc">
  <aside class="disc-liste" aria-label="Discussions">
    <button type="button" class="disc-nouvelle" id="disc-nouvelle">${icone('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>')}Nouvelle discussion</button>
    <input type="search" class="disc-filtre" id="disc-filtre" placeholder="Rechercher une discussion" aria-label="Rechercher une discussion">
    <nav class="disc-historique" id="disc-historique" aria-label="Historique"></nav>
  </aside>
  <section class="disc-zone">
    <header class="disc-tete">
      <label class="disc-agent"><span class="sr">Agent</span><select id="disc-agent"></select></label>
      <span class="disc-titre" id="disc-titre"></span>
      <div class="disc-actions">
        <button type="button" id="disc-exporter" title="Exporter la discussion (Markdown)" aria-label="Exporter la discussion">${icone('<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>')}</button>
        <button type="button" id="disc-supprimer" title="Supprimer la discussion" aria-label="Supprimer la discussion">${icone('<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/>')}</button>
      </div>
    </header>
    <div class="disc-banniere" id="disc-banniere" role="status" hidden></div>
    <div class="fil" id="disc-fil" aria-live="polite"></div>
    <div class="disc-bas">
      <form class="composer" id="disc-form">
        <textarea id="disc-texte" rows="1" placeholder="Écrivez votre demande…" aria-label="Votre message"></textarea>
        <div class="composer-pied">
          <label class="interrupteur" title="Sans cette option, l'agent peut lire vos fichiers et chercher sur le web, mais ne crée ni ne modifie aucun fichier.">
            <input type="checkbox" id="disc-ecriture" role="switch"><span class="glissiere" aria-hidden="true"></span>
            <span>Autoriser la création de fichiers dans <code>${esc(AGENCE_DIR.replace(HOME, '~'))}</code></span>
          </label>
          <button type="submit" id="disc-envoyer" class="envoyer" aria-label="Envoyer" title="Envoyer (Entrée)">${icone('<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>')}</button>
        </div>
      </form>
      <p class="disc-aide">Entrée pour envoyer, Maj+Entrée pour aller à la ligne, Échap pour arrêter. Réponses générées par IA : relisez-les avant de les envoyer à un client.</p>
    </div>
  </section>
</div>`;
const VUES = { ...(APP ? { discussion: vueDiscussion } : {}), tableau: vueTableau, agents: vueAgents, commandes: vueCommandes, registre: vueRegistre, outils: vueOutils, activite: vueActivite };
const donneesApp = APP ? {
  jeton,
  agence: AGENCE_DIR.replace(HOME, '~'),
  agenceEtat: agence.etat,
  agenceExiste: fs.existsSync(AGENCE_DIR),
  domaines: domainesPresents.map(d => ({ nom: d, couleur: varDomaine(d) })),
  agents: agents.map(a => ({ nom: a.nom, titre: a.titre, emoji: a.emoji, domaine: a.domaine, description: a.description, installe: a.etat !== 'manquant',
    exemples: commandes.filter(c => c.agents.includes(a.nom)).map(c => ({ commande: c.nom, description: c.description, indice: c.exemple })) })),
} : null;

const html = `<!doctype html>
<html lang="fr" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${APP ? 'Agence IA' : 'Tableau de bord de l\'agence'}</title>
<style>
:root[data-theme="dark"] {
  color-scheme: dark;
  --fond: #0d0d0d; --fenetre: #1f1f1e; --laterale: #262624; --carte: #262624; --carte-2: #2f2f2c; --piste: #34342f;
  --ink: #f0efec; --ink-2: #c3c2b7; --muted: #8f8d86; --ligne: #34342f; --anneau: rgba(255,255,255,.08);
  --serie-1: #3987e5; --serie-2: #d95926; --serie-3: #199e70; --serie-4: #c98500; --serie-5: #d55181; --serie-6: #008300; --serie-7: #9085e9; --serie-8: #2bb0cf; --serie-9: #898781;
  --good: #0ca30c; --warning: #fab219; --serious: #ec835a; --critical: #d03b3b; --neutre: #6b6a64; --rose: #e2457f; --accent: #ec835a;
}
:root[data-theme="light"] {
  color-scheme: light;
  --fond: #e9e8e4; --fenetre: #fcfcfb; --laterale: #f3f2ee; --carte: #ffffff; --carte-2: #f3f2ee; --piste: #e6e5df;
  --ink: #0b0b0b; --ink-2: #52514e; --muted: #6f6d68; --ligne: #e1e0d9; --anneau: rgba(11,11,11,.10);
  --serie-1: #2a78d6; --serie-2: #eb6834; --serie-3: #1baf7a; --serie-4: #eda100; --serie-5: #e87ba4; --serie-6: #008300; --serie-7: #6250d6; --serie-8: #0f8fae; --serie-9: #898781;
  --good: #0ca30c; --warning: #d99400; --serious: #d9652f; --critical: #d03b3b; --neutre: #a3a29b; --rose: #d63a73; --accent: #d9652f;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--fond); color: var(--ink); font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
a { color: var(--accent); }
code { font: .85em ui-monospace, SFMono-Regular, Menlo, monospace; background: var(--carte-2); padding: 1px 5px; border-radius: 5px; overflow-wrap: anywhere; }
.fenetre { max-width: 1240px; margin: 24px auto; background: var(--fenetre); border: 1px solid var(--anneau); border-radius: 14px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,.35); }
.titre { display: flex; align-items: center; gap: 14px; height: 46px; padding: 0 14px; border-bottom: 1px solid var(--anneau); background: var(--laterale); }
.feux { display: flex; gap: 8px; } .feux i { width: 12px; height: 12px; border-radius: 50%; display: block; }
.feux i:nth-child(1) { background: #ff5f57; } .feux i:nth-child(2) { background: #febc2e; } .feux i:nth-child(3) { background: #28c840; }
.nav-fleches { display: flex; gap: 6px; margin-left: 110px; }
.nav-fleches button, .boutons button { background: none; border: 0; color: var(--muted); cursor: pointer; padding: 4px; border-radius: 6px; font: inherit; }
.nav-fleches button:hover, .boutons button:hover { color: var(--ink); background: var(--carte-2); }
.titre h1 { font-size: 15px; margin: 0; font-weight: 650; }
.boutons { margin-left: auto; display: flex; gap: 2px; padding: 2px; border-radius: 8px; background: var(--carte-2); }
.boutons button { display: grid; place-items: center; }
.boutons .coeur { color: var(--rose); } .boutons .coeur svg { fill: currentColor; }
.corps { display: grid; grid-template-columns: 230px minmax(0, 1fr); min-height: 760px; }
.laterale { background: var(--laterale); border-right: 1px solid var(--anneau); padding: 16px 10px; display: flex; flex-direction: column; }
.marque { display: flex; align-items: center; gap: 10px; font-weight: 650; padding: 4px 8px 18px; }
.marque .drapeau { width: 26px; height: 26px; border-radius: 7px; display: grid; place-items: center; font-size: 15px; background: var(--carte-2); }
.laterale nav { display: grid; gap: 2px; }
.laterale nav a { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; color: var(--ink-2); text-decoration: none; }
.laterale nav a:hover { background: var(--carte-2); color: var(--ink); }
.laterale nav a[aria-current="page"] { background: var(--fond); color: var(--ink); font-weight: 600; }
.etat-bas { margin-top: auto; padding: 14px 10px 2px; border-top: 1px solid var(--anneau); color: var(--muted); font-size: 12.5px; display: flex; align-items: center; gap: 8px; }
.etat-bas i { width: 8px; height: 8px; border-radius: 50%; background: var(--good); display: block; }
main { padding: 22px; min-width: 0; }
.vue { display: none; } .vue.active { display: block; }
.rang { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-bottom: 14px; }
.rang.trois { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.carte { background: var(--carte); border: 1px solid var(--anneau); border-radius: 12px; padding: 18px 20px; min-width: 0; }
.carte.large { margin-bottom: 14px; }
.carte h2 { margin: 0 0 14px; font-size: 12.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-2); font-weight: 650; }
.carte h3 { margin: 18px 0 8px; font-size: 13px; color: var(--ink-2); }
.tuile .grand { font-size: 34px; font-weight: 700; line-height: 1.1; }
.tuile .moyen { font-size: 22px; font-weight: 700; line-height: 1.3; }
.tuile .petit { color: var(--muted); font-size: 13px; margin-top: 4px; }
.duo { display: flex; align-items: center; gap: 26px; flex-wrap: wrap; }
.anneau { position: relative; flex: none; }
.anneau svg { display: block; }
.arc { transition: opacity .15s; outline: none; }
.anneau:hover .arc { opacity: .55; } .anneau .arc:hover, .anneau .arc:focus-visible { opacity: 1; }
.anneau-centre { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; }
.anneau-centre b { font-size: 26px; line-height: 1; }
.anneau-centre span { font-size: 10px; letter-spacing: .08em; color: var(--muted); margin-top: 3px; }
.anneau-icone { position: absolute; inset: 0; display: grid; place-items: center; }
.logo { width: 54px; height: 54px; border-radius: 14px; display: grid; place-items: center; font-weight: 800; font-size: 20px; color: #fff; }
.logo.fr { background: linear-gradient(135deg, #3987e5 0 33%, #f0efec 33% 66%, #e14b4b 66%); color: #1a1a19; font-size: 17px; }
.logo.slash { background: #c4673f; font-size: 26px; }
.logo.reg { background: #0f8a52; font-size: 24px; }
.legende-arbre { list-style: none; margin: 0; padding: 0; flex: 1; min-width: 190px; display: grid; gap: 7px; }
.legende-arbre li { display: flex; align-items: center; gap: 9px; }
.legende-arbre li.niv0 { font-weight: 600; } .legende-arbre.plate li.niv0 { font-weight: 400; } .legende-arbre li.niv1 { padding-left: 14px; color: var(--ink-2); }
.legende-arbre .lib { flex: 1; min-width: 0; }
.legende-arbre b { font-variant-numeric: tabular-nums; font-weight: 600; }
.carre { width: 10px; height: 10px; border-radius: 2px; display: inline-block; flex: none; }
.projet-tete { display: flex; justify-content: space-between; gap: 10px; }
.projet-tete span { color: var(--muted); font-size: 12.5px; }
.jauge { height: 6px; border-radius: 4px; background: var(--piste); margin: 10px 0 12px; overflow: hidden; }
.jauge div { height: 100%; background: var(--rose); border-radius: 4px; }
.projet-pied { display: flex; align-items: baseline; gap: 8px; color: var(--ink-2); font-size: 13px; }
.vide { color: var(--muted); }
.outils { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
.outils li { display: grid; grid-template-columns: auto minmax(110px, 190px) 1fr auto; align-items: center; gap: 10px; }
.outils li:not(:has(.point)) { grid-template-columns: minmax(140px, 260px) 1fr auto; }
.point { width: 8px; height: 8px; border-radius: 50%; }
.piste-barre { height: 5px; border-radius: 4px; background: var(--piste); overflow: hidden; display: block; }
.piste-barre span { display: block; height: 100%; background: var(--accent); border-radius: 4px; }
.outils b { color: var(--muted); font-weight: 500; font-size: 12.5px; font-variant-numeric: tabular-nums; }
.lien { display: inline-block; margin-top: 18px; text-decoration: none; font-size: 13px; }
.conseil { margin: 14px 0 0; font-size: 12.5px; color: var(--muted); }
.anneaux { display: flex; flex-wrap: wrap; gap: 34px; }
.anneaux figure { margin: 0; display: grid; justify-items: center; gap: 8px; }
.anneaux figcaption { text-align: center; display: grid; } .anneaux figcaption span { color: var(--muted); font-size: 12.5px; }
.separateur { display: flex; align-items: center; gap: 12px; margin: 26px 0 14px; color: var(--muted); font-size: 12px; letter-spacing: .08em; }
.separateur::after { content: ""; flex: 1; height: 1px; background: var(--ligne); }
.cat-tete { display: flex; justify-content: space-between; margin-bottom: 6px; } .cat-tete span { color: var(--muted); font-size: 12px; }
.catalogue { position: relative; }
.cat-etiquettes { position: relative; }
.cat-barre { display: flex; gap: 2px; height: 34px; }
.cat-barre .seg { min-width: 4px; outline-offset: 2px; }
.cat-barre .seg:first-child { border-radius: 4px 0 0 4px; } .cat-barre .seg:last-child { border-radius: 0 4px 4px 0; }
.cat-barre .seg:hover, .cat-barre .seg:focus-visible { filter: brightness(1.15); }
.etiquette { position: absolute; white-space: nowrap; font-size: 12.5px; transform: translateX(-50%); display: flex; align-items: center; gap: 6px; }
.etiquette b { font-weight: 600; } .etiquette small { color: var(--muted); font-size: 11.5px; }
.trait { position: absolute; width: 0; border-left: 1px dashed var(--muted); opacity: .55; }
.cat-legende { list-style: none; margin: 14px 0 0; padding: 0; display: none; flex-wrap: wrap; gap: 6px 14px; font-size: 12.5px; color: var(--ink-2); }
.cat-legende li { display: flex; align-items: center; gap: 6px; }
.badge { display: inline-flex; align-items: center; gap: 4px; padding: 0 8px; border-radius: 999px; font-size: 11.5px; font-weight: 600; color: var(--c); border: 1px solid color-mix(in srgb, var(--c) 55%, transparent); white-space: nowrap; line-height: 1.7; }
.filtres { display: grid; gap: 10px; margin-bottom: 14px; }
.recherche { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--anneau); background: var(--carte); color: var(--ink); font: inherit; }
.puces-filtre { display: flex; flex-wrap: wrap; gap: 6px; }
.filtre { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--anneau); background: var(--carte); color: var(--ink-2); border-radius: 999px; padding: 4px 10px; font: inherit; font-size: 12.5px; cursor: pointer; }
.filtre b { color: var(--muted); font-weight: 500; } .filtre.actif { background: var(--carte-2); color: var(--ink); border-color: var(--muted); }
.grille { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 12px; }
.agent { background: var(--carte); border: 1px solid var(--anneau); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.agent header { display: flex; align-items: center; gap: 10px; min-width: 0; } .agent header code { font-size: 11.5px; color: var(--muted); background: none; padding: 0; }
.agent .noms { display: grid; min-width: 0; } .agent .noms b { font-size: 14px; font-weight: 650; }
.agent .emoji { font-size: 18px; }
.agent .meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; color: var(--muted); font-size: 12px; }
.agent p { margin: 0; font-size: 12.5px; color: var(--ink-2); display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.agent footer { display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; }
.puce { font: 11.5px ui-monospace, SFMono-Regular, Menlo, monospace; padding: 2px 8px; border-radius: 999px; background: var(--carte-2); }
.puce.discrete { font-family: inherit; color: var(--muted); background: transparent; border: 1px dashed var(--anneau); }
.sous { color: var(--muted); font-size: 13px; margin: -6px 0 12px; }
.defile { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { text-align: left; font-weight: 600; color: var(--muted); font-size: 11.5px; text-transform: uppercase; letter-spacing: .06em; }
th, td { padding: 9px 8px; border-bottom: 1px solid var(--ligne); vertical-align: top; }
td .indice { display: block; color: var(--muted); font-size: 11.5px; margin-top: 3px; }
.liste-outils { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; }
.liste-outils li { display: flex; gap: 12px; align-items: flex-start; }
.liste-outils li > div { min-width: 0; } .liste-outils p { margin: 2px 0 0; color: var(--ink-2); font-size: 13px; }
.cmds { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.cmds li { display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: center; } .cmds span { color: var(--ink-2); min-width: 220px; }
.frise { list-style: none; margin: 0; padding: 0; }
.frise li { display: flex; gap: 12px; padding-bottom: 16px; position: relative; }
.frise li:not(:last-child)::before { content: ""; position: absolute; left: 4px; top: 14px; bottom: 0; border-left: 1px solid var(--ligne); }
.puce-frise { width: 9px; height: 9px; border-radius: 50%; background: var(--accent); margin-top: 6px; flex: none; }
.frise p { margin: 2px 0 0; color: var(--muted); font-size: 12.5px; }
.cache { display: none !important; }
.pied { color: var(--muted); font-size: 12px; padding: 0 22px 18px; }
#bulle { position: fixed; pointer-events: none; background: var(--ink); color: var(--fond); font-size: 12px; padding: 5px 9px; border-radius: 7px; opacity: 0; transition: opacity .1s; z-index: 10; max-width: 260px; }
@media (max-width: 900px) {
  .fenetre { margin: 0; border-radius: 0; border: 0; }
  .nav-fleches { margin-left: 0; }
  .corps { grid-template-columns: minmax(0, 1fr); }
  .laterale { border-right: 0; border-bottom: 1px solid var(--anneau); padding: 10px; }
  .laterale nav { display: flex; overflow-x: auto; }
  .laterale nav a { white-space: nowrap; }
  .marque, .etat-bas { display: none; }
  .rang, .rang.trois { grid-template-columns: minmax(0, 1fr); }
  .legende-arbre { min-width: 0; flex-basis: 100%; }
  .projet-pied { font-size: 12.5px; }
  main { padding: 14px; }
}
@media (max-width: 640px) {
  .feux, .nav-fleches { display: none; }
  .cat-etiquettes { display: none; } .cat-legende { display: flex; }
  .outils li { grid-template-columns: auto 1fr auto; } .outils li .piste-barre { grid-column: 1 / -1; grid-row: 2; }
}
@media (forced-colors: active) { .seg, .arc { forced-color-adjust: none; } }
</style>
${APP ? '<link rel="stylesheet" href="/app.css">\n<link rel="icon" href="/icone.png">' : ''}
</head>
<body>
<div class="fenetre">
  <div class="titre">
    <div class="feux" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="nav-fleches"><button type="button" onclick="history.back()" aria-label="Précédent">←</button><button type="button" onclick="history.forward()" aria-label="Suivant">→</button></div>
    <h1 id="titre-vue">Tableau de bord</h1>
    <div class="boutons"><button type="button" id="theme" aria-label="Changer de thème" title="Thème clair / sombre">${icone('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>')}</button><button type="button" onclick="location.hash='#registre'" aria-label="Registre" title="Registre des faits datés">${icone('<path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5zM12 6v14"/>')}</button><button type="button" onclick="location.hash='#outils'" aria-label="Outils" title="Outils">${icone('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>')}</button><button type="button" onclick="location.hash='#agents'" aria-label="Agents" title="Agents" class="coeur">${icone('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>')}</button></div>
  </div>
  <div class="corps">
    <aside class="laterale">
      <div class="marque"><span class="drapeau" aria-hidden="true">🇫🇷</span>Agence IA</div>
      <nav aria-label="Sections">${NAV.map(([id, lib, d]) => `<a href="#${id}" data-vue="${id}">${icone(d)}${lib}</a>`).join('')}</nav>
      <div class="etat-bas"><i></i>${agents.length} agents · ${commandes.length} commandes</div>
    </aside>
    <main>${Object.entries(VUES).map(([id, contenu]) => `<div class="vue" id="vue-${id}" data-titre="${esc(NAV.find(n => n[0] === id)[1])}">${contenu}</div>`).join('')}</main>
  </div>
  <p class="pied">${APP ? `Application locale · ${esc(KIT_DIR)} · les discussions passent par Claude Code, comme dans le terminal.` : `Généré le ${esc(genere)} depuis <code>${esc(KIT_DIR)}</code> · page locale, aucune donnée envoyée.`}</p>
</div>
<div id="bulle" role="tooltip"></div>
<script>
(function () {
  var racine = document.documentElement;
  try { var t = localStorage.getItem('theme-agence'); if (t) racine.dataset.theme = t; } catch (e) {}
  document.getElementById('theme').addEventListener('click', function () {
    racine.dataset.theme = racine.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme-agence', racine.dataset.theme); } catch (e) {}
  });

  function afficher() {
    var defaut = document.getElementById('vue-discussion') ? 'discussion' : 'tableau';
    var id = (location.hash || '#' + defaut).slice(1);
    if (!document.getElementById('vue-' + id)) id = defaut;
    document.querySelectorAll('.vue').forEach(function (v) { v.classList.toggle('active', v.id === 'vue-' + id); });
    document.querySelectorAll('.laterale nav a').forEach(function (a) {
      if (a.dataset.vue === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.getElementById('titre-vue').textContent = document.getElementById('vue-' + id).dataset.titre;
    if (id === 'tableau') placerEtiquettes();
  }
  addEventListener('hashchange', afficher);

  // Étiquettes du catalogue, reliées à leur segment, placées sur la première rangée libre.
  function placerEtiquettes() {
    var cat = document.getElementById('catalogue');
    if (!cat || !cat.offsetWidth) return;
    var haut = cat.querySelector('.haut'), bas = cat.querySelector('.bas'), barre = cat.querySelector('.cat-barre');
    haut.innerHTML = ''; bas.innerHTML = '';
    var largeur = barre.offsetWidth, rang = 22, rangees = [[], [], [], [], [], []];
    var segs = barre.querySelectorAll('.seg');
    var places = [];
    segs.forEach(function (s) {
      var e = document.createElement('div');
      e.className = 'etiquette';
      e.innerHTML = '<span class="carre" style="background:var(' + s.dataset.couleur + ')"></span><b></b><small></small>';
      e.querySelector('b').textContent = s.dataset.lib;
      e.querySelector('small').textContent = s.dataset.val;
      haut.appendChild(e);
      var w = e.offsetWidth + 14, x = s.offsetLeft + s.offsetWidth / 2;
      var g = Math.min(Math.max(x, w / 2), largeur - w / 2);
      var choix = 0;
      for (var r = 0; r < rangees.length; r++) {
        var libre = rangees[r].every(function (o) { return g + w / 2 <= o[0] || g - w / 2 >= o[1]; });
        if (libre) { choix = r; break; }
        choix = r;
      }
      rangees[choix].push([g - w / 2, g + w / 2]);
      places.push({ e: e, x: x, g: g, r: choix });
    });
    var nHaut = 0, nBas = 0;
    places.forEach(function (p) { var dessus = p.r % 2 === 0, niv = Math.floor(p.r / 2) + 1; if (dessus) nHaut = Math.max(nHaut, niv); else nBas = Math.max(nBas, niv); });
    haut.style.height = (nHaut * rang + 8) + 'px'; bas.style.height = (nBas * rang + 8) + 'px';
    places.forEach(function (p) {
      var dessus = p.r % 2 === 0, niv = Math.floor(p.r / 2) + 1, conteneur = dessus ? haut : bas;
      conteneur.appendChild(p.e);
      p.e.style.left = p.g + 'px';
      var trait = document.createElement('div');
      trait.className = 'trait';
      trait.style.left = p.x + 'px';
      if (dessus) { p.e.style.top = ((nHaut - niv) * rang) + 'px'; trait.style.top = ((nHaut - niv) * rang + 18) + 'px'; trait.style.height = ((niv - 1) * rang + 6) + 'px'; }
      else { p.e.style.top = ((niv - 1) * rang + 8) + 'px'; trait.style.top = '0px'; trait.style.height = ((niv - 1) * rang + 9) + 'px'; }
      conteneur.appendChild(trait);
    });
  }
  addEventListener('resize', function () { if (document.getElementById('vue-tableau').classList.contains('active')) placerEtiquettes(); });

  var bulle = document.getElementById('bulle');
  function montrer(el, x, y) { bulle.textContent = el.getAttribute('data-tip'); bulle.style.left = Math.min(x + 12, innerWidth - 270) + 'px'; bulle.style.top = (y + 14) + 'px'; bulle.style.opacity = 1; }
  function cacher() { bulle.style.opacity = 0; }
  document.querySelectorAll('[data-tip]').forEach(function (s) {
    s.addEventListener('mousemove', function (e) { montrer(s, e.clientX, e.clientY); });
    s.addEventListener('focus', function () { var r = s.getBoundingClientRect(); montrer(s, r.left, r.bottom); });
    s.addEventListener('mouseleave', cacher); s.addEventListener('blur', cacher);
  });

  var champ = document.getElementById('recherche'), domaine = '';
  function filtrer() {
    var q = champ.value.trim().toLowerCase(), n = 0;
    document.querySelectorAll('.agent').forEach(function (a) {
      var ok = (!q || a.dataset.texte.indexOf(q) >= 0) && (!domaine || a.dataset.domaine === domaine);
      a.classList.toggle('cache', !ok); if (ok) n++;
    });
    document.getElementById('aucun').classList.toggle('cache', n > 0);
  }
  champ.addEventListener('input', filtrer);
  document.querySelectorAll('.filtre').forEach(function (b) {
    b.addEventListener('click', function () {
      domaine = b.dataset.domaine;
      document.querySelectorAll('.filtre').forEach(function (x) { x.classList.toggle('actif', x === b); });
      filtrer();
    });
  });

  afficher();
})();
</script>
${APP ? `<script>window.AGENCE = ${JSON.stringify(donneesApp).replace(/</g, '\\u003c')};</script>\n<script src="/app.js"></script>` : ''}
</body>
</html>
`;

return html;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const html = await genererPage({
    kitDir: process.argv[2] || KIT_PAR_DEFAUT,
    agenceDir: process.argv[3] || path.join(HOME, 'Agence'),
  });
  fs.mkdirSync(REF_DIR, { recursive: true });
  fs.writeFileSync(OUT, html);
  console.log(OUT);
}
