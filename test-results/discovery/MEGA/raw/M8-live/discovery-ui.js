/**
 * Phase B CONTINUE · Discovery Mode UI (additive vertical slice)
 * Aligns: PHASE-B-BOUNDARIES-SSE-NARROW-STORE-ארכיטקט-2026-09-20.md
 * Wires to POST/GET /api/discovery/sessions · prefers SSE …/events · POST …/narrow
 * (server recompute); falls back to poll + discovery-fixtures/* progressive stages.
 * Entity-agnostic · INFORMATION ≠ IDENTITY · no Core /api/lookup changes.
 */
(function () {
  'use strict';

  const FIXTURE_BASE = 'discovery-fixtures';
  const FACET_LABEL_HE = {
    provider: 'סוג מקור',
    kind: 'סוג ממצא',
    relationship: 'קשר מדווח',
    confidence_band: 'רמת ראיות',
    hint: 'רמז',
  };
  const KIND_HE = {
    page: 'דף',
    registry: 'רישום',
    document: 'מסמך',
    contact_public: 'יצירת קשר ציבורי',
    media: 'מדיה',
    other: 'אחר',
  };
  const STATUS_HE = {
    running: 'מאתר…',
    partial: 'חלקי',
    complete: 'הושלם',
    failed_soft: 'חלקי (שגיאת מקור)',
  };

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]),
    );
  }
  function safeUrl(u) {
    const s = String(u || '').trim();
    if (!s) return '';
    try {
      const parsed = new URL(s, location.origin);
      if (parsed.protocol.toLowerCase() === 'https:') return parsed.href;
      return '';
    } catch {
      return '';
    }
  }
  function safeHref(u) {
    return esc(safeUrl(u) || '#');
  }

  function params() {
    return new URLSearchParams(location.search);
  }
  function isDiscoveryMode() {
    return params().get('mode') === 'discovery';
  }
  function forceFixture() {
    const p = params();
    return p.get('discoverySource') === 'fixture' || p.get('fixture') === '1';
  }
  function setMode(mode) {
    const p = params();
    if (mode === 'discovery') p.set('mode', 'discovery');
    else p.delete('mode');
    const q = p.toString();
    history.replaceState(null, '', q ? `?${q}` : location.pathname);
    applyModeChrome();
  }

  /** @type {{ findings: object[], evidence: object[], facets: object[], status: string, progress: object, providers: object, sessionId?: string, source?: string, q?: string }} */
  let discState = emptyState();
  let selectedFacets = {}; // key -> Set(value)
  let discAbort = null;
  let discTimers = [];
  /** @type {EventSource|null} */
  let discEventSource = null;
  let narrowInFlight = false;

  function emptyState() {
    return {
      findings: [],
      evidence: [],
      facets: [],
      status: 'idle',
      progress: { done: 0, totalHint: 0 },
      providers: {},
      sessionId: null,
      source: null,
      q: '',
      /** 'none' | 'server' | 'client' — server means findings already narrowed by POST /narrow */
      narrowSource: 'none',
      /** 'sse' | 'poll' | 'fixture' | null */
      transport: null,
      /** SSE cursor / last event id (Arch: ordered additive; reconnect resume) */
      cursor: null,
    };
  }

  function closeSse() {
    if (discEventSource) {
      try {
        discEventSource.close();
      } catch (_) {}
      discEventSource = null;
    }
  }

  function clearDiscTimers() {
    discTimers.forEach((t) => clearTimeout(t));
    discTimers = [];
    closeSse();
  }

  function forcePollTransport() {
    return params().get('discoveryTransport') === 'poll';
  }

  function preferSseTransport() {
    if (forcePollTransport()) return false;
    const t = params().get('discoveryTransport');
    if (t === 'sse') return true;
    return typeof EventSource !== 'undefined';
  }

  function isApiSource(src) {
    const s = String(src || '');
    return s === 'api' || s.startsWith('api:');
  }

  function selectedFacetsPayload() {
    const filters = {};
    Object.entries(selectedFacets).forEach(([k, set]) => {
      if (set && set.size) filters[k] = [...set];
    });
    return filters;
  }

  function shouldAttemptServerNarrow() {
    return (
      !!discState.sessionId &&
      isApiSource(discState.source) &&
      !forceFixture()
    );
  }

  function applyModeChrome() {
    const disc = isDiscoveryMode();
    document.body.classList.toggle('mode-discovery', disc);
    document.body.classList.toggle('mode-entity', !disc);
    const entityWrap = document.getElementById('entity-search-wrap');
    const discWrap = document.getElementById('discovery-search-wrap');
    const entityHint = document.getElementById('search-hint');
    const pill = document.getElementById('mode-pill');
    const tabEnt = document.getElementById('tab-entity');
    const tabDisc = document.getElementById('tab-discovery');
    if (entityWrap) entityWrap.hidden = disc;
    if (discWrap) discWrap.hidden = !disc;
    if (entityHint) entityHint.hidden = disc;
    if (pill) {
      pill.textContent = disc
        ? 'DISCOVERY MODE · FINDINGS · EVIDENCE · PREVIEW'
        : 'PUBLIC SOURCES · CITE-OR-DROP · uiState · ORCHESTRATOR-V0';
    }
    if (tabEnt) tabEnt.setAttribute('aria-selected', disc ? 'false' : 'true');
    if (tabDisc) tabDisc.setAttribute('aria-selected', disc ? 'true' : 'false');
    const out = document.getElementById('out');
    if (disc && out && discState.status === 'idle') {
      paintDiscoveryReady();
    } else if (!disc && out && discState.status !== 'idle') {
      // leaving discovery — restore entity ready if out was discovery
      if (out.dataset.surface === 'discovery') {
        out.dataset.surface = '';
        out.className = 'empty-state';
        out.innerHTML =
          '<span class="big">READY</span>הזינו שם (עברית או English) ו/או טלפון/אימייל ציבורי. שם נפוץ → נבקש הקשר · מועמדים רק עם ראיות · תיק רק כשיש מקורות.';
      }
    } else if (disc && discState.status !== 'idle') {
      renderDiscovery();
    }
  }

  function paintDiscoveryReady() {
    const out = document.getElementById('out');
    if (!out) return;
    out.dataset.surface = 'discovery';
    out.className = 'empty-state';
    out.innerHTML = `
      <span class="big">DISCOVERY READY</span>
      מרחב חקירה ציבורי · ממצאים + ראיות + מסננים · <strong>לא</strong> חיפוש אנשים / תיק זהות.
      <div class="disc-ready-note">הזינו Seed כלשהו (שם / דומיין / ארגון…) או בחרו פיקסצ׳ר להדגמה. אין טענת «זה האדם».</div>
    `;
  }

  async function loadFixtureIndex() {
    const r = await fetch(`${FIXTURE_BASE}/index.json`, { cache: 'no-store' });
    if (!r.ok) throw new Error('fixture index missing');
    return r.json();
  }

  async function loadFixtureFile(file) {
    const r = await fetch(`${FIXTURE_BASE}/${file}`, { cache: 'no-store' });
    if (!r.ok) throw new Error('fixture load failed');
    return r.json();
  }

  /** Match fixture by query string — fixture catalog only, not entity special-case UI. */
  async function resolveFixtureForQuery(q) {
    const idx = await loadFixtureIndex();
    const needle = String(q || '').trim().toLowerCase();
    for (const entry of idx.fixtures || []) {
      const data = await loadFixtureFile(entry.file);
      const hints = (data.matchHints || [data.q]).map((h) => String(h).toLowerCase());
      if (hints.includes(needle) || String(data.q || '').toLowerCase() === needle) {
        return data;
      }
      if (entry.id === needle || data.fixtureId === needle) return data;
    }
    // seed query param override
    const seedParam = params().get('seed');
    if (seedParam) {
      const entry = (idx.fixtures || []).find((f) => f.id === seedParam || f.file === seedParam);
      if (entry) return loadFixtureFile(entry.file);
    }
    return null;
  }

  async function populateFixtureChips() {
    const host = document.getElementById('disc-fixture-chips');
    if (!host) return;
    try {
      const idx = await loadFixtureIndex();
      host.innerHTML = (idx.fixtures || [])
        .map(
          (f) =>
            `<button type="button" class="disc-chip" data-fixture="${esc(f.id)}" title="fixture only">${esc(f.labelHe || f.id)}</button>`,
        )
        .join('');
      host.querySelectorAll('[data-fixture]').forEach((btn) => {
        btn.onclick = async () => {
          const id = btn.getAttribute('data-fixture');
          const entry = (idx.fixtures || []).find((x) => x.id === id);
          if (!entry) return;
          const data = await loadFixtureFile(entry.file);
          const input = document.getElementById('disc-q');
          if (input) input.value = data.q || '';
          startDiscovery({ forceFixture: true, fixtureData: data });
        };
      });
    } catch (e) {
      host.innerHTML = `<span class="disc-muted">פיקסצ׳רים לא זמינים (${esc(e.message)})</span>`;
    }
  }

  function evidenceMap(list) {
    const m = new Map();
    (list || []).forEach((e) => m.set(e.id, e));
    return m;
  }

  function clientFilterFindings(findings) {
    const active = Object.entries(selectedFacets).filter(([, set]) => set && set.size);
    if (!active.length) return findings || [];
    return (findings || []).filter((f) => {
      return active.every(([key, set]) => {
        if (key === 'provider') {
          return (f.providers || []).some((p) => set.has(p));
        }
        if (key === 'kind') {
          return set.has(f.kind);
        }
        // relationship / confidence_band / hint via facetHints "key:value" or bare value
        const hints = f.facetHints || [];
        return [...set].some((v) => {
          const prefixed = `${key}:${v}`;
          return hints.includes(prefixed) || hints.includes(v) || hints.some((h) => h.endsWith(`:${v}`));
        });
      });
    });
  }

  function filteredFindings() {
    // Server /narrow already recomputed the set — do not double-filter
    if (discState.narrowSource === 'server') return discState.findings || [];
    return clientFilterFindings(discState.findings || []);
  }

  function toggleFacet(key, value) {
    if (!selectedFacets[key]) selectedFacets[key] = new Set();
    const set = selectedFacets[key];
    if (set.has(value)) set.delete(value);
    else set.add(value);
    if (!set.size) delete selectedFacets[key];
    applyFacetChange();
  }

  function clearFacets() {
    selectedFacets = {};
    applyFacetChange();
  }

  async function applyFacetChange() {
    if (shouldAttemptServerNarrow()) {
      const ok = await postNarrow();
      if (ok) return;
      // graceful degrade: client-side filter only
      discState.narrowSource = 'client';
    } else {
      discState.narrowSource = Object.keys(selectedFacets).length ? 'client' : 'none';
    }
    renderDiscovery();
  }

  /**
   * POST /api/discovery/sessions/:id/narrow — Arch BOUNDARIES (server recompute).
   * Body: { filters: { [facetKey]: string[] } } — facet values only, not identity-commit.
   * Response: Acc-scrubbed canonical session snapshot (findings+facets recomputed).
   * Client filter is NOT authoritative when this succeeds.
   * @returns {Promise<boolean>} true if server narrow applied
   */
  async function postNarrow() {
    const sessionId = discState.sessionId;
    if (!sessionId || narrowInFlight) return false;
    narrowInFlight = true;
    const prevTag = discState.source;
    try {
      discState.source = 'api:narrow…';
      renderDiscovery();
      const r = await fetch(
        `/api/discovery/sessions/${encodeURIComponent(sessionId)}/narrow`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Arch BOUNDARIES: facet filters (keys → values[]); server recomputes
            filters: selectedFacetsPayload(),
          }),
          signal: discAbort && discAbort.signal,
        },
      );
      if (!r.ok) {
        // 404/405/501 → not implemented yet; fall back
        throw new Error(`narrow ${r.status}`);
      }
      const snap = await r.json();
      applySnapshot(snap, {
        source: 'api',
        sessionId,
        q: discState.q,
        narrowSource: 'server',
        transport: discState.transport || 'poll',
      });
      return true;
    } catch (e) {
      discState.source = prevTag || 'api';
      return false;
    } finally {
      narrowInFlight = false;
    }
  }

  function renderProgressStrip() {
    const st = discState.status;
    const prog = discState.progress || {};
    const providers = discState.providers || {};
    const done = Object.values(providers).filter((s) => s && s !== 'pending').length;
    const total = Object.keys(providers).length || prog.totalHint || 0;
    const findingsN = (discState.findings || []).length;
    const label = STATUS_HE[st] || st;
    const providerChips = Object.entries(providers)
      .map(([id, s]) => `<span class="disc-prov ${esc(s)}">${esc(id)} · ${esc(s)}</span>`)
      .join('');
    return `
      <div class="disc-progress" role="status" aria-live="polite">
        <div class="disc-progress-top">
          <span class="disc-status">${esc(label)}</span>
          <span class="disc-counts">${findingsN} ממצאים · ${done}/${total || '—'} מקורות${prog.done != null ? ` · שלב ${esc(prog.done)}/${esc(prog.totalHint || '—')}` : ''}</span>
          ${discState.source ? `<span class="disc-source-tag">${esc(discState.source)}</span>` : ''}
          ${discState.transport ? `<span class="disc-source-tag">tx:${esc(discState.transport)}</span>` : ''}
          ${discState.narrowSource && discState.narrowSource !== 'none' ? `<span class="disc-source-tag">narrow:${esc(discState.narrowSource)}</span>` : ''}
          ${narrowInFlight ? `<span class="disc-source-tag">מצמצם…</span>` : ''}
        </div>
        <div class="bar"><i style="width:${total ? Math.min(100, Math.round((done / total) * 100)) : st === 'complete' ? 100 : 18}%"></i></div>
        <div class="disc-prov-row">${providerChips || '<span class="disc-muted">מאתר מקורות…</span>'}</div>
      </div>`;
  }

  function renderFacets() {
    const facets = (discState.facets || []).filter((f) => (f.buckets || []).length);
    if (!facets.length) {
      return `<aside class="disc-facets"><div class="stamp"><span>מסננים</span><span class="n">אין עדיין</span></div><div class="disc-facet-empty">מעדכן מסננים…</div></aside>`;
    }
    const groups = facets
      .map((f) => {
        const label = FACET_LABEL_HE[f.key] || f.label || f.key;
        const chips = (f.buckets || [])
          .map((b) => {
            const on = selectedFacets[f.key] && selectedFacets[f.key].has(b.value);
            return `<button type="button" class="disc-facet-chip${on ? ' on' : ''}" data-fkey="${esc(f.key)}" data-fval="${esc(b.value)}">${esc(b.value)} <span class="n">${esc(b.count)}</span></button>`;
          })
          .join('');
        return `<div class="disc-facet-group"><div class="disc-facet-label">${esc(label)}</div><div class="disc-facet-chips">${chips}</div></div>`;
      })
      .join('');
    const clearBtn = Object.keys(selectedFacets).length
      ? `<button type="button" class="disc-facet-clear" id="disc-facet-clear">נקה מסננים</button>`
      : '';
    return `<aside class="disc-facets" aria-label="מסנני ממצאים">
      <div class="stamp"><span>מסננים</span><span class="n">facets</span></div>
      ${groups}${clearBtn}
    </aside>`;
  }

  function renderFindingCard(f, evMap) {
    const kind = KIND_HE[f.kind] || f.kind;
    const score =
      typeof f.scoreFinding === 'number'
        ? `<span class="conf">רלוונטיות ממצא ${(f.scoreFinding * 100).toFixed(0)}%</span>`
        : '';
    const evList = (f.evidenceIds || []).map((id) => evMap.get(id)).filter(Boolean);
    const provenance = evList
      .map((e) => {
        const href = safeHref(e.provenanceUrl);
        return `<div class="disc-ev">
          <div><span class="disc-ev-k">מקור</span> ${esc(e.providerId || '—')}</div>
          <div><span class="disc-ev-k">כתובת</span> <a class="disc-ev-link" href="${href}" target="_blank" rel="noopener noreferrer">${esc(e.provenanceUrl)}</a></div>
          ${e.quote ? `<div><span class="disc-ev-k">ציטוט</span> <q>${esc(e.quote)}</q></div>` : ''}
          <div><span class="disc-ev-k">שליפה</span> <span class="mono">${esc(e.retrievedAt || '—')}</span></div>
        </div>`;
      })
      .join('');
    const firstUrl = evList[0] ? safeHref(evList[0].provenanceUrl) : '#';
    return `<article class="disc-finding" data-fid="${esc(f.id)}">
      <div class="disc-finding-head">
        <span class="disc-kind">${esc(kind)}</span>
        ${score}
      </div>
      <h3 class="disc-finding-title">${esc(f.title)}</h3>
      ${f.summary ? `<p class="disc-finding-sum">${esc(f.summary)}</p>` : ''}
      <div class="disc-finding-actions">
        <button type="button" class="disc-prov-toggle" aria-expanded="false">מאיפה יודעים?</button>
        ${firstUrl !== '#' ? `<a class="go" href="${firstUrl}" target="_blank" rel="noopener noreferrer">פתח מקור</a>` : ''}
      </div>
      <div class="disc-provenance" hidden>
        <div class="disc-provenance-label">ראיות · provenance</div>
        ${provenance || '<div class="disc-muted">אין provenance (לא אמור לקרות — cite-or-drop)</div>'}
      </div>
    </article>`;
  }

  function renderDiscovery() {
    const out = document.getElementById('out');
    if (!out) return;
    out.dataset.surface = 'discovery';
    out.className = 'disc-out';
    const evMap = evidenceMap(discState.evidence);
    const list = filteredFindings();
    const cards = list.map((f) => renderFindingCard(f, evMap)).join('');
    out.innerHTML = `
      <div class="mode"><span>מצב: גילוי (Discovery)</span><span class="chip">INFORMATION ≠ IDENTITY</span>${discState.q ? `<span class="chip">Seed: ${esc(discState.q)}</span>` : ''}</div>
      ${renderProgressStrip()}
      <div class="disc-layout">
        ${renderFacets()}
        <div class="disc-feed" aria-label="ממצאים">
          <div class="stamp"><span>ממצאים</span><span class="n">${list.length}</span></div>
          ${cards || (discState.status === 'running' || discState.status === 'partial'
            ? `<div class="disc-skel"><div class="skel-line mid"></div><div class="skel-line"></div><div class="skel-line short"></div></div>`
            : `<div class="stack-empty">אין ממצאים להצגה${Object.keys(selectedFacets).length ? ' תחת המסננים שנבחרו' : ''}.</div>`)}
        </div>
      </div>
      <p class="disc-footer-note">אין דיוקן · אין תיק זהות · אין «זה האדם» · ממצאים בלבד עם provenance.</p>
    `;
    out.querySelectorAll('.disc-facet-chip').forEach((btn) => {
      btn.onclick = () => toggleFacet(btn.getAttribute('data-fkey'), btn.getAttribute('data-fval'));
    });
    const clear = document.getElementById('disc-facet-clear');
    if (clear) clear.onclick = () => clearFacets();
    out.querySelectorAll('.disc-prov-toggle').forEach((btn) => {
      btn.onclick = () => {
        const card = btn.closest('.disc-finding');
        const panel = card && card.querySelector('.disc-provenance');
        if (!panel) return;
        const open = panel.hasAttribute('hidden');
        if (open) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      };
    });
  }

  function applySnapshot(snap, meta = {}) {
    const findings = snap.findings || discState.findings || [];
    const evidence = snap.evidence || discState.evidence || [];
    discState = {
      findings,
      evidence,
      facets: Array.isArray(snap.facets) ? snap.facets : discState.facets || [],
      status: snap.status || discState.status || 'partial',
      progress: snap.progress || discState.progress || {},
      providers: snap.providers || discState.providers || {},
      sessionId: snap.sessionId || meta.sessionId || discState.sessionId || null,
      source: meta.source || discState.source,
      q: snap.q || snap.seed || meta.q || discState.q,
      narrowSource:
        meta.narrowSource !== undefined
          ? meta.narrowSource
          : discState.narrowSource || 'none',
      transport:
        meta.transport !== undefined ? meta.transport : discState.transport,
      cursor:
        snap.cursor != null
          ? snap.cursor
          : meta.cursor !== undefined
            ? meta.cursor
            : discState.cursor,
    };
    // Belt: never paint identity chrome fields if somehow present
    delete discState.dossier;
    delete discState.faces;
    renderDiscovery();
  }

  /** Merge append-only progressive finding (+ optional evidence) without drop. */
  function mergeFindingChunk(finding, evidenceItems) {
    if (!finding || !finding.id) return;
    const list = discState.findings ? discState.findings.slice() : [];
    const idx = list.findIndex((f) => f.id === finding.id);
    if (idx >= 0) list[idx] = { ...list[idx], ...finding };
    else list.push(finding);
    discState.findings = list;
    if (evidenceItems && evidenceItems.length) {
      const ev = discState.evidence ? discState.evidence.slice() : [];
      const byId = new Map(ev.map((e) => [e.id, e]));
      evidenceItems.forEach((e) => {
        if (!e || !e.id) return;
        byId.set(e.id, { ...(byId.get(e.id) || {}), ...e });
      });
      discState.evidence = [...byId.values()];
    }
    // Progressive chunk resets server-narrow authority; client overlay until next /narrow
    if (discState.narrowSource === 'server') discState.narrowSource = 'client';
  }

  function noteSseCursor(data, lastEventId) {
    if (lastEventId) discState.cursor = lastEventId;
    else if (data && data.cursor != null) discState.cursor = data.cursor;
    else if (data && data.id != null && typeof data.id !== 'object') discState.cursor = data.id;
  }

  function applySsePayload(eventName, data, lastEventId) {
    if (!data || typeof data !== 'object') return false;
    const type = String(eventName || data.type || data.event || 'message').toLowerCase();
    noteSseCursor(data, lastEventId);

    if (type === 'error' && (data.error || data.message)) {
      throw new Error(String(data.error || data.message));
    }

    // Full snapshot / session projection (named events or default message with findings[])
    if (
      type === 'snapshot' ||
      type === 'session' ||
      (type === 'message' && (Array.isArray(data.findings) || data.sessionId))
    ) {
      if (Array.isArray(data.findings) || data.status || data.facets || data.sessionId) {
        applySnapshot(data, {
          source: 'api',
          sessionId: data.sessionId || discState.sessionId,
          q: discState.q,
          narrowSource: 'none',
          transport: 'sse',
          cursor: discState.cursor,
        });
        return isTerminalStatus(data.status, data.providers || discState.providers);
      }
    }

    if (type === 'finding' || type === 'findings') {
      const items = Array.isArray(data.findings)
        ? data.findings
        : data.finding
          ? [data.finding]
          : Array.isArray(data)
            ? data
            : [];
      const evItems = Array.isArray(data.evidence)
        ? data.evidence
        : data.evidenceItem
          ? [data.evidenceItem]
          : [];
      items.forEach((f) => mergeFindingChunk(f, evItems));
      if (data.status) discState.status = data.status;
      if (data.progress) discState.progress = data.progress;
      if (data.providers) discState.providers = data.providers;
      discState.transport = 'sse';
      renderDiscovery();
      return isTerminalStatus(data.status, data.providers || discState.providers);
    }

    if (type === 'progress' || type === 'status' || type === 'chunk') {
      if (data.status) discState.status = data.status;
      if (data.progress) discState.progress = data.progress;
      if (data.providers) discState.providers = data.providers;
      if (Array.isArray(data.findings)) {
        data.findings.forEach((f) => mergeFindingChunk(f, data.evidence || []));
      }
      discState.transport = 'sse';
      renderDiscovery();
      return isTerminalStatus(data.status, data.providers || discState.providers);
    }

    if (type === 'facets') {
      if (Array.isArray(data.facets)) discState.facets = data.facets;
      else if (Array.isArray(data)) discState.facets = data;
      discState.transport = 'sse';
      renderDiscovery();
      return false;
    }

    if (type === 'tombstone' && data.id) {
      discState.findings = (discState.findings || []).filter((f) => f.id !== data.id);
      renderDiscovery();
      return false;
    }

    if (type === 'complete' || type === 'done' || type === 'terminal') {
      // Arch: terminal ∈ { partial, complete, failed_soft }
      if (data.status) discState.status = data.status;
      else if (!isTerminalStatus(discState.status)) discState.status = 'complete';
      if (data.progress) discState.progress = data.progress;
      if (data.providers) discState.providers = data.providers;
      if (Array.isArray(data.findings)) {
        applySnapshot(data, {
          source: 'api',
          sessionId: discState.sessionId,
          q: discState.q,
          narrowSource: 'none',
          transport: 'sse',
          cursor: discState.cursor,
        });
      } else {
        discState.transport = 'sse';
        renderDiscovery();
      }
      return true;
    }

    return isTerminalStatus(data.status, data.providers || discState.providers);
  }

  /**
   * Arch BOUNDARIES SSE: terminal status ∈ { partial, complete, failed_soft }.
   * `running` keeps the stream/poll alive; anything else ends progressive intake.
   */
  function isTerminalStatus(st, providers) {
    if (!st || st === 'running' || st === 'idle') return false;
    if (st === 'complete' || st === 'failed_soft') return true;
    if (st === 'partial') {
      // Soft-terminal when no provider still pending (budget / fan-out done)
      if (!providers || !Object.keys(providers).length) return true;
      return Object.values(providers).every((s) => s && s !== 'pending');
    }
    return false;
  }

  /**
   * Prefer EventSource on …/events; reject quickly so caller can poll.
   */
  function runViaSse(sessionId, q, signal) {
    return new Promise((resolve, reject) => {
      if (typeof EventSource === 'undefined') {
        reject(new Error('EventSource unsupported'));
        return;
      }
      // Arch: ordered/additive by cursor/event id; EventSource resends Last-Event-ID on reconnect
      let url = `/api/discovery/sessions/${encodeURIComponent(sessionId)}/events`;
      if (discState.cursor) {
        url += `${url.includes('?') ? '&' : '?'}cursor=${encodeURIComponent(String(discState.cursor))}`;
      }
      let settled = false;
      let sawEvent = false;
      let es;
      const finish = (fn, arg) => {
        if (settled) return;
        settled = true;
        try {
          if (signal) signal.removeEventListener('abort', onAbort);
        } catch (_) {}
        closeSse();
        fn(arg);
      };
      const onAbort = () => finish(reject, new DOMException('Aborted', 'AbortError'));

      try {
        es = new EventSource(url);
        discEventSource = es;
      } catch (e) {
        reject(e);
        return;
      }

      if (signal) {
        if (signal.aborted) {
          onAbort();
          return;
        }
        signal.addEventListener('abort', onAbort);
      }

      // If SSE endpoint missing, EventSource errors without a useful status — time-box first event
      const bootTimer = setTimeout(() => {
        if (!sawEvent) finish(reject, new Error('SSE timeout / unavailable'));
      }, 2800);
      discTimers.push(bootTimer);

      const handle = (eventName, ev) => {
        let data;
        try {
          data = JSON.parse(ev.data);
        } catch {
          return;
        }
        sawEvent = true;
        clearTimeout(bootTimer);
        try {
          const terminal = applySsePayload(eventName, data, ev.lastEventId || null);
          if (terminal) finish(resolve, discState);
        } catch (e) {
          finish(reject, e);
        }
      };

      es.onopen = () => {
        // open alone is not enough (404 may still "open" on some stacks) — wait for data
      };
      es.onmessage = (ev) => handle('message', ev);
      [
        'snapshot',
        'session',
        'finding',
        'findings',
        'progress',
        'status',
        'chunk',
        'facets',
        'complete',
        'done',
        'terminal',
        'error',
        'tombstone',
      ].forEach((name) => {
        es.addEventListener(name, (ev) => handle(name, ev));
      });
      es.onerror = () => {
        // readyState 2 = CLOSED after fatal; 0 CONNECTING retry — if no events yet, bail to poll
        if (!sawEvent && es.readyState === EventSource.CLOSED) {
          finish(reject, new Error('SSE closed before data'));
        } else if (!sawEvent && es.readyState === EventSource.CONNECTING) {
          // let bootTimer decide; EventSource may auto-retry with Last-Event-ID
        } else if (sawEvent && es.readyState === EventSource.CLOSED) {
          // stream ended without explicit complete — resolve with current state (no silent loss)
          finish(resolve, discState);
        }
      };
    });
  }

  async function runViaPoll(sessionId, q, signal, pollAfter) {
    let snap = null;
    for (let i = 0; i < 40; i++) {
      if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const gr = await fetch(`/api/discovery/sessions/${encodeURIComponent(sessionId)}`, {
        signal,
      });
      if (!gr.ok) throw new Error(`poll ${gr.status}`);
      snap = await gr.json();
      applySnapshot(snap, {
        source: 'api',
        sessionId,
        q,
        narrowSource: 'none',
        transport: 'poll',
      });
      if (isTerminalStatus(snap.status, snap.providers)) break;
      await new Promise((res) => {
        const t = setTimeout(res, pollAfter || 300);
        discTimers.push(t);
      });
    }
    return snap;
  }

  async function runViaApi(q, hints, signal) {
    const body = { seed: q, q, locale: 'he' };
    if (hints && Object.keys(hints).length) body.hints = hints;
    const r = await fetch('/api/discovery/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.error || `API ${r.status}`);
    }
    const created = await r.json();
    const sessionId = created.sessionId;
    const pollAfter = created.pollAfterMs || 300;

    // Serverless Preview may return Acc-scrubbed snapshot on POST — paint immediately
    if (created.snapshot) {
      applySnapshot(created.snapshot, {
        source: 'api',
        sessionId,
        q,
        narrowSource: 'none',
        transport: preferSseTransport() ? 'sse' : 'poll',
      });
      if (
        isTerminalStatus(created.snapshot.status, created.snapshot.providers) ||
        isTerminalStatus(created.status, created.snapshot.providers)
      ) {
        // Terminal on create — still mark transport; optional SSE skip
        discState.transport = 'poll';
        renderDiscovery();
        return created.snapshot;
      }
    }

    // Prefer SSE progressive; on error/unsupported → poll
    if (preferSseTransport()) {
      try {
        const viaSse = await runViaSse(sessionId, q, signal);
        return viaSse;
      } catch (sseErr) {
        if (signal && signal.aborted) throw sseErr;
        closeSse();
        // continue to poll
      }
    }

    return runViaPoll(sessionId, q, signal, pollAfter);
  }

  function runViaFixture(data, q) {
    return new Promise((resolve, reject) => {
      const byId = new Map((data.findings || []).map((f) => [f.id, f]));
      const evidence = data.evidence || [];
      const stages = data.stages || [];
      if (!stages.length) {
        applySnapshot(
          {
            sessionId: `fix-${data.fixtureId}`,
            q: data.q || q,
            status: 'complete',
            findings: data.findings || [],
            evidence,
            facets: [],
            progress: { done: 1, totalHint: 1 },
            providers: {},
            forbiddenIdentitiesVersion: data.forbiddenIdentitiesVersion,
          },
          { source: 'fixture', q, narrowSource: 'none', transport: 'fixture' },
        );
        resolve();
        return;
      }
      stages.forEach((stage, idx) => {
        const t = setTimeout(() => {
          if (discAbort && discAbort.signal.aborted) {
            reject(new DOMException('Aborted', 'AbortError'));
            return;
          }
          const findings = (stage.findingIds || []).map((id) => byId.get(id)).filter(Boolean);
          const evIds = new Set(findings.flatMap((f) => f.evidenceIds || []));
          applySnapshot(
            {
              sessionId: `fix-${data.fixtureId}`,
              q: data.q || q,
              status: stage.status,
              findings,
              evidence: evidence.filter((e) => evIds.has(e.id)),
              facets: stage.facets || [],
              progress: stage.progress || {},
              providers: stage.providers || {},
              forbiddenIdentitiesVersion: data.forbiddenIdentitiesVersion,
            },
            { source: `fixture:${data.fixtureId}`, q, narrowSource: 'none', transport: 'fixture' },
          );
          if (idx === stages.length - 1) resolve();
        }, stage.afterMs || 0);
        discTimers.push(t);
      });
    });
  }

  async function startDiscovery(opts = {}) {
    if (!isDiscoveryMode()) return;
    const input = document.getElementById('disc-q');
    const q = String((opts.fixtureData && opts.fixtureData.q) || (input && input.value) || '').trim();
    const out = document.getElementById('out');
    if (!q) {
      if (out) {
        out.className = 'empty-state';
        out.dataset.surface = 'discovery';
        out.innerHTML = '<span class="big">EMPTY</span>הזינו Seed לחיפוש גילוי.';
      }
      return;
    }
    clearDiscTimers();
    if (discAbort) try { discAbort.abort(); } catch (_) {}
    discAbort = typeof AbortController !== 'undefined' ? new AbortController() : null;
    selectedFacets = {};
    discState = emptyState();
    discState.status = 'running';
    discState.q = q;
    discState.source = '…';
    renderDiscovery();

    const go = document.getElementById('disc-go');
    const cancel = document.getElementById('disc-cancel');
    if (go) {
      go.disabled = true;
      go.textContent = 'רץ…';
    }
    if (cancel) cancel.classList.add('show');

    const hints = {};
    const org = document.getElementById('disc-hint-org');
    const city = document.getElementById('disc-hint-city');
    const site = document.getElementById('disc-hint-site');
    if (org && org.value.trim()) hints.org = org.value.trim();
    if (city && city.value.trim()) hints.city = city.value.trim();
    if (site && site.value.trim()) hints.site = site.value.trim();

    try {
      const useFixture = opts.forceFixture || forceFixture() || opts.fixtureData;
      if (useFixture) {
        const data = opts.fixtureData || (await resolveFixtureForQuery(q));
        if (!data) throw new Error('no matching fixture — נסו seed=seed-person-he או API');
        await runViaFixture(data, q);
      } else {
        try {
          await runViaApi(q, hints, discAbort && discAbort.signal);
        } catch (apiErr) {
          // Fallback to fixture path when API unavailable (static / Preview not up)
          const data = await resolveFixtureForQuery(q);
          if (!data) throw apiErr;
          discState.source = 'fixture-fallback';
          await runViaFixture(data, q);
        }
      }
    } catch (e) {
      const msg = String(e && e.message || e || '');
      const aborted = (e && e.name === 'AbortError') || /abort/i.test(msg);
      if (out) {
        out.dataset.surface = 'discovery';
        out.className = 'err';
        out.innerHTML = aborted
          ? '<span class="big">CANCELLED</span>הגילוי בוטל.'
          : `שגיאה בגילוי: ${esc(msg)}`;
      }
    } finally {
      if (go) {
        go.disabled = false;
        go.textContent = 'גלה';
      }
      if (cancel) cancel.classList.remove('show');
    }
  }

  function cancelDiscovery() {
    clearDiscTimers();
    try {
      if (discAbort) discAbort.abort();
    } catch (_) {}
  }

  function bindDiscoveryChrome() {
    const tabEnt = document.getElementById('tab-entity');
    const tabDisc = document.getElementById('tab-discovery');
    if (tabEnt) tabEnt.onclick = () => setMode('entity');
    if (tabDisc) tabDisc.onclick = () => setMode('discovery');
    const go = document.getElementById('disc-go');
    const cancel = document.getElementById('disc-cancel');
    if (go) go.onclick = () => startDiscovery();
    if (cancel) cancel.onclick = () => cancelDiscovery();
    const dq = document.getElementById('disc-q');
    if (dq) {
      dq.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') startDiscovery();
      });
    }
    const hintsToggle = document.getElementById('disc-hints-toggle');
    const hintsPanel = document.getElementById('disc-hints');
    if (hintsToggle && hintsPanel) {
      hintsToggle.onclick = () => {
        const open = hintsPanel.hasAttribute('hidden');
        if (open) hintsPanel.removeAttribute('hidden');
        else hintsPanel.setAttribute('hidden', '');
        hintsToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      };
    }
    // Intercept Entity Mode go when somehow visible — no-op; entity handlers stay.
    populateFixtureChips();
    applyModeChrome();

    // Deep-link: ?mode=discovery&seed=seed-person-he auto-run optional
    if (isDiscoveryMode() && params().get('autorun') === '1') {
      const seed = params().get('seed');
      if (seed) {
        loadFixtureIndex()
          .then(async (idx) => {
            const entry = (idx.fixtures || []).find((f) => f.id === seed);
            if (!entry) return;
            const data = await loadFixtureFile(entry.file);
            const input = document.getElementById('disc-q');
            if (input) input.value = data.q || '';
            return startDiscovery({ forceFixture: true, fixtureData: data });
          })
          .catch(() => {});
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindDiscoveryChrome);
  } else {
    bindDiscoveryChrome();
  }

  // Expose for Acc/QA
  window.AkvotDiscovery = {
    startDiscovery,
    cancelDiscovery,
    isDiscoveryMode,
    setMode,
    getState: () => discState,
    getSelectedFacets: () => selectedFacetsPayload(),
    postNarrow,
    preferSseTransport,
  };
})();
