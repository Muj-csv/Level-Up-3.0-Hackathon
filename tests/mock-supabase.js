/* Test double for supabase-js, served by tests/online.mjs (mode "supabase") in place of vendor/supabase-*.js.
   It implements only what the game's Supabase room adapter uses: createClient().channel(name, opts) with
   on('broadcast' | 'presence'), subscribe, send, track, and client.removeChannel. Pages on the same origin share
   channels through a BroadcastChannel. Broadcasts skip the sender (broadcast.self is false in the game).
   This checks the adapter and the game's sync logic; it says nothing about Supabase's latency or rate limits. */
(function () {
  function createClient() {
    return {
      channel(name, opts) {
        const key = (opts && opts.config && opts.config.presence && opts.config.presence.key) || 'k' + Math.random().toString(36).slice(2, 9);
        const bus = new BroadcastChannel('mock-supa-' + name);
        const handlers = [];
        let closed = false;
        const fire = (type, event, arg) => handlers.forEach(h => { if (h.type === type && h.event === event) try { h.cb(arg); } catch (e) { console.error(e); } });
        bus.onmessage = e => {
          const m = e.data;
          if (m.t === 'b') fire('broadcast', m.event, { payload: m.payload });
          else if (m.t === 'join') { fire('presence', 'join', { key: m.key }); if (m.hello) bus.postMessage({ t: 'join', key }); }
          else if (m.t === 'leave') fire('presence', 'leave', { key: m.key });
        };
        const ch = {
          on(type, filter, cb) { handlers.push({ type, event: filter.event, cb }); return ch; },
          subscribe(cb) { setTimeout(() => { if (!closed) cb('SUBSCRIBED'); }, 0); return ch; },
          send(msg) { if (!closed) bus.postMessage({ t: 'b', event: msg.event, payload: msg.payload }); return Promise.resolve('ok'); },
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
