// Text inventory for the Simpler Filipino and English work (PRD L0.5): lists every piece of player-facing text, so the
// rewrite (Phase 1) and the move into the content files (Phase 3) can be sized and checked. Three sources:
// content/fil.json, the built-in fallbacks in index.html's MG table, and the Filipino still written in index.html
// (strings in the script, text in the page markup). Protected terms (content/terms.json) are marked.
// Writes docs/TEXT_INVENTORY.md. Run: node tools/text-scan.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const content = JSON.parse(read('content/fil.json')), terms = JSON.parse(read('content/terms.json')).terms;
const TERMS = Object.values(terms).flat();
const html = read('index.html').split('\n');

// words that only Filipino text has; a string with one of them (or an ñ) is Filipino
const FW = new Set(('ang ng mga sa si ni ay at ito iyan iyon para kung hindi wala may ka mo ko ikaw ako tayo kayo sila nila natin ating namin kami ' +
  'po lang pa din rin naman pag kapag habang tapos kaya ba nang dito doon muna sige tuloy bawat lahat isa dalawa tatlo apat lima ' +
  'na nasa yung iyong niya kanya kanila sino ano saan kailan bakit paano ilan mas pinaka huwag oo bago ulit agad ngayon dapat ' +
  'puwede pwede kailangan gusto alam laro maglaro naglalaro manlalaro kalaro ikot panalo talo turn tira takbo balik bumalik umalis ' +
  'bukas sarado hinihintay naputol sumali gumawa simulan buong bagong larong lumukso tumalon sabay tig').split(' '));
