import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolve, transferAmount, HANDKEYS, BEATS } from './jackenpoy.mjs';

test('resolve: every hand beats exactly one other and loses to exactly one other', () => {
  for (const a of HANDKEYS) {
    const beats = HANDKEYS.filter((b) => resolve(a, b) === 1);
    const losesTo = HANDKEYS.filter((b) => resolve(a, b) === -1);
    const ties = HANDKEYS.filter((b) => resolve(a, b) === 0);
    assert.equal(beats.length, 1, `${a} should beat exactly one hand`);
    assert.equal(losesTo.length, 1, `${a} should lose to exactly one hand`);
    assert.equal(ties.length, 1, `${a} should tie with itself`);
    assert.equal(ties[0], a);
  }
});

test('resolve: matches the stated rule (bato > gunting > papel > bato)', () => {
  assert.equal(resolve('bato', 'gunting'), 1);
  assert.equal(resolve('gunting', 'papel'), 1);
  assert.equal(resolve('papel', 'bato'), 1);
  assert.equal(resolve('gunting', 'bato'), -1);
});

test('resolve: an invalid hand falls back to "bato"', () => {
  assert.equal(resolve('nonsense', 'papel'), -1); // bato loses to papel
  assert.equal(resolve('bato', 'nonsense'), 0); // both fall back to bato -> tie
});

test('BEATS table is exactly the three-way cycle', () => {
  assert.deepEqual(BEATS, { bato: 'gunting', gunting: 'papel', papel: 'bato' });
});

test('transferAmount: caps at 5, or at whatever the loser actually has', () => {
  assert.equal(transferAmount(100), 5);
  assert.equal(transferAmount(5), 5);
  assert.equal(transferAmount(3), 3);
  assert.equal(transferAmount(0), 0);
});
