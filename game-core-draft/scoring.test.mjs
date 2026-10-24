import { test } from 'node:test';
import assert from 'node:assert/strict';
import { koronaDist, standings, rankPay, bonusList } from './scoring.mjs';

test('koronaDist: distance wraps around the board', () => {
  assert.equal(koronaDist(0, [5], 37), 5);
  assert.equal(koronaDist(35, [2], 37), 4); // 35 -> 36 -> 0 -> 1 -> 2
  assert.equal(koronaDist(5, [5], 37), 37); // standing on it: "a full lap away" (0 || N)
  assert.equal(koronaDist(0, [5, 30], 37), 5); // nearest of several
});

test('standings: most korona wins, piso breaks ties, equal pairs share a rank', () => {
  const players = [
    { id: 0, korona: 2, piso: 10 },
    { id: 1, korona: 2, piso: 5 },
    { id: 2, korona: 1, piso: 99 },
    { id: 3, korona: 0, piso: 0 },
  ];
  assert.deepEqual(standings(players), [1, 2, 3, 4]);
});

test('standings: a full tie puts everyone at rank 1', () => {
  const players = [{ id: 0, korona: 1, piso: 1 }, { id: 1, korona: 1, piso: 1 }];
  assert.deepEqual(standings(players), [1, 1]);
});

test('rankPay: 10/5/3/0 payout, no ties', () => {
  const { pay, rank, order } = rankPay([30, 10, 20, 0]);
  assert.deepEqual(pay, [10, 3, 5, 0]);
  assert.deepEqual(rank, [0, 2, 1, 3]);
  assert.deepEqual(order, [0, 2, 1, 3]);
});

test('rankPay: a tie for first shares the top payout, next rank skips down', () => {
  const { pay, rank } = rankPay([10, 10, 5, 0]);
  assert.equal(pay[0], 10);
  assert.equal(pay[1], 10);
  assert.equal(rank[0], 0);
  assert.equal(rank[1], 0);
  assert.equal(rank[2], 2); // third place, not second, since two players tied for first
  assert.equal(pay[2], 3);
});

test('rankPay: works for fewer than 4 players too', () => {
  const { pay } = rankPay([5, 5]);
  assert.deepEqual(pay, [10, 10]);
});

function mkPlayer(id, { wins = 0, piso = 0, dice = 0, dn = 0 } = {}) {
  return { id, piso, stats: { wins, dice, dn } };
}

test('bonusList: awards go to the real standout, not when everyone ties', () => {
  const players = [mkPlayer(0, { wins: 3 }), mkPlayer(1, { wins: 1 }), mkPlayer(2, { wins: 1 })];
  const list = bonusList(players);
  const hari = list.find((b) => b.name === 'Hari ng Laro');
  assert.ok(hari);
  assert.deepEqual(hari.winners, [0]);
});

test('bonusList: skips a bonus if every player ties for it', () => {
  const players = [mkPlayer(0, { wins: 2 }), mkPlayer(1, { wins: 2 })];
  const list = bonusList(players);
  assert.equal(list.find((b) => b.name === 'Hari ng Laro'), undefined);
});

test('bonusList: skips Hari ng Laro entirely when nobody has won a minigame', () => {
  const players = [mkPlayer(0, { wins: 0 }), mkPlayer(1, { wins: 0, piso: 5 })];
  const list = bonusList(players);
  assert.equal(list.find((b) => b.name === 'Hari ng Laro'), undefined);
});

test('bonusList: skips Malas sa Dice for a player who never rolled (dn=0 sentinel)', () => {
  const players = [mkPlayer(0, { dice: 0, dn: 0 }), mkPlayer(1, { dice: 0, dn: 0 })];
  const list = bonusList(players);
  assert.equal(list.find((b) => b.name === 'Malas sa Dice'), undefined);
});