const isFil = s => s.toLowerCase().split(/[^a-zñáéíóú'-]+/).some(w => FW.has(w)) || /ñ/i.test(s);
const termsIn = s => TERMS.filter(t => new RegExp('(^|[^\\p{L}])' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^\\p{L}])', 'u').test(s));

// a piece of text, not code: letters, and not an identifier, selector, CSS value, font, path or URL
function isText(s) {
  if ((s.match(/\p{L}/gu) || []).length < 2) return false;
  if (/[{};=<>]|=>|\$\{|^\s*\d+\s*(px|%)|rgba?\(|var\(--|https?:|\.(js|json|png|jpg|woff2|md)\b|^\d{3} \d|^#[0-9a-f]{3,8}$/i.test(s)) return false;
  if (!/\s/.test(s) && !/^[A-ZÑ][\p{Ll}'-]+[!?.…:]?$/u.test(s)) return false;   // one lowercase word or camelCase is code
  return true;
}

// ---------- index.html: section headers, the MG block, strings in the script, text in the markup ----------
const scriptAt = html.findIndex(l => /^<script>\s*$/.test(l)), mgAt = html.findIndex(l => /^const MG=\{/.test(l)), mgEnd = html.findIndex(l => /^const MG_KEYS=/.test(l));
const LIT = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\\n]|\\.)*)`/g;
const pieces = s => s.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, ' ').split(/<[^>]*>|\$\{[^}]*\}/).map(x => x.trim()).filter(Boolean);
const sections = [], mg = [];
let sec = { name: 'Page markup (HTML before the script)', items: new Map() }; sections.push(sec);
let inStyle = false, inCom = false;
// code comments hold apostrophes ("island's") that would read as strings: blank them out first
const noComments = l => { let s = l;
  if (inCom) { const e = s.indexOf('*/'); if (e < 0) return ''; s = s.slice(e + 2); inCom = false; }
  s = s.replace(/\/\*.*?\*\//g, ''); const b = s.indexOf('/*'); if (b >= 0) { s = s.slice(0, b); inCom = true; }
  return s.replace(/(^|[\s;{}),])\/\/.*$/, '$1'); };
html.forEach((raw, i) => {
  const n = i + 1, line = i >= scriptAt ? noComments(raw) : raw;
  if (i < scriptAt) {
    if (/<style/.test(line)) inStyle = true; if (inStyle) { if (/<\/style>/.test(line)) inStyle = false; return; }
    const found = [...line.matchAll(/(?:aria-label|title|placeholder|alt)="([^"]*)"/g)].map(m => m[1]).concat(line.replace(/<[^>]*>/g, '\n').split('\n'));
    for (const t of found.map(x => x.trim())) if (isText(t) && isFil(t)) add(sec, t, n);
    return;
  }
  const h = /\/\* =+ ([^=]+?) =+/.exec(raw);
  if (h) { sec = { name: h[1].replace(/:.*$/, '').trim(), items: new Map() }; sections.push(sec); }
  const target = i >= mgAt && i < mgEnd ? null : sec;
  for (const m of line.matchAll(LIT)) for (const t of pieces(m[1] ?? m[2] ?? m[3])) if (isText(t) && (isFil(t) || termsIn(t).length && /\s/.test(t))) {
    if (target) add(target, t, n); else mg.push({ n, t });
  }
});
function add(s, t, n) { const e = s.items.get(t); if (e) e.lines.push(n); else s.items.set(t, { lines: [n] }); }

// ---------- content/fil.json ----------
const rows = [];
const skip = /^(id|reviewed_by|reviewed_at|triviaIds|name)$/;
const walk = (o, p) => { if (typeof o === 'string') rows.push({ key: p, t: o }); else if (Array.isArray(o)) o.forEach((v, i) => walk(v, `${p}[${i}]`)); else if (o && typeof o === 'object') for (const k in o) if (!skip.test(k)) walk(o[k], p ? `${p}.${k}` : k); };
walk({ trivia: content.trivia.map(q => ({ ...q, id: undefined })) }, '');
content.trivia.forEach((q, i) => rows.filter(r => r.key.startsWith(`trivia[${i}]`)).forEach(r => { r.key = r.key.replace(`trivia[${i}]`, `trivia.${q.id}`); }));
walk({ minigames: content.minigames, soon: content.soon }, '');
const nick = content.nicknames || {}, nickCount = Object.values(nick).filter(Array.isArray).reduce((s, a) => s + a.length, 0);

// ---------- the report ----------
const esc = s => s.replace(/\|/g, '\\|');
const fil = sections.reduce((s, x) => s + x.items.size, 0);
const out = [];
out.push('# Text inventory (Simpler Filipino and English, Phase 0)', '',
  `Generated by \`node tools/text-scan.mjs\` on ${new Date().toISOString().slice(0, 10)} from \`lang/testing\`. Run it again after a`,
  'change: the counts size Phase 1 (rewrite) and Phase 3 (move into the content files). It finds the text that reads as',
  'Filipino (common Filipino words), so a few English-only labels and one-word buttons may be missing; add them by hand',
  'when a phase reaches them. **Protected terms** (`content/terms.json`) inside an entry are listed in its last column;',
  'a rewrite keeps every one of them, spelled the same. Some `index.html` entries are pieces of one sentence joined around a',
  'name or number in the code ("Nag-iisip si " + name): rewrite them as a whole sentence, and in Phase 3 they become one',
  'string with placeholders (`t("board.thinking", {name})`).', '',
  '## Counts', '',
  '| Source | Strings | Phase |', '|---|---|---|',
  `| \`content/fil.json\`: Tanong ni Lola (${content.trivia.length} questions: question, 3 answers, fact) | ${rows.filter(r => r.key.startsWith('trivia')).length} | 1 (Filipino), 2 (English) |`,
  `| \`content/fil.json\`: minigames (${Object.keys(content.minigames).length}: title, aka, chip, unit, Subukan sa labas, 3 rules, Sa totoong kalye) | ${rows.filter(r => r.key.startsWith('minigames')).length} | 1, 2 |`,
  `| \`content/fil.json\`: "soon" games | ${rows.filter(r => r.key.startsWith('soon')).length} | 1, 2 |`,
  `| \`content/fil.json\`: island trivia links (ids only, no text) | 0 | none |`,
  `| \`content/fil.json\`: nickname word lists (F8.1, reviewed separately in \`docs/NICKNAME_WORDLIST_REVIEW.md\`) | ${nickCount} words | not in this PRD: words, not sentences |`,
  `| \`index.html\`: built-in fallbacks in \`MG\` (same text as the content file, used when it doesn't load) | ${mg.length} | 1 (keep the same as the content file) |`,
  `| \`index.html\`: other Filipino text (by section below) | ${fil} | 1 (board messages, items, How to Play, tips), 3 (all of it) |`, '');
out.push('## `index.html`: Filipino text by section', '',
  'Line numbers are for this commit; the same string on several lines is listed once.', '');
for (const s of sections) if (s.items.size) {
  out.push(`### ${s.name} (${s.items.size})`, '', '| Lines | Text | Protected terms |', '|---|---|---|');
  for (const [t, e] of s.items) out.push(`| ${e.lines.slice(0, 4).join(', ')}${e.lines.length > 4 ? ', …' : ''} | ${esc(t)} | ${termsIn(t).join(', ')} |`);
  out.push('');
}
out.push('## `content/fil.json`', '', '| Key | Text | Protected terms |', '|---|---|---|');
for (const r of rows) out.push(`| \`${r.key}\` | ${esc(r.t)} | ${termsIn(r.t).join(', ')} |`);
out.push('', '## `index.html`: built-in `MG` fallbacks', '',
  `Lines ${mgAt + 1}–${mgEnd}. These repeat the minigame text in \`content/fil.json\` (title, aka, chip, unit, rules, real, labas) so the`,
  'game reads the same when the content file fails to load. Phase 1 rewrites them together with the content file.', '',
  '| Line | Text |', '|---|---|');
for (const r of mg) out.push(`| ${r.n} | ${esc(r.t)} |`);
fs.writeFileSync(path.join(ROOT, 'docs/TEXT_INVENTORY.md'), out.join('\n') + '\n');
console.log(`content/fil.json ${rows.length} strings, MG fallbacks ${mg.length}, index.html ${fil} Filipino strings in ${sections.filter(s => s.items.size).length} sections; nicknames ${nickCount} words`);
