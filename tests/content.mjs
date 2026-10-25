// The two content files (Simpler Filipino and English PRD, L2.9): content/en.json has every id and key of
// content/fil.json and nothing else, in the same order; each question keeps its number of answers and each minigame
// its 3 rule lines; every protected term (content/terms.json) in a Filipino entry is in its English twin, spelled the
// same. No browser needed. Run: node tests/content.mjs
import fs from 'fs';
import path from 'path';
import { ROOT, check, done } from './lib.mjs';

const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const fil = read('content/fil.json'), en = read('content/en.json'), TERMS = Object.values(read('content/terms.json').terms).flat();
// a lowercase term may start a sentence with a capital; a capitalized term is a name and must match exactly
const termsIn = s => TERMS.filter(t => new RegExp('(^|[^\\p{L}])' + (t[0] === t[0].toLowerCase() ? '[' + t[0] + t[0].toUpperCase() + ']' : t[0]) + t.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^\\p{L}])', 'u').test(s));
// every string by its path; meta and the developer notes are not player text
const flat = (o, p = '', out = {}) => { if (o && typeof o === 'object') { for (const k in o) if (k !== 'note' && !(p === '' && k === 'meta')) flat(o[k], Array.isArray(o) ? `${p}[${k}]` : (p ? `${p}.${k}` : k), out); } else out[p] = o; return out; };
const F = flat(fil), E = flat(en);

check(en.meta && en.meta.language === 'en' && fil.meta.language === 'fil', 'meta.language is fil and en');
const onlyF = Object.keys(F).filter(k => !(k in E)), onlyE = Object.keys(E).filter(k => !(k in F));
check(!onlyF.length, 'every key in fil.json is in en.json', onlyF.slice(0, 5).join(', '));
check(!onlyE.length, 'en.json has no key that fil.json lacks', onlyE.slice(0, 5).join(', '));
const ids = o => [...o.trivia.map(t => t.id), ...Object.keys(o.minigames), ...o.soon.map(s => s.t)].join('|');
check(ids(fil) === ids(en), 'the questions, minigames and soon games have the same ids in the same order');
check(fil.trivia.every((t, i) => en.trivia[i].a.length === t.a.length), 'every question has the same number of answers (the right one first in both)');
check(Object.values(en.minigames).every(m => Array.isArray(m.rules) && m.rules.length === 3), 'every minigame has 3 rule lines in English');

const lost = [];
for (const k in F) if (typeof F[k] === 'string' && typeof E[k] === 'string') { const miss = termsIn(F[k]).filter(t => !termsIn(E[k]).includes(t)); if (miss.length) lost.push(`${k}: ${miss.join(', ')}`); }
check(!lost.length, 'every protected term in a Filipino entry is in the English one, spelled the same', lost.slice(0, 4).join(' | '));
const blank = Object.keys(E).filter(k => typeof F[k] === 'string' && F[k] && !E[k]);
check(!blank.length, 'no English entry is blank where Filipino has text', blank.slice(0, 5).join(', '));
done();
