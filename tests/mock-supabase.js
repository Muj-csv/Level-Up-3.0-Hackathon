/* Test double for supabase-js, served by tests/online.mjs (mode "supabase") in place of vendor/supabase-*.js.
   It implements only what the game's Supabase room adapter uses: createClient().channel(name, opts) with
   on('broadcast' | 'presence'), subscribe, send, track, and client.removeChannel. Pages on the same origin share
   channels through a BroadcastChannel. Broadcasts skip the sender (broadcast.self is false in the game).
   This checks the adapter and the game's sync logic; it says nothing about Supabase's latency or rate limits.
   window.__supaOffline = true makes a page drop everything it sends and receives, like a lost connection.
   window.__supaSent counts the broadcasts a page sends, so tests can check traffic against Supabase's limits.

   Also implements createClient().from(table) for F9.3 (online Hamon ng Araw scores): insert/select/eq/order/limit,
   each step thenable like the real postgrest-js builder. Rows live in memory for this one page only (no
   BroadcastChannel) -- enough to test the game's own submit-then-read logic, not a real multi-device leaderboard. */
(function () {
  function makeSelectBuilder(getRows) {
    let rows = getRows();
    const b = {
      eq(col, val) { rows = rows.filter((r) => r[col] === val); return b; },
      order(col, opts) { const asc = !(opts && opts.ascending === false); rows = rows.slice().sort((x, y) => (asc ? (x[col] > y[col] ? 1 : -1) : (x[col] < y[col] ? 1 : -1))); return b; },
      limit(n) { rows = rows.slice(0, n); return b; },
      then(resolve, reject) { return Promise.resolve({ data: rows, error: null }).then(resolve, reject); },
    };
    return b;
  }
  function fromTable(store, name) {
    store[name] = store[name] || [];
    return {
      insert(row) {
        const arr = Array.isArray(row) ? row : [row];
        store[name].push(...arr.map((r) => Object.assign({}, r)));
        return { then(resolve, reject) { return Promise.resolve({ data: arr, error: null }).then(resolve, reject); } };
      },
      select() { return makeSelectBuilder(() => store[name]); },
    };
  }
  function createClient() {
    const tableStore = {};
    return {
      from(name) { return fromTable(tableStore, name); },
      channel(name, opts) {
        const key = (opts && opts.config && opts.config.presence && opts.config.presence.key) || 'k' + Math.random().toString(36).slice(2, 9);
        const bus = new BroadcastChannel('mock-supa-' + name);
        const handlers = [];
        let closed = false;
        const fire = (type, event, arg) => handlers.forEach(h => { if (h.type === type && h.event === event) try { h.cb(arg); } catch (e) { console.error(e); } });
        bus.onmessage = e => {
          if (window.__supaOffline) return;
          const m = e.data;
          if (m.t === 'b') fire('broadcast', m.event, { payload: m.payload });
          else if (m.t === 'join') { fire('presence', 'join', { key: m.key }); if (m.hello) bus.postMessage({ t: 'join', key }); }
          else if (m.t === 'leave') fire('presence', 'leave', { key: m.key });
        };
        const ch = {
          on(type, filter, cb) { handlers.push({ type, event: filter.event, cb }); return ch; },
          subscribe(cb) { setTimeout(() => { if (!closed) cb('SUBSCRIBED'); }, 0); return ch; },
          send(msg) { if (!closed && !window.__supaOffline) window.__supaSent = (window.__supaSent || 0) + 1, bus.postMessage({ t: 'b', event: msg.event, payload: msg.payload }); return Promise.resolve('ok'); },
          track() { if (!closed) bus.postMessage({ t: 'join', key, hello: true }); return Promise.resolve('ok'); },
          _close() { if (closed) return; closed = true; bus.postMessage({ t: 'leave', key }); bus.close(); }
        };
        return ch;
      },
      removeChannel(ch) { ch._close(); return Promise.resolve('ok'); }
    };
  }
  window.supabase = { createClient };
})();
