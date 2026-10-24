import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBoard } from './board.mjs';

// These exact numbers were confirmed against the live game (N=37, 9 space
// types, per README.md's "4 islands, 37 spaces, 9 space types, 4 bridges").
// If this ever drifts from the real index.html, that's a sign the board
// geometry changed there and this draft needs re-syncing, not that the test
// is wrong.
test('default board matches the live game: 37 spaces, 9 space types', () => {
  const b = buildBoard();
  assert.equal(b.N, 37);
  assert.equal(b.path.length, 37);
  const types = new Set(b.path.map((s) => s.type));
  assert.equal(types.size, 9);
});

test('space 0 is always "start"', () => {
  const b = buildBoard();
  assert.equal(b.path[0].type, 'start');
});

test('every space has a type assigned', () => {
  const b = buildBoard();
  assert.ok(b.path.every((s) => typeof s.type === 'string' && s.type.length > 0));
});

test('korona candidates are only piso/kasama/tanong spaces on an island, past the skip zone', () => {
  const b = buildBoard();
  assert.ok(b.koronaCandidates.length > 0);
  for (const i of b.koronaCandidates) {
    const s = b.path[i];
    assert.ok(i >= 4, `candidate ${i} is inside the skip-first-4 zone`);
    assert.notEqual(s.isl, undefined, `candidate ${i} is on a bridge, not an island`);
    assert.ok(['piso', 'kasama', 'tanong'].includes(s.type));
  }
});

test('buildBoard generalises past 4 islands (no crash, every space typed)', () => {
  const fiveIslands = [
    { id: 0, name: 'A', x: 0, y: 0, rx: 200, ry: 150, seed: 1 },
    { id: 1, name: 'B', x: 500, y: 0, rx: 200, ry: 150, seed: 2 },
    { id: 2, name: 'C', x: 800, y: 400, rx: 200, ry: 150, seed: 3 },
    { id: 3, name: 'D', x: 400, y: 700, rx: 200, ry: 150, seed: 4 },
    { id: 4, name: 'E', x: 0, y: 400, rx: 200, ry: 150, seed: 5 },
  ];
  const simplePat = ['piso', 'utang'];
  const b = buildBoard({
    islands: fiveIslands,
    islandPatterns: fiveIslands.map(() => simplePat),
    bridgePatterns: fiveIslands.map(() => simplePat),
  });
  assert.ok(b.N > 0);
  assert.ok(b.path.every((s) => s.type));
});
