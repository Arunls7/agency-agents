// app.js — discussion avec les agents dans l'application « Agence IA ».
// Servi par app/serveur.mjs avec la page du tableau de bord (window.AGENCE).
(function () {
  'use strict';
  const A = window.AGENCE;
  if (!A || !document.getElementById('vue-discussion')) return;

  const $ = id => document.getElementById(id);
  const fil = $('disc-fil'), champ = $('disc-texte'), formulaire = $('disc-form'), bouton = $('disc-envoyer');
  const choix = $('disc-agent'), ecriture = $('disc-ecriture'), historique = $('disc-historique'), filtre = $('disc-filtre');
  const banniere = $('disc-banniere');
  const BRAS_DROIT = 'specialized-chief-of-staff-fr';
  const agents = new Map(A.agents.map(a => [a.nom, a]));
  const couleurs = new Map(A.domaines.map(d => [d.nom, d.couleur]));
  const ICONE_ENVOYER = bouton.innerHTML;
  const ICONE_ARRETER = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>';

  let conversations = [];      // résumés venant du serveur
  let courante = null;         // discussion affichée (null : nouvelle discussion)
  let agentChoisi = null;
  let agenceExiste = A.agenceExiste;
  const envois = new Map();    // objet discussion -> { vue } pendant qu'un agent répond
  let suiviDistant = null;     // minuterie quand une réponse tourne côté serveur (fenêtre rechargée)

  const relire = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const stocker = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } };

  // ---------------------------------------------------------------------------
  // Outils

  function api(chemin, corps, methode) {
    return fetch(chemin, {
      method: methode || (corps ? 'POST' : 'GET'),
      headers: Object.assign({ 'X-Agence-Jeton': A.jeton }, corps ? { 'Content-Type': 'application/json' } : {}),
      body: corps ? JSON.stringify(corps) : undefined,
    });
  }
  async function apiJson(chemin, corps, methode) {
    const r = await api(chemin, corps, methode);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.erreur || `Erreur ${r.status}`);
    return j;
  }

  function h(tag, attrs, ...enfants) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'style') e.style.cssText = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of enfants.flat(Infinity)) if (c != null && c !== false && c !== '') e.append(c.nodeType ? c : String(c));
    return e;
  }
  const svg = d => { const s = document.createElement('span'); s.className = 'ico'; s.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`; return s; };
  const ICONES = {
    copier: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
    ok: '<path d="m5 12 5 5 9-10"/>',
    refaire: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    fichier: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    chercher: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    crayon: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    equipe: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 20a6.5 6.5 0 0 0-2.5-5.1"/>',
    outil: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
  };
  const OUTILS = {
    Read: ['Lecture', 'fichier'], Glob: ['Recherche de fichiers', 'chercher'], Grep: ['Recherche dans les fichiers', 'chercher'],
    WebSearch: ['Recherche web', 'web'], WebFetch: ['Page web', 'web'], Write: ['Création', 'crayon'], Edit: ['Modification', 'crayon'],
    Task: ['Délégation', 'equipe'], Agent: ['Délégation', 'equipe'],
  };

  const heure = iso => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const quand = iso => (new Date(iso).toDateString() === new Date().toDateString() ? heure(iso)
    : new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }));
  function duree(ms) {
    if (!ms) return '';
    const s = Math.round(ms / 1000);
    return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`;
  }
  function jourDe(iso) {
    const d = new Date(iso), auj = new Date();
    const j = n => new Date(auj.getFullYear(), auj.getMonth(), auj.getDate() - n).getTime();
    if (d >= j(0)) return 'Aujourd\'hui';
    if (d >= j(1)) return 'Hier';
    if (d >= j(7)) return '7 derniers jours';
    if (d >= j(30)) return '30 derniers jours';
    return 'Plus ancien';
  }
  const agentDe = nom => agents.get(nom) || { nom, titre: nom, emoji: '•', domaine: 'Autres', description: '', exemples: [], installe: true };
  const couleurDe = a => couleurs.get(a.domaine) || '--serie-8';

  // ---------------------------------------------------------------------------
  // Markdown (sous-ensemble) : le texte est échappé avant toute mise en forme.

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function enLigne(s) {
    const codes = [];
    let t = esc(s).replace(/`([^`\n]+)`/g, (m, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
    t = t.replace(/\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/g, (m, lib, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${lib}</a>`);
    t = t.replace(/(^|[\s(])(https?:\/\/[^\s<)]*[^\s<).,;:!?'])/g, (m, avant, url) => `${avant}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
    t = t.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>').replace(/__([^_\n]+?)__/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^*\w])\*([^*\s][^*\n]*?)\*(?![*\w])/g, '$1<em>$2</em>').replace(/(^|[^_\w])_([^_\s][^_\n]*?)_(?![_\w])/g, '$1<em>$2</em>');
    t = t.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
    return t.replace(/\u0000(\d+)\u0000/g, (m, i) => `<code>${codes[i]}</code>`);
  }
  const ITEM = /^(\s*)([-*+]|\d{1,3}[.)])\s+(.*)$/;
  function liste(lignes, depart) {
    let i = depart;
    function bloc(retrait) {
      const ordonnee = /\d/.test(ITEM.exec(lignes[i])[2]);
      const premier = parseInt(ITEM.exec(lignes[i])[2], 10);
      let out = ordonnee ? `<ol${premier > 1 ? ` start="${premier}"` : ''}>` : '<ul>';
      while (i < lignes.length) {
        const m = ITEM.exec(lignes[i]);
        if (!m) {
          if (!lignes[i].trim()) {
            let j = i + 1;
            while (j < lignes.length && !lignes[j].trim()) j++;
            const n = ITEM.exec(lignes[j] || '');
            if (n && n[1].length >= retrait) { i = j; continue; }
          } else if (/^\s{2,}\S/.test(lignes[i]) && out.endsWith('</li>')) {
            out = `${out.slice(0, -5)}<br>${enLigne(lignes[i].trim())}</li>`;
            i++;
            continue;
          }
          break;
        }
        const r = m[1].length;
        if (r < retrait) break;
        if (r > retrait) {
          const sous = bloc(r);
          out = out.endsWith('</li>') ? `${out.slice(0, -5)}${sous}</li>` : `${out}<li>${sous}</li>`;
          continue;
        }
        if (/\d/.test(m[2]) !== ordonnee) break;
        const tache = /^\[([ xX])\]\s+(.*)$/.exec(m[3]);
        out += tache ? `<li class="tache"><span class="case${tache[1] === ' ' ? '' : ' cochee'}" aria-hidden="true"></span>${enLigne(tache[2])}</li>` : `<li>${enLigne(m[3])}</li>`;
        i++;
      }
      return out + (ordonnee ? '</ol>' : '</ul>');
    }
    const html = bloc(ITEM.exec(lignes[i])[1].length);
    return { html, i };
  }
  function markdown(source) {
    const lignes = String(source || '').replace(/\r\n?/g, '\n').split('\n');
    let html = '', i = 0;
    const para = [];
    const vider = () => { if (para.length) { html += `<p>${para.map(enLigne).join('<br>')}</p>`; para.length = 0; } };
    const cellules = l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
    while (i < lignes.length) {
      const l = lignes[i];
      let m;
      if ((m = /^\s*(```+|~~~+)\s*([\w+#.-]*)/.exec(l))) {
        vider();
        const fin = m[1], code = [];
        i++;
        while (i < lignes.length && !lignes[i].trim().startsWith(fin)) code.push(lignes[i++]);
        i++;
        html += `<pre${m[2] ? ` data-langue="${esc(m[2])}"` : ''}><code>${esc(code.join('\n'))}</code></pre>`;
        continue;
      }
      if (!l.trim()) { vider(); i++; continue; }
      if ((m = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec(l))) {
        vider();
        const n = Math.min(m[1].length + 2, 6);
        html += `<h${n}>${enLigne(m[2])}</h${n}>`;
        i++;
        continue;
      }
      if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(l)) { vider(); html += '<hr>'; i++; continue; }
      if (/^\s*\|.*\|\s*$/.test(l) && /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(lignes[i + 1] || '')) {
        vider();
        const tete = cellules(l);
        const aligne = cellules(lignes[i + 1]).map(c => (/^:-+:$/.test(c) ? 'center' : /-:$/.test(c) ? 'right' : ''));
        const style = k => (aligne[k] ? ` style="text-align:${aligne[k]}"` : '');
        i += 2;
        const rangs = [];
        while (i < lignes.length && /^\s*\|/.test(lignes[i])) rangs.push(cellules(lignes[i++]));
        html += `<div class="md-tableau"><table><thead><tr>${tete.map((c, k) => `<th${style(k)}>${enLigne(c)}</th>`).join('')}</tr></thead>`
          + `<tbody>${rangs.map(r => `<tr>${r.map((c, k) => `<td${style(k)}>${enLigne(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
        continue;
      }
      if (/^\s*>/.test(l)) {
        vider();
        const cite = [];
        while (i < lignes.length && /^\s*>/.test(lignes[i])) cite.push(lignes[i++].replace(/^\s*>\s?/, ''));
        html += `<blockquote>${markdown(cite.join('\n'))}</blockquote>`;
        continue;
      }
      if (ITEM.test(l)) {
        vider();
        const r = liste(lignes, i);
        html += r.html;
        i = r.i;
        continue;
      }
      para.push(l.trim());
      i++;
    }
    vider();
    return html;
  }

  async function copier(texte, bouton) {
    try { await navigator.clipboard.writeText(texte); } catch (e) {
      const t = h('textarea', { style: 'position:fixed;opacity:0' }, texte);
      document.body.append(t); t.select(); document.execCommand('copy'); t.remove();
    }
    const avant = bouton.innerHTML;
    bouton.innerHTML = '';
    bouton.append(svg(ICONES.ok), 'Copié');
    setTimeout(() => { bouton.innerHTML = avant; }, 1500);
  }
  function rendreMarkdown(cible, texte) {
    cible.innerHTML = markdown(texte);
    cible.querySelectorAll('pre').forEach(pre => {
      const b = h('button', { type: 'button', class: 'copier-code', onclick: () => copier(pre.querySelector('code').textContent, b) }, svg(ICONES.copier), 'Copier');
      pre.prepend(b);
    });
  }

  // ---------------------------------------------------------------------------
  // Messages

  // Libellé d'une action ; une délégation affiche le nom court de l'agent sollicité.
  function libelleOutil(o) {
    let [lib, ico] = OUTILS[o.nom] || [o.nom, 'outil'];
    let detail = o.detail || '';
    const d = /^([a-z0-9-]+) — (.*)$/.exec(detail);
    if (ico === 'equipe' && d && agents.has(d[1])) { lib = `Délégation à ${agents.get(d[1]).titre}`; detail = d[2]; }
    return { lib, ico, detail };
  }
  function puceOutil(o) {
    const { lib, ico, detail } = libelleOutil(o);
    return h('li', { class: 'puce-outil', title: detail ? `${lib} : ${detail}` : lib }, svg(ICONES[ico]), h('b', null, lib), detail ? h('span', null, detail) : null);
  }
  function blocOutils(outils, ouvert) {
    const d = h('details', { class: 'outils-faits', open: ouvert || null });
    const resume = h('summary');
    const ul = h('ul');
    const maj = () => {
      const n = ul.children.length;
      const dernier = outils[outils.length - 1];
      resume.textContent = '';
      const l = dernier ? libelleOutil(dernier) : null;
      resume.append(svg(ICONES.outil), `${n} action${n > 1 ? 's' : ''}`, l ? h('span', null, ` · ${l.lib.toLowerCase()}${l.detail ? ` : ${l.detail}` : ''}`) : null);
    };
    outils.forEach(o => ul.append(puceOutil(o)));
    d.append(resume, ul);
    d.ajouter = o => { outils.push(o); ul.append(puceOutil(o)); maj(); d.hidden = false; };
    d.hidden = outils.length === 0;
    maj();
    return d;
  }

  function messageUtilisateur(m) {
    return h('article', { class: 'msg msg-moi' },
      h('div', { class: 'bulle' }, m.texte),
      h('div', { class: 'msg-meta' }, heure(m.date), m.ecriture ? ' · création de fichiers autorisée' : ''));
  }

  function notes(m, conv) {
    const n = [];
    if (m.refus && m.refus.length) {
      n.push(h('div', { class: 'note attention' },
        h('b', null, 'Action non autorisée. '),
        `L'agent a voulu : ${m.refus.map(r => { const l = libelleOutil(r); return `${l.lib.toLowerCase()}${l.detail ? ` ${l.detail}` : ''}`; }).join(', ')}. `,
        `Les fichiers ne peuvent être créés que dans ${A.agence}, après avoir activé « Autoriser la création de fichiers ».`));
    }
    if (m.erreur) {
      n.push(h('div', { class: 'note erreur' }, h('b', null, 'Erreur. '), m.erreur,
        conv ? h('button', { type: 'button', class: 'lien-bouton', onclick: () => reessayer(conv) }, 'Réessayer') : null));
    }
    if (m.arrete) n.push(h('div', { class: 'note' }, 'Réponse arrêtée.'));
    return n;
  }

  function enteteAgent(a, m) {
    return h('header', { class: 'msg-nom' }, h('b', null, a.titre),
      m && m.date ? h('span', null, heure(m.date) + (m.duree ? ` · ${duree(m.duree)}` : '')) : null);
  }
  const avatar = a => h('div', { class: 'avatar', style: `--c: var(${couleurDe(a)})`, 'aria-hidden': 'true' }, a.emoji);

  function messageAgent(m, conv) {
    const a = agentDe(conv.agent);
    const corps = h('div', { class: 'md' });
    rendreMarkdown(corps, m.texte || '');
    const actions = h('div', { class: 'msg-actions' });
    if (m.texte) {
      const b = h('button', { type: 'button', onclick: () => copier(m.texte, b) }, svg(ICONES.copier), 'Copier');
      actions.append(b);
    }
    return h('article', { class: 'msg msg-agent' }, avatar(a),
      h('div', { class: 'msg-corps' }, enteteAgent(a, m), blocOutils((m.outils || []).slice(), false), corps, notes(m, conv), actions));
  }

  // Réponse en cours : texte au fil de l'eau, actions, indicateur d'écriture.
  function reponseEnDirect(conv) {
    const a = agentDe(conv.agent);
    const corps = h('div', { class: 'md' });
    const attente = h('div', { class: 'attente', 'aria-label': 'L\'agent réfléchit' }, h('i'), h('i'), h('i'));
    const outils = blocOutils([], true);
    const zoneNotes = h('div');
    const actions = h('div', { class: 'msg-actions' });
    const nom = enteteAgent(a, null);
    const el = h('article', { class: 'msg msg-agent en-cours' }, avatar(a), h('div', { class: 'msg-corps' }, nom, outils, corps, attente, zoneNotes, actions));
    let texte = '', prevu = false;
    const peindre = () => {
      prevu = false;
      const bas = estEnBas();
      // Gras ou bloc de code encore ouvert pendant l'écriture : on le referme pour l'affichage.
      let affiche = texte;
      if ((affiche.match(/```/g) || []).length % 2) affiche += '\n```';
      else if ((affiche.match(/\*\*/g) || []).length % 2) affiche += '**';
      rendreMarkdown(corps, affiche);
      if (bas) defiler();
    };
    return {
      el,
      get texte() { return texte; },
      ajouterTexte(d) {
        texte += d;
        attente.hidden = true;
        if (!prevu) { prevu = true; requestAnimationFrame(peindre); }
      },
      ajouterOutil(o) { const bas = estEnBas(); outils.ajouter({ nom: o.nom, detail: o.detail }); if (bas) defiler(); },
      remplacer(t, liste) {
        texte = t || '';
        if (texte) attente.hidden = true;
        (liste || []).slice(outils.querySelectorAll('li').length).forEach(o => outils.ajouter(o));
        peindre();
      },
      terminer(m) {
        el.classList.remove('en-cours');
        attente.remove();
        outils.open = false;
        texte = m.texte != null ? m.texte : texte;
        rendreMarkdown(corps, texte);
        nom.replaceWith(enteteAgent(a, m));
        zoneNotes.replaceChildren(...notes(m, conv));
        if (texte) {
          const b = h('button', { type: 'button', onclick: () => copier(texte, b) }, svg(ICONES.copier), 'Copier');
          actions.append(b);
        }
        if (estEnBas(240)) defiler();
      },
    };
  }

  const estEnBas = (marge = 120) => fil.scrollHeight - fil.scrollTop - fil.clientHeight < marge;
  const defiler = () => { fil.scrollTop = fil.scrollHeight; };

  // ---------------------------------------------------------------------------
  // Accueil d'une nouvelle discussion

  function suggestions(a) {
    const liste = (a.exemples || [])
      .filter(e => !['/agence', '/configurer-agence'].includes(e.commande))
      .map(e => ({ titre: e.description, texte: `${e.description} : `, indice: e.indice.replace(/^\[|\]$/g, '') }));
    if (a.nom === BRAS_DROIT) {
      liste.unshift(
        { titre: 'Fais le point sur mon agence et propose-moi mes 3 priorités de la semaine', texte: 'Fais le point sur mon agence et propose-moi mes 3 priorités de la semaine.' },
        { titre: 'Je ne sais pas quel agent utiliser', texte: 'Voici ce que je veux faire : ', indice: 'décrivez votre besoin : le bras droit s\'en charge ou le confie au bon agent' },
      );
    }
    liste.push({ titre: 'Que peux-tu faire pour mon agence ?', texte: 'Présente-toi en quelques lignes : que peux-tu faire pour mon agence, et de quelles informations as-tu besoin de ma part ?' });
    return liste.slice(0, 6);
  }

  function remplir(texte) {
    champ.value = texte;
    ajuster();
    champ.focus();
    champ.setSelectionRange(texte.length, texte.length);
  }

  function carteConfiguration() {
    if (A.agenceEtat === 'pret') return null;
    const absent = A.agenceEtat === 'absent';
    return h('div', { class: 'config' },
      h('div', null,
        h('b', null, absent ? 'Présentez votre agence aux agents' : 'Terminez la fiche de votre agence'),
        h('p', null, absent
          ? `Sans fiche (${A.agence}/CLAUDE.md), les agents ne connaissent ni vos offres, ni vos prix, ni vos clients cibles. Le bras droit vous pose une dizaine de questions et l'écrit pour vous.`
          : 'Des champs sont encore vides dans votre CLAUDE.md d\'agence : le bras droit vous pose les questions manquantes.')),
      h('button', { type: 'button', class: 'bouton-principal', onclick: configurer }, absent ? 'Créer la fiche (5 min)' : 'Compléter la fiche'));
  }

  async function configurer() {
    try {
      if (!agenceExiste) { await apiJson('/api/creer-agence', {}); agenceExiste = true; ecriture.disabled = false; }
    } catch (e) { montrerBanniere(e.message, 'erreur'); return; }
    ecriture.checked = true;
    choisirAgent(BRAS_DROIT);
    envoyer('/configurer-agence', 'Fiche de l\'agence');
  }

  function accueil() {
    const a = agentDe(agentChoisi);
    const domaines = A.domaines.map(d => ({ d, liste: A.agents.filter(x => x.domaine === d.nom) })).filter(g => g.liste.length);
    return h('div', { class: 'accueil' },
      carteConfiguration(),
      h('div', { class: 'accueil-agent' },
        h('div', { class: 'accueil-avatar', style: `--c: var(${couleurDe(a)})`, 'aria-hidden': 'true' }, a.emoji),
        h('h2', null, a.titre),
        h('p', { class: 'accueil-role' }, h('span', { class: 'carre', style: `background:var(${couleurDe(a)})` }), a.domaine, ' · ', h('code', null, a.nom)),
        h('p', { class: 'accueil-desc', title: a.description }, a.description),
        a.installe ? null : h('p', { class: 'note erreur' }, 'Cet agent n\'est pas installé : relancez setup-agence.sh.')),
      h('div', { class: 'suggestions' }, suggestions(a).map(s =>
        h('button', { type: 'button', class: 'suggestion', onclick: () => remplir(s.texte) }, h('b', null, s.titre), s.indice ? h('small', null, s.indice) : null))),
      h('details', { class: 'autres', open: relire('agence-autres') === 'ouvert' || null, ontoggle: e => stocker('agence-autres', e.target.open ? 'ouvert' : 'ferme') },
        h('summary', null, 'Choisir un autre agent'),
        domaines.map(g => h('div', { class: 'autres-groupe' },
          h('span', { class: 'autres-domaine' }, h('span', { class: 'carre', style: `background:var(${g.d.couleur})` }), g.d.nom),
          h('div', { class: 'autres-liste' }, g.liste.map(x => h('button', {
            type: 'button', class: `autre${x.nom === agentChoisi ? ' actif' : ''}`, disabled: !x.installe || null,
            title: x.installe ? x.description : 'Non installé', onclick: () => choisirAgent(x.nom),
          }, h('span', { 'aria-hidden': 'true' }, x.emoji), x.titre)))))));
  }

  // ---------------------------------------------------------------------------
  // Affichage

  function remplirChoix() {
    choix.replaceChildren();
    const option = a => h('option', { value: a.nom, disabled: !a.installe || null }, `${a.emoji}  ${a.titre}${a.installe ? '' : ' (non installé)'}`);
    if (agents.has(BRAS_DROIT)) choix.append(h('optgroup', { label: 'Pour tout' }, option(agents.get(BRAS_DROIT))));
    for (const d of A.domaines) {
      const liste = A.agents.filter(a => a.domaine === d.nom && a.nom !== BRAS_DROIT);
      if (liste.length) choix.append(h('optgroup', { label: d.nom }, liste.map(option)));
    }
  }

  function majEntete() {
    const a = agentDe(agentChoisi);
    choix.value = agentChoisi;
    choix.title = a.description;
    $('disc-titre').textContent = courante && courante.id ? courante.titre : '';
    $('disc-exporter').disabled = !(courante && courante.id && courante.messages.length);
    $('disc-supprimer').disabled = !(courante && courante.id);
    majBouton();
  }

  function majBouton() {
    const actif = courante && envois.has(courante);
    const distant = courante && courante.enCours && !actif;
    bouton.classList.toggle('arreter', Boolean(actif || distant));
    bouton.innerHTML = actif || distant ? ICONE_ARRETER : ICONE_ENVOYER;
    bouton.setAttribute('aria-label', actif || distant ? 'Arrêter la réponse' : 'Envoyer');
    bouton.title = actif || distant ? 'Arrêter (Échap)' : 'Envoyer (Entrée)';
    bouton.disabled = !(actif || distant) && !champ.value.trim();
  }

  function afficherDiscussion() {
    if (suiviDistant) { clearTimeout(suiviDistant); suiviDistant = null; }
    fil.replaceChildren();
    if (!courante || !courante.messages.length) {
      fil.append(accueil());
      fil.scrollTop = 0;
    } else {
      const envoi = envois.get(courante);
      const msgs = courante.messages;
      msgs.forEach(m => fil.append(m.role === 'utilisateur' ? messageUtilisateur(m) : messageAgent(m, courante)));
      if (envoi) fil.append(envoi.vue.el);
      else if (courante.enCours) suivre(courante);
      defiler();
    }
    majEntete();
    majListe();
  }

  // Réponse qui tourne côté serveur alors que cette fenêtre ne la reçoit pas (après un rechargement).
  function suivre(conv) {
    const vue = reponseEnDirect(conv);
    vue.remplacer(conv.partiel, conv.outilsEnCours);
    fil.append(vue.el);
    const tic = async () => {
      if (courante !== conv) return;
      try {
        const c = await apiJson(`/api/conversations/${conv.id}`);
        if (courante !== conv) return;
        if (c.enCours) { vue.remplacer(c.partiel, c.outilsEnCours); suiviDistant = setTimeout(tic, 1000); return; }
        courante = c;
        afficherDiscussion();
        chargerListe();
      } catch (e) { suiviDistant = setTimeout(tic, 3000); }
    };
    suiviDistant = setTimeout(tic, 1000);
  }

  function majListe() {
    const q = filtre.value.trim().toLowerCase();
    historique.replaceChildren();
    const visibles = conversations.filter(c => !q || `${c.titre} ${agentDe(c.agent).titre}`.toLowerCase().includes(q));
    if (!visibles.length) {
      historique.append(h('p', { class: 'vide' }, conversations.length ? 'Aucune discussion ne correspond.' : 'Vos discussions apparaîtront ici.'));
      return;
    }
    let groupe = null;
    for (const c of visibles) {
      const g = jourDe(c.maj);
      if (g !== groupe) { groupe = g; historique.append(h('h3', null, g)); }
      const a = agentDe(c.agent);
      const local = [...envois.keys()].some(k => k.id === c.id);
      historique.append(h('a', {
        href: '#discussion', class: `conv${courante && courante.id === c.id ? ' active' : ''}`, 'aria-current': courante && courante.id === c.id ? 'true' : null,
        onclick: e => { e.preventDefault(); ouvrir(c.id); },
      }, h('span', { class: 'conv-emoji', 'aria-hidden': 'true' }, a.emoji),
      h('span', { class: 'conv-texte' }, h('b', null, c.titre), h('small', null, `${a.titre} · ${quand(c.maj)}`)),
      c.enCours || local ? h('span', { class: 'conv-encours', title: 'L\'agent répond' }) : null));
    }
  }

  async function chargerListe() {
    try { conversations = await apiJson('/api/conversations'); } catch (e) { return; }
    majListe();
  }

  async function ouvrir(id) {
    const locale = [...envois.keys()].find(k => k.id === id);
    if (locale) { courante = locale; agentChoisi = locale.agent; afficherDiscussion(); return; }
    try {
      const c = await apiJson(`/api/conversations/${id}`);
      courante = c;
      agentChoisi = c.agent;
      afficherDiscussion();
      champ.focus();
    } catch (e) { montrerBanniere(e.message, 'erreur'); chargerListe(); }
  }

  function nouvelle() {
    courante = null;
    afficherDiscussion();
    champ.focus();
  }

  function choisirAgent(nom) {
    if (!agents.has(nom)) return;
    agentChoisi = nom;
    stocker('agence-agent', nom);
    if (courante && courante.messages.length) courante = null; // un autre agent : nouvelle discussion
    afficherDiscussion();
    champ.focus();
  }

  // ---------------------------------------------------------------------------
  // Envoi

  async function envoyer(force, titre) {
    const texte = (typeof force === 'string' ? force : champ.value).trim();
    if (!texte) return;
    if (courante && (envois.has(courante) || courante.enCours)) return;
    const a = agentDe(courante ? courante.agent : agentChoisi);
    if (!a.installe) { montrerBanniere(`L'agent ${a.titre} n'est pas installé : relancez setup-agence.sh.`, 'erreur'); return; }
    if (typeof force !== 'string') { champ.value = ''; ajuster(); }

    const conv = courante || { id: null, agent: agentChoisi, titre: titre || texte.replace(/\s+/g, ' ').slice(0, 70), messages: [] };
    if (!courante) { courante = conv; fil.replaceChildren(); }
    const m = { role: 'utilisateur', texte, date: new Date().toISOString(), ecriture: ecriture.checked && !ecriture.disabled };
    conv.messages.push(m);
    fil.append(messageUtilisateur(m));
    const vue = reponseEnDirect(conv);
    fil.append(vue.el);
    defiler();
    envois.set(conv, { vue });
    majEntete();
    majListe();

    let fin = null;
    try {
      const r = await api('/api/message', { conversation: conv.id, agent: conv.agent, texte, ecriture: m.ecriture, titre });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.erreur || `Erreur ${r.status}`); }
      const lecteur = r.body.getReader();
      const dec = new TextDecoder();
      let tampon = '';
      const traiter = ev => {
        if (ev.t === 'conversation') {
          const nouveau = !conv.id;
          conv.id = ev.conversation.id;
          conv.titre = ev.conversation.titre;
          if (nouveau) chargerListe();
          if (courante === conv) majEntete();
        } else if (ev.t === 'texte') vue.ajouterTexte(ev.d);
        else if (ev.t === 'outil') vue.ajouterOutil(ev);
        else if (ev.t === 'fin') fin = ev.message;
      };
      for (;;) {
        const { value, done } = await lecteur.read();
        if (done) break;
        tampon += dec.decode(value, { stream: true });
        let k;
        while ((k = tampon.indexOf('\n')) >= 0) {
          const ligne = tampon.slice(0, k);
          tampon = tampon.slice(k + 1);
          if (ligne.trim()) { try { traiter(JSON.parse(ligne)); } catch (e) { /* ligne incomplète */ } }
        }
      }
      if (!fin) throw new Error('La connexion avec l\'application a été coupée avant la fin de la réponse.');
    } catch (e) {
      fin = { role: 'agent', texte: vue.texte, outils: [], date: new Date().toISOString(), erreur: e.message };
    }
    conv.messages.push(fin);
    envois.delete(conv);
    vue.terminer(fin);
    if (courante === conv) { majEntete(); if (!conv.id) courante = null; }
    chargerListe();
    majEtat();
  }

  function reessayer(conv) {
    const dernier = [...conv.messages].reverse().find(m => m.role === 'utilisateur');
    if (dernier) envoyer(dernier.texte);
  }

  async function arreter() {
    if (!courante || !courante.id) return;
    try { await apiJson('/api/arreter', { conversation: courante.id }); } catch (e) { montrerBanniere(e.message, 'erreur'); }
  }

  // ---------------------------------------------------------------------------
  // Export, suppression, bannière, battement de cœur

  function exporter() {
    if (!courante || !courante.messages.length) return;
    const a = agentDe(courante.agent);
    const lignes = [`# ${courante.titre}`, '', `Agent : ${a.titre} (\`${a.nom}\`)`, ''];
    for (const m of courante.messages) {
      const quand = new Date(m.date).toLocaleString('fr-FR');
      lignes.push(`## ${m.role === 'utilisateur' ? 'Moi' : a.titre} · ${quand}`, '', m.texte || (m.erreur ? `_Erreur : ${m.erreur}_` : ''), '');
    }
    const nom = courante.titre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'discussion';
    const lien = h('a', { href: URL.createObjectURL(new Blob([lignes.join('\n')], { type: 'text/markdown' })), download: `${nom}.md` });
    document.body.append(lien);
    lien.click();
    setTimeout(() => { URL.revokeObjectURL(lien.href); lien.remove(); }, 1000);
  }

  async function supprimer() {
    if (!courante || !courante.id) return;
    if (!confirm(`Supprimer la discussion « ${courante.titre} » ? Elle sera effacée de cet ordinateur.`)) return;
    try {
      await apiJson(`/api/conversations/${courante.id}`, null, 'DELETE');
      courante = null;
      afficherDiscussion();
      chargerListe();
    } catch (e) { montrerBanniere(e.message, 'erreur'); }
  }

  function montrerBanniere(texte, type) {
    banniere.className = `disc-banniere ${type || ''}`;
    banniere.textContent = texte;
    banniere.hidden = !texte;
  }

  // État de l'installation : Claude Code présent, fiche de l'agence remplie ou non.
  async function majEtat(demarrage) {
    try {
      const e = await apiJson('/api/etat');
      A.agenceEtat = e.agenceEtat;
      if (e.agenceExiste && !agenceExiste) { agenceExiste = true; ecriture.disabled = false; ecriture.closest('label').removeAttribute('data-bloque'); }
      if (demarrage && !e.claude) montrerBanniere('Claude Code est introuvable : les agents ne peuvent pas répondre. Relancez setup-agence.sh, ou indiquez CLAUDE_BIN dans ~/.claude/agence-ia-fr/app.conf.', 'erreur');
    } catch (e) { /* le battement de cœur signalera l'arrêt */ }
  }

  let echecs = 0;
  async function battement() {
    try {
      await apiJson('/api/battement', {});
      if (echecs >= 2) montrerBanniere('');
      echecs = 0;
    } catch (e) {
      echecs++;
      if (echecs >= 2) montrerBanniere('L\'application s\'est arrêtée. Fermez cette fenêtre, puis rouvrez « Agence IA ».', 'erreur');
    }
  }

  // ---------------------------------------------------------------------------
  // Événements

  function ajuster() {
    champ.style.height = 'auto';
    champ.style.height = `${Math.min(champ.scrollHeight, Math.round(innerHeight * 0.4))}px`;
    majBouton();
  }
  champ.addEventListener('input', ajuster);
  champ.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); envoyer(); }
  });
  formulaire.addEventListener('submit', e => {
    e.preventDefault();
    if (bouton.classList.contains('arreter')) arreter(); else envoyer();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && bouton.classList.contains('arreter') && document.getElementById('vue-discussion').classList.contains('active')) arreter();
  });
  choix.addEventListener('change', () => choisirAgent(choix.value));
  $('disc-nouvelle').addEventListener('click', nouvelle);
  $('disc-exporter').addEventListener('click', exporter);
  $('disc-supprimer').addEventListener('click', supprimer);
  filtre.addEventListener('input', majListe);
  document.querySelectorAll('.discuter').forEach(b => b.addEventListener('click', () => {
    location.hash = '#discussion';
    courante = null;
    choisirAgent(b.dataset.agent);
  }));

  // ---------------------------------------------------------------------------
  // Démarrage

  // Barre de navigation compacte (icônes) pendant la discussion : le nom reste en info-bulle.
  document.querySelectorAll('.laterale nav a').forEach(a => { a.title = a.textContent.trim(); });
  remplirChoix();
  const memorise = relire('agence-agent');
  agentChoisi = [memorise, BRAS_DROIT, ...A.agents.map(a => a.nom)].find(n => n && agents.has(n) && agents.get(n).installe) || A.agents[0].nom;
  if (!agenceExiste) {
    ecriture.disabled = true;
    ecriture.closest('label').setAttribute('data-bloque', '');
    ecriture.closest('label').title = `Le dossier ${A.agence} n'existe pas encore : créez la fiche de l'agence pour l'activer.`;
  }
  afficherDiscussion();
  chargerListe();
  majEtat(true);
  setInterval(battement, 30000);
  if (document.getElementById('vue-discussion').classList.contains('active')) champ.focus();
})();
