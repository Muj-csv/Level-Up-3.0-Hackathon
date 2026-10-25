// Phase 1 check (Simpler Filipino and English PRD): compares the rewritten text with the Phase 0 copy on a git ref.
//  - content/fil.json keeps every id and key, and 3 rule lines per minigame (L1.2)
//  - every protected term (content/terms.json) in an old entry is still in the new one, spelled the same; a capital
//    first letter at the start of a sentence counts as the same spelling
//  - no word from the Section 2 swap list is left in content/fil.json or index.html
// Run: node tools/text-check.mjs [ref]   (ref defaults to lang/testing; exits 1 on any problem)
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), REF = process.argv[2] || 'lang/testing';
// line endings differ between git (LF) and a Windows working copy (CRLF), so both are read as LF
const lf = s => s.split('\r\n').join('\n');
const now = f => lf(fs.readFileSync(path.join(ROOT, f), 'utf8')), then = f => lf(execFileSync('git', ['show', `${REF}:${f}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 }));
const TERMS = Object.values(JSON.parse(now('content/terms.json')).terms).flat();
const SWAP = /\b(koponan|manlalaro|antas|kalahok|ideklara|idineklara|sumasagi|pinababagsak|sasalag\w*|sinalag|upang|subalit)\b/gi;
const termsIn = s => TERMS.filter(t => new RegExp('(^|[^\\p{L}])(' + t[0].toUpperCase() + '|' + t[0].toLowerCase() + ')' + t.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^\\p{L}])', 'u').test(s));
const problems = [];

// content/fil.json: same keys, 3 rules each, protected terms kept per entry
const flat = (o, p = '', out = {}) => { if (typeof o === 'string') out[p] = o; else if (o && typeof o === 'object') for (const k in o) flat(o[k], Array.isArray(o) ? `${p}[${k}]` : (p ? `${p}.${k}` : k), out); return out; };
const A = JSON.parse(then('content/fil.json')), B = JSON.parse(now('content/fil.json')), fa = flat(A), fb = flat(B);
for (const k in fa) if (!(k in fb)) problems.push(`content/fil.json: key removed: ${k}`);
for (const k in fb) if (!(k in fa)) problems.push(`content/fil.json: key added: ${k}`);
for (const [k, m] of Object.entries(B.minigames || {})) if (!Array.isArray(m.rules) || m.rules.length !== 3) problems.push(`content/fil.json: minigames.${k}.rules has ${m.rules && m.rules.length} lines, not 3`);
let changed = 0;
for (const k in fa) if (k in fb && fa[k] !== fb[k]) { changed++; const lost = termsIn(fa[k]).filter(t => !termsIn(fb[k]).includes(t)); if (lost.length) problems.push(`content/fil.json ${k}: protected term(s) lost: ${lost.join(', ')}`); }

// index.html: the rewrite keeps the line structure, so lines are compared one to one
const la = then('index.html').split('\n'), lb = now('index.html').split('\n');
let changedLines = 0;
if (la.length !== lb.length) problems.push(`index.html: line count changed (${la.length} -> ${lb.length}); compare by hand`);
else la.forEach((l, i) => { if (l !== lb[i]) { changedLines++; const lost = termsIn(l).filter(t => !termsIn(lb[i]).includes(t)); if (lost.length) problems.push(`index.html line ${i + 1}: protected term(s) lost: ${lost.join(', ')}`); } });

// the swap list
for (const f of ['content/fil.json', 'index.html']) now(f).split('\n').forEach((l, i) => { for (const m of l.matchAll(SWAP)) problems.push(`${f} line ${i + 1}: swap-list word "${m[0]}"`); });

console.log(`compared with ${REF}: ${changed} content entries and ${changedLines} index.html lines changed`);
for (const p of problems) console.log('PROBLEM ' + p);
console.log(problems.length ? `${problems.length} problem(s)` : 'OK: keys, rule lines and protected terms kept; no swap-list words');
process.exitCode = problems.length ? 1 : 0;
