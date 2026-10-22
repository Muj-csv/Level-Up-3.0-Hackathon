/* Test double for the Claude artifact room service, injected into the page by tests/online.mjs.
   It implements only what index.html uses: use('room') -> join(name) -> {peers, onPeers, presence, leave},
   with presence as a shallow-merged object per peer. Pages on the same origin share rooms through a
   BroadcastChannel; a peer that stops sending heartbeats for 2.5 s drops out of everyone's list.
   This checks the game's own sync logic; it says nothing about the real service's latency or limits. */
(function () {
  if (window.claude) return;
  const me = 'p' + Math.random().toString(36).slice(2, 9);
  function join(name) {
    const ch = new BroadcastChannel('mock-room-' + name);
    const peers = new Map(); // id -> {presence, seen}
    let mine = {}, subs = [], beat = 0, left = false;
    const list = () => [{ peer: me, sameTab: true, presence: mine }].concat([...peers].map(([peer, v]) => ({ peer, sameTab: false, presence: v.presence })));
    const emit = () => { const ps = list(); subs.forEach(s => { try { s.cb({ peers: ps }); } catch (e) { console.error(e); } }); };
    const send = () => { if (!left) ch.postMessage({ t: 'p', id: me, presence: mine }); };
    ch.onmessage = e => {
      const m = e.data;
      if (m.t === 'p') { const had = peers.has(m.id); peers.set(m.id, { presence: m.presence, seen: Date.now() }); if (!had) send(); emit(); }
      else if (m.t === 'bye') { if (peers.delete(m.id)) emit(); }
    };
    beat = setInterval(() => { send(); const t = Date.now(); let gone = false; for (const [id, v] of peers) if (t - v.seen > 2500) { peers.delete(id); gone = true; } if (gone) emit(); }, 400);
    send();
    return Promise.resolve({
      peers: list,
      onPeers(cb, err) { const s = { cb, err }; subs.push(s); setTimeout(emit, 0); return () => { subs = subs.filter(x => x !== s); }; },
      presence(patch) { mine = Object.assign({}, mine, patch); send(); setTimeout(emit, 0); return Promise.resolve(); },
      leave() { left = true; clearInterval(beat); ch.postMessage({ t: 'bye', id: me }); ch.close(); return Promise.resolve(); }
    });
  }
  window.claude = { use(cap) { return cap === 'room' ? Promise.resolve({ join }) : Promise.reject(new Error('not mocked: ' + cap)); } };
})();
