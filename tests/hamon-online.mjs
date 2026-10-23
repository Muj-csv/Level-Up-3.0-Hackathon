// F9.3 play-test: online Hamon ng Araw scores, through tests/mock-supabase.js.
// HAMON_ONLINE is off by default in the real game (see index.html's comment on it) --
// this test turns it on via window.LSU_HAMON_ONLINE to exercise the feature itself.
// Run: node tests/hamon-online.mjs
import path from 'path';
import { chromium, serve, watchErrors, check, done, ROOT } from './lib.mjs';

const srv = await serve();
const browser = await chromium();
const ctx = await browser.newContext();
await ctx.addInitScript(() => {
  window.LSU_SUPA = { url: 'https://mock.supabase.co', key: 'mock-anon-key' };
  window.LSU_HAMON_ONLINE = true;
});
await ctx.route('**/vendor/supabase-*.js', (r) =>
  r.fulfill({ path: path.join(ROOT, 'tests/mock-supabase.js'), contentType: 'text/javascript' }),
);

const page = await ctx.newPage();
const errs = watchErrors(page, 'page');
await page.goto(srv.url + '?debug');
await page.waitForTimeout(800);

check(
  await page.evaluate(() => window.__lsu.hamon.on === true),
  'HAMON_ONLINE is on in this test (off by default in the real game)',
);

const day = await page.evaluate(() => window.__lsu.hamon.dayKey());
const kind = await page.evaluate(() => window.__lsu.hamon.dailyKind());

const emptyTop = await page.evaluate(
  ({ day, kind }) => window.__lsu.hamon.fetchTop(day, kind, 5),
  { day, kind },
);
check(Array.isArray(emptyTop) && emptyTop.length === 0, 'no scores submitted yet: fetchTop returns an empty list, not an error', emptyTop);

const afterOne = await page.evaluate(
  ({ day, kind }) => window.__lsu.hamon.sync(day, kind, 'Masipag na Kalabaw', 42),
  { day, kind },
);
check(
  Array.isArray(afterOne) && afterOne.length === 1 && afterOne[0].nickname_snapshot === 'Masipag na Kalabaw' && afterOne[0].score === 42,
  'submitting a score returns it back in the leaderboard immediately',
  afterOne,
);

const afterTwo = await page.evaluate(
  ({ day, kind }) => window.__lsu.hamon.sync(day, kind, 'Matapang na Butiki', 99),
  { day, kind },
);
check(
  Array.isArray(afterTwo) && afterTwo.length === 2 && afterTwo[0].score === 99 && afterTwo[1].score === 42,
  'a second, higher score sorts first; the leaderboard is ordered by score descending',
  afterTwo,
);

const otherDay = await page.evaluate(
  ({ kind }) => window.__lsu.hamon.fetchTop('2000-01-01', kind, 5),
  { kind },
);
check(Array.isArray(otherDay) && otherDay.length === 0, "a different day's leaderboard is separate (filtered by day, not just game)", otherDay);

check(errs.length === 0, 'no script errors', errs.slice(0, 3).join(' | '));
await browser.close();
srv.close();
done();
