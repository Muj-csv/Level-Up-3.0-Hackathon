import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from './util.mjs';
import { ITEMS, KCOST } from './config.mjs';
import { botUsesItem, botGintoPick, botShop, botRival, passChance, pickKasamaFriend } from './bots.mjs';
import { buildBoard } from './board.mjs';

const board = buildBoard();
const N = board.N;
function ctx(extra) {
  return Object.assign({ diff: 1, round: 1, maxRound: 5, koronaSpots: [20], N, kcost: KCOST, items: ITEMS, path: board.path }, extra);
}
function player(over) {
  return Object.assign({ id: 0, pos: 0, piso: 10, korona: 0, item: null, allies: [] }, over);
}

test('Madali (diff 0) bots use an item immediately', () => {
  assert.equal(botUsesItem(player({ item: 'kendi' }), ctx({ diff: 0 })), true);
});

test('bots always use their item in the last round, regardless of difficulty', () => {
  assert.equal(botUsesItem(player({ item: 'kendi', piso: 20 }), ctx({ diff: 2, round: 5, maxRound: 5 })), true);
});

test('a bot with less than KCOST piso keeps a non-passive item', () => {
  assert.equal(botUsesItem(player({ item: 'kendi', piso: 2 }), ctx({ diff: 1 })), false);
});

test('a passive item (agimat) is never "used" via this check', () => {
  assert.equal(botUsesItem(player({ item: 'agimat', piso: 20 }), ctx({ diff: 1 })), false);
});

test('no item means no use', () => {
  assert.equal(botUsesItem(player({ item: null, piso: 20 }), ctx({ diff: 1 })), false);
});

test('passChance: Gintong dice guarantees landing within 10 steps, never beyond', () => {
  assert.equal(passChance(10, 'ginto'), 1);
  assert.equal(passChance(11, 'ginto'), 0);
});

test('botGintoPick: picks the exact distance to a korona when affordable and within reach', () => {
  const p = player({ pos: 0, piso: 10, allies: [] });
  // korona at space 7 -> distance 7, affordable (piso>=KCOST) -> pick 7
  assert.equal(botGintoPick(p, ctx({ koronaSpots: [7] })), 7);
});

test('botGintoPick: falls back to the best-value space when the korona is out of reach or unaffordable', () => {
  const p = player({ pos: 0, piso: 2, allies: [] }); // can't afford KCOST
  const pick = botGintoPick(p, ctx({ koronaSpots: [7] }));
  assert.ok(pick >= 1 && pick <= 10);
});

test('botShop: Madali (diff 0) spends freely on Dobleng dice when it can afford it', () => {
  assert.equal(botShop(player({ piso: 10 }), ctx({ diff: 0 })), 'doble');
});

test('botShop: a higher-difficulty bot keeps 10 piso in reserve for a korona (spare-based math)', () => {
  // piso exactly KCOST -> spare=0 -> can't afford anything -> 'none'
  const p = player({ piso: KCOST });
  assert.equal(botShop(p, ctx({ diff: 1, players: [p], standings: [1] })), 'none');
});

test('botShop: a bot that already has an item does not buy another', () => {
  assert.equal(botShop(player({ item: 'kendi' }), ctx({ diff: 1 })), 'none');
});

test('botRival: Madali (diff 0) picks a uniformly random rival (deterministic for a seeded rng)', () => {
  const others = [player({ id: 1, piso: 5, korona: 0 }), player({ id: 2, piso: 50, korona: 3 })];
  const rng = makeRng(123);
  const id = botRival(others, 0, rng);
  assert.ok([1, 2].includes(id));
});

test('botRival: Mahirap (diff 2) targets the leader (most korona, then most piso)', () => {
  const others = [
    player({ id: 1, piso: 5, korona: 0, item: null }),
    player({ id: 2, piso: 50, korona: 3, item: null }),
  ];
  assert.equal(botRival(others, 2, makeRng(1)), 2);
});

test('botRival: Mahirap excludes an agimat holder from the "lead" pick entirely', () => {
  const others = [
    player({ id: 1, piso: 5, korona: 0, item: null }),
    player({ id: 2, piso: 50, korona: 3, item: 'agimat' }),
  ];
  // id 2 is the real leader (3 korona) but is filtered out of the lead check
  // for holding an agimat, so id 1 is the only candidate left and wins by
  // default -- even though it's poorer and has no korona. This is a direct
  // port of the original's filter-then-sort order, not a judgment call.
  assert.equal(botRival(others, 2, makeRng(1)), 1);
});

test('botRival: Sakto (diff 1) always targets the richest by piso', () => {
  const others = [player({ id: 1, piso: 5 }), player({ id: 2, piso: 50 })];
  assert.equal(botRival(others, 1, makeRng(1)), 2);
});

test('pickKasamaFriend: avoids a friend already recruited by someone else', () => {
  const roster = [{ n: 'Lito' }, { n: 'Mayumi' }];
  const players = [player({ id: 0, allies: [{ n: 'Lito' }] })];
  const rng = makeRng(5);
  for (let i = 0; i < 20; i++) {
    assert.equal(pickKasamaFriend(rng, roster, players).n, 'Mayumi');
  }
});

test('pickKasamaFriend: falls back to the full roster if everyone is already taken', () => {
  const roster = [{ n: 'Lito' }, { n: 'Mayumi' }];
  const players = [player({ id: 0, allies: [{ n: 'Lito' }, { n: 'Mayumi' }] })];
  const rng = makeRng(5);
  assert.ok(['Lito', 'Mayumi'].includes(pickKasamaFriend(rng, roster, players).n));
});
