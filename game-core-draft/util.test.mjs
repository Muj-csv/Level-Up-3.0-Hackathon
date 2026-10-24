import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng, pick, clamp, lerp } from './util.mjs';

test('makeRng: same seed produces the same sequence', () => {
  const a = makeRng(42);
  const b = makeRng(42);
  const seqA = [a(), a(), a()];
  const seqB = [b(), b(), b()];
  assert.deepEqual(seqA, seqB);
});

test('makeRng: different seeds diverge', () => {
  const a = makeRng(1);
  const b = makeRng(2);
  assert.notEqual(a(), b());
});

test('makeRng: stays in [0, 1)', () => {
  const rng = makeRng(7);
  for (let i = 0; i < 500; i++) {
    const v = rng();
    assert.ok(v >= 0 && v < 1, `out of range: ${v}`);
  }
});

test('pick: only returns elements from the array, deterministically for a seeded rng', () => {
  const arr = ['a', 'b', 'c', 'd'];
  const rng = makeRng(99);
  for (let i = 0; i < 50; i++) assert.ok(arr.includes(pick(rng, arr)));
});

test('clamp / lerp basics', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-5, 0, 10), 0);
  assert.equal(clamp(50, 0, 10), 10);
  assert.equal(lerp(0, 10, 0.5), 5);
});
