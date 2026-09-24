/**
 * Phase B CONTINUE + MEGA track M · Discovery Mode UI (additive vertical slice)
 * Aligns: PHASE-B-BOUNDARIES-SSE-NARROW-STORE-ארכיטקט-2026-09-20.md
 * MEGA-M: SSE reconnect (cursor/Last-Event-ID + backoff) · replay-from-complete
 * · partial→final UI states · no identity chrome.
 * GO-IMPL-UX: premium Investigation workspace · mobile nav/drawer · soft vocabulary
 * · provenance density · narrowSource tag · Foundation plan/graph soft surface.
 * GO-IMPL-UX plan/graph wire: defensive SSE plan+graph parsers · QueryPlan/Family/Budget
 * paint · soft graph panel · empty/UNKNOWN polish · facet Escape close · safe-area.
 * Checkpoint G polish: graph canvas zoom/pan (+pinch) · facet focus-trap · aria-expanded
 * · SSE live region · lifecycle prefers serverStage · hardened plan/graph parse.
 * Checkpoint H polish: hierarchy (findings/facets/provenance/plan) · mobile sheet/safe-area
 * · graph empty/loading/filter affordances · honest empty/error recovery (he).
 * Checkpoint I polish: keyboard/a11y (roving findings · Escape provenance · focus-visible
 * · graph aria · reduced-motion) · progressive loading chip/skeletons · graph select/seed
 * · empty offline/stale · mobile landscape/safe-area/touch-action.
 * Checkpoint J polish: provenance sticky+copy-link · facet narrow live announce · landmarks
 * · print-safe Discovery · UX smoke strings · wave G–J closeout.
 * Checkpoint K polish: clipboard insecure-context fallback · facet-announce debounce ·
 * denser UX smoke · a11y checklist evidence · graph focus contrast.
 * Track C: search-sourced URL candidates → UNKNOWN + why-found (general_web / url_candidate).
 * · DISCOVERY_ENABLE_GENERAL_WEB stays OFF · C1 · fixture demo only.
 * L4 Preview soft: urlDomainCandidates + plan.urlTargets + officialWebsiteUrls ingest.
 * Lane L4: QUICK READ gaps + officialWebsite facets · why-found under URL candidates
 * · soft P856 display without flag ON · INFORMATION ≠ IDENTITY.
 * Checkpoint L polish: P0 adapter surface-ready (WD/OL/WP) · soft family/provider labels
 * · graceful unknown-family fallback · flags stay OFF · no new HTTP.
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
    instance: 'מופע (P31)',
    occupation: 'עיסוק',
    citizenship: 'אזרחות',
    birth: 'שנת לידה (רמז)',
    death: 'שנת פטירה (רמז)',
    officialWebsite: 'אתר רשמי (מועמד)',
    urlCandidate: 'URL מועמד (חיפוש)',
    searchUrl: 'URL מחיפוש',
    generalWeb: 'חיפוש ווב כללי',
    authorName: 'שם מחבר',
    authorKey: 'מפתח מחבר',
    firstPublishYear: 'שנת פרסום',
    isbn: 'ISBN (פן בלבד)',
    edition: 'מהדורה',
    wikibase: 'Wikibase QID',
    family: 'משפחת מקור',
    sourceFamily: 'משפחת מקור',
  };
  const KIND_HE = {
    page: 'דף',
    registry: 'רישום',
    document: 'מסמך',
    contact_public: 'יצירת קשר ציבורי',
    media: 'מדיה',
    other: 'אחר',
    work: 'יצירה',
    url_candidate: 'מועמד URL',
    url: 'URL',
    web_origin: 'מקור ווב',
    web_search: 'תוצאת חיפוש',
  };
  /**
   * Soft source-family / provider labels for Arch P0 adapters (WD/OL/WP).
   * Display only · INFORMATION ≠ IDENTITY · no client flag ON · no new HTTP.
   * Unknown ids fall back to raw string (entity-agnostic passthrough).
   */
  const FAMILY_LABEL_HE = {
    knowledge_graph: 'גרף ידע',
    bibliographic: 'ביבליוגרפי',
    encyclopedia: 'אנציקלופדיה',
    wikidata: 'ויקינתונים',
    openlibrary: 'Open Library',
    wikipedia: 'ויקיפדיה',
    viaf: 'VIAF',
    web_origin: 'מקור ווב',
    general_web: 'חיפוש ווב כללי',
    general_web_search: 'חיפוש ווב כללי',
    web_search: 'חיפוש ווב',
    url_candidate: 'מועמד URL',
    search: 'חיפוש',
  };
  const FAMILY_LABEL_EN = {
    knowledge_graph: 'Knowledge graph',
    bibliographic: 'Bibliographic',
    encyclopedia: 'Encyclopedia',
    wikidata: 'Wikidata',
    openlibrary: 'Open Library',
    wikipedia: 'Wikipedia',
    viaf: 'VIAF',
    web_origin: 'Web origin',
    general_web: 'General web search',
    general_web_search: 'General web search',
    web_search: 'Web search',
    url_candidate: 'URL candidate',
    search: 'Search',
  };
  const PROVIDER_LABEL_HE = {
    wikidata: 'ויקינתונים',
    openlibrary: 'Open Library',
    wikipedia: 'ויקיפדיה',
    viaf: 'VIAF',
    web_origin: 'מקור ווב',
    general_web: 'חיפוש ווב',
    general_web_search: 'חיפוש ווב',
    web_search: 'חיפוש ווב',
  };
  const STATUS_HE = {
    running: 'מאתר…',
    partial: 'חלקי',
    complete: 'הושלם',
    failed_soft: 'חלקי (שגיאת מקור)',
    reconnecting: 'מתחבר מחדש…',
  };
  /**
   * Mission progressive stages (Wave1 soft UX · §09/§22) —
   * Planning → Family → Finding → Evidence → Frontier → Complete.
   * Extends prior LIFE_STAGES rail · no competing chrome · aliases keep SSE/fixtures.
   */
  const LIFE_STAGES = [
    { id: 'PLANNING', label: 'PLANNING', he: 'תכנון' },
    { id: 'FAMILY', label: 'FAMILY', he: 'משפחה' },
    { id: 'FINDING', label: 'FINDING', he: 'ממצא' },
    { id: 'EVIDENCE', label: 'EVIDENCE', he: 'ראיות' },
    { id: 'FRONTIER', label: 'FRONTIER', he: 'חזית' },
    { id: 'COMPLETE', label: 'COMPLETE', he: 'סיום' },
  ];
  /** Alias for Acc/QA · same rail as LIFE_STAGES. */
  const MISSION_STAGES = LIFE_STAGES;
  const LIFE_ORDER = LIFE_STAGES.map((s) => s.id);
  const SEED_PLACEHOLDERS = {
    name: 'שם ציבורי (HE או EN)…',
    domain: 'example.org',
    organization: 'שם ארגון / חברה…',
    url: 'https://…',
    other: 'Seed ציבורי אחר…',
  };
  const REL_HE = {
    'same-source': 'אותו מקור',
    'same-reference': 'SAME-REFERENCE · typed',
    'same-entity': 'מועמד ישות (לא commit)',
    'related-entity': 'RELATED · קשור',
    related: 'RELATED · קשור',
    'possible-match': 'POSSIBLE · אפשרי',
    possible: 'POSSIBLE · אפשרי',
    unknown: 'UNKNOWN · לא ידוע',
    UNKNOWN: 'UNKNOWN · לא ידוע',
    conflict: 'CONFLICT · סתירה מדווחת',
    CONFLICT: 'CONFLICT · סתירה מדווחת',
    supports: 'תומך',
    corroboration: 'חיזוק הדדי',
    site: 'אתר',
    registry_note: 'הערת רישום',
    org_name: 'שם ארגון',
  };
  /** Soft vocabulary classes — never treat URL-alone as identity. */
  const REL_CLASS = {
    'same-source': 'fact',
    supports: 'fact',
    corroboration: 'cand',
    'same-reference': 'cand',
    'same-entity': 'cand',
    'related-entity': 'related',
    related: 'related',
    'possible-match': 'possible',
    possible: 'possible',
    unknown: 'unk',
    UNKNOWN: 'unk',
    conflict: 'conflict',
    CONFLICT: 'conflict',
  };
  const VOCAB_EN = {
    unk: 'UNKNOWN',
    cand: 'SAME-REFERENCE',
    related: 'RELATED',
    possible: 'POSSIBLE',
    fact: 'PROVENANCE',
    conflict: 'CONFLICT',
  };
  /** Cap SSE reconnect attempts (manual backoff; avoid terminal thrash). */
  const SSE_MAX_RECONNECT = 5;
  const SSE_BOOT_MS = 2800;
  const SSE_BACKOFF_BASE_MS = 400;
  /** Graph canvas view transform — module-level so re-renders keep zoom/pan. */
  const GRAPH_SCALE_MIN = 0.45;
  const GRAPH_SCALE_MAX = 2.75;
  let graphView = { scale: 1, tx: 0, ty: 0 };
  let graphFilter = 'all';
  /** Last SSE status announcement for polite live region (avoid spam). */
  let lastSseLiveText = '';

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]),
    );
  }

  /** Soft family/provider label — passthrough unknown · never invents identity. */
  function labelFamily(id) {
    const raw = String(id || '').trim();
    if (!raw) return '';
    const key = raw.toLowerCase();
    return FAMILY_LABEL_HE[key] || FAMILY_LABEL_HE[raw] || raw;
  }
  function labelFamilyEn(id) {
    const raw = String(id || '').trim();
    if (!raw) return '';
    const key = raw.toLowerCase();
    return FAMILY_LABEL_EN[key] || FAMILY_LABEL_EN[raw] || raw;
  }
  function labelProvider(id) {
    const raw = String(id || '').trim();
    if (!raw) return '';
    const key = raw.toLowerCase();
    return PROVIDER_LABEL_HE[key] || PROVIDER_LABEL_HE[raw] || raw;
  }
  function findingFamilyId(f) {
    if (!f || typeof f !== 'object') return '';
    return (
      f.sourceFamily ||
      f.familyId ||
      f.family ||
      (f.provenance && (f.provenance.sourceFamily || f.provenance.familyId)) ||
      ''
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
  resetGraphView();
  lastSseLiveText = '';
  let selectedFacets = {}; // key -> Set(value)
  let discAbort = null;
  let discTimers = [];
  /** @type {EventSource|null} */
  let discEventSource = null;
  let narrowInFlight = false;

  function readSeedKindFromDom() {
    const pressed = document.querySelector('.disc-seed-type[aria-pressed="true"]');
    if (pressed) return pressed.getAttribute('data-seed-kind') || 'name';
    return 'name';
  }

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
      /** 'sse' | 'poll' | 'fixture' | 'sse→get' | null */
      transport: null,
      /** SSE cursor / last event id (Arch: ordered additive; reconnect resume) */
      cursor: null,
      /** Session status before UI overlay `reconnecting` */
      statusBeforeReconnect: null,
      reconnectAttempt: 0,
      /** Mission progressive stage (Planning→…→Complete) */
      lifeStage: 'PLANNING',
      graph: { nodes: [], edges: [] },
      contradictions: [],
      softEr: null,
      gaps: [],
    urlDomainCandidates: [],
    urlTargets: [],
    generalWebHits: [],
      focusedNodeId: null,
      selectedEdgeId: null,
      graphFilter: 'all',
      seedKind: (typeof document !== 'undefined' && document.querySelector) ? readSeedKindFromDom() : 'name',
      errorMessage: null,
      /** Soft Foundation surface — scrubbed plan summary when Server emits (flag-gated). */
      queryPlan: null,
      serverStage: null,
      /** Soft budget telemetry from plan.budgets / status.budgetExhaustedReason / snapshot. */
      budgetTelemetry: null,
      budgetExhaustedReason: null,
      /** Soft family journal when Server emits (never invents identity). */
      familyJournal: null,
      /** True once an SSE/snapshot graph chunk arrived from Server (soft panel cue). */
      graphFromServer: false,
      /** True once an SSE `plan` event (or snapshot queryPlan) was ingested. */
      planSseSeen: false,
      /** 'server' | 'sse-*' | 'client' — provenance of lifecycle rail stage. */
      stageSource: null,
      /** Soft mission payload (paint-only · never invent · client never enables flags). */
      nightLoop: null,
      frontier: null,
      missionMemory: null,
      stopReason: null,
      hopJournal: null,
    };
  }

  /** Merge list items by id (SSE replay / reconnect — no duplicate spam). */
  function mergeById(existing, incoming) {
    const map = new Map();
    (existing || []).forEach((x) => {
      if (x && x.id != null) map.set(String(x.id), x);
    });
    (incoming || []).forEach((x) => {
      if (!x || x.id == null) return;
      const id = String(x.id);
      map.set(id, { ...(map.get(id) || {}), ...x });
    });
    return [...map.values()];
  }

  /** Belt: strip identity chrome fields from any paint path. */
  function stripIdentityChrome(target) {
    if (!target || typeof target !== 'object') return target;
    delete target.dossier;
    delete target.faces;
    delete target.photoUrl;
    delete target.identityCommit;
    delete target.mayCommitDossier;
    if (Array.isArray(target.findings)) {
      target.findings = target.findings.map((f) => {
        if (!f || typeof f !== 'object') return f;
        const copy = { ...f };
        delete copy.dossier;
        delete copy.faces;
        delete copy.photoUrl;
        delete copy.identityCommit;
        return copy;
      });
    }
    return target;
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
        ? 'DISCOVERY · EVIDENCE · RELATIONSHIPS · NO IDENTITY'
        : 'PUBLIC SOURCES · CITE-OR-DROP';
    }
    const headerSub = document.getElementById('header-sub');
    if (headerSub) {
      headerSub.textContent = disc
        ? 'גילוי ציבורי · ממצאים וראיות סביב seed · לא תיק זהות'
        : 'מקורות ציבוריים · ראיות מצוטטות · בלי ניחושים';
    }
    if (tabEnt) {
      tabEnt.setAttribute('aria-selected', disc ? 'false' : 'true');
      tabEnt.setAttribute('tabindex', disc ? '-1' : '0');
    }
    if (tabDisc) {
      tabDisc.setAttribute('aria-selected', disc ? 'true' : 'false');
      tabDisc.setAttribute('tabindex', disc ? '0' : '-1');
    }
    if (entityWrap) {
      entityWrap.setAttribute('role', 'tabpanel');
      entityWrap.setAttribute('aria-labelledby', 'tab-entity');
    }
    if (discWrap) {
      discWrap.setAttribute('role', 'tabpanel');
      discWrap.setAttribute('aria-labelledby', 'tab-discovery');
    }
    const out = document.getElementById('out');
    if (disc && out && discState.status === 'idle') {
      paintDiscoveryReady();
    } else if (!disc && out && discState.status !== 'idle') {
      // leaving discovery — restore entity ready if out was discovery
      if (out.dataset.surface === 'discovery') {
        out.dataset.surface = '';
        out.className = 'empty-state';
        const skip = document.querySelector('a.skip-link');
        if (skip) skip.setAttribute('href', '#out');
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
    const skip = document.querySelector('a.skip-link');
    if (skip) skip.setAttribute('href', '#out');
    out.dataset.surface = 'discovery';
    out.className = 'empty-state';
    out.innerHTML = `
      <span class="big">DISCOVERY READY</span>
      הזינו seed ציבורי למעלה — שם · דומיין · ארגון · URL · אחר.
      <div class="disc-ready-note">התוצאה היא אוסף ממצאים וראיות סביב הקלט · <strong>לא</strong> זהות · לא תיק · לא «זה האדם».</div>
    `;
  }

  function normalizeRel(rel) {
    const r = String(rel || 'unknown').trim();
    return r || 'unknown';
  }

  function hostnameOf(u) {
    const href = safeUrl(u);
    if (!href) return '';
    try {
      return new URL(href).hostname || '';
    } catch {
      return '';
    }
  }

  /** Track C · search / url_candidate families — always C1 UNKNOWN ceiling (never SAME-ENTITY from title/domain). */
  function isSearchUrlCandidateFinding(f) {
    if (!f || typeof f !== 'object') return false;
    if (f.epistemicState === 'candidate' && f.identityClaim === false && (f.url || f.normalizedUrl)) {
      const fam = String(f.sourceFamily || f.familyId || f.family || f.providerId || f.hostFamily || '').toLowerCase();
      if (/general_web|web_search|url_candidate|search/.test(fam)) return true;
    }
    const kind = String(f.kind || '').toLowerCase();
    if (kind === 'url_candidate' || kind === 'web_search' || kind === 'url') {
      const fam = String(f.sourceFamily || f.familyId || f.family || f.providerId || f.hostFamily || '').toLowerCase();
      if (/general_web|web_search|url_candidate|search|general_web_search/.test(fam) || f.urlCandidate === true) return true;
    }
    if (f.urlCandidate === true || f.searchHit === true) return true;
    const hints = f.facetHints || [];
    if (hints.some((h) => /family:general_web|family:web_search|kind:url_candidate|provider:general_web/i.test(String(h)))) return true;
    return false;
  }

  function isUrlAloneFinding(f, evList) {
    if (!f) return false;
    if (f.urlAlone === true || f.hostFamily === 'web_origin') return true;
    if (isSearchUrlCandidateFinding(f)) return true;
    const kind = String(f.kind || '').toLowerCase();
    if (kind === 'page' || kind === 'url' || kind === 'web_origin' || kind === 'url_candidate' || kind === 'web_search') {
      const rel = normalizeRel(f.relationship || '');
      if (/unknown/i.test(rel) || !f.relationship) {
        const providers = new Set((evList || []).map((e) => e && e.providerId).filter(Boolean));
        if (providers.size <= 1 && !(f.facetHints || []).some((h) => /typed|same-reference/i.test(String(h)))) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Soft vocabulary badge — INFORMATION ≠ IDENTITY.
   * URL-alone never upgrades to SAME-REFERENCE / identity chrome.
   */
  function relBadge(rel, opts = {}) {
    let key = normalizeRel(rel);
    let cls = REL_CLASS[key] || REL_CLASS[key.toLowerCase()] || 'unk';
    if (opts.urlAlone) {
      key = 'unknown';
      cls = 'unk url-alone';
    }
    const label = REL_HE[key] || REL_HE[key.toLowerCase()] || key;
    const en = opts.urlAlone
      ? 'UNKNOWN · URL-alone'
      : VOCAB_EN[cls.split(' ')[0]] || cls.toUpperCase();
    const tone = opts.urlAlone
      ? 'URL alone ≠ identity · soft UNKNOWN'
      : cls.includes('conflict')
        ? 'CONFLICT · שרת דיווח סתירה · לא זהות · לא invented'
        : cls.includes('unk')
          ? 'UNKNOWN soft · לא שקר · לא אישור'
          : cls.includes('related')
            ? 'RELATED · לא merge'
            : cls.includes('possible')
              ? 'POSSIBLE · signal חלקי'
              : cls.includes('cand')
                ? 'SAME-REFERENCE typed · לא SAME-ENTITY'
                : 'provenance-backed · לא זהות';
    return `<span class="disc-badge ${cls}" title="${esc(tone)}" aria-label="${esc(en)}: ${esc(label)}"><span>${esc(label)}</span></span>`;
  }

  function vocabLegend() {
    return `<div class="disc-vocab-legend" aria-label="אוצר מילים רך">
      <span class="lbl">VOCAB</span>
      <span class="disc-badge unk">UNKNOWN</span>
      <span class="disc-badge cand">SAME-REFERENCE</span>
      <span class="disc-badge related">RELATED</span>
      <span class="disc-badge possible">POSSIBLE</span>
      <span class="disc-muted" style="font-size:10px">לא זהות · URL לבד ≠ identity</span>
    </div>`;
  }

  const SERVER_STAGE_MAP = {
    /* Mission rail targets */
    S0: 'PLANNING', S1: 'PLANNING', S2: 'PLANNING', S3: 'FAMILY', S4: 'FAMILY',
    S5: 'FINDING', S6: 'FRONTIER', S7: 'EVIDENCE', S8: 'EVIDENCE', S9: 'EVIDENCE', S10: 'COMPLETE',
    CREATE: 'PLANNING', START: 'PLANNING', PLAN: 'PLANNING', PLANNING: 'PLANNING',
    DISCOVER: 'FAMILY', DISCOVERY: 'FAMILY', FAMILY: 'FAMILY',
    ENRICH: 'FINDING', FINDINGS: 'FINDING', FINDING: 'FINDING',
    EVIDENCE: 'EVIDENCE', CORROBORATE: 'EVIDENCE', RELATIONSHIPS: 'EVIDENCE',
    EXPAND: 'FRONTIER', RECONCILE: 'FRONTIER', GRAPH: 'FRONTIER', FRONTIER: 'FRONTIER',
    FINALIZE: 'COMPLETE', COMPLETE: 'COMPLETE', STOP: 'COMPLETE', ERROR: 'COMPLETE',
  };

  /** Map Foundation/B0 session.stage → product lifecycle id; null if unknown. */
  function mapServerStage(raw) {
    if (raw == null || raw === '') return null;
    const key = String(raw).trim();
    const up = key.toUpperCase();
    if (LIFE_ORDER.includes(up)) return up;
    if (SERVER_STAGE_MAP[up]) return SERVER_STAGE_MAP[up];
    if (SERVER_STAGE_MAP[key]) return SERVER_STAGE_MAP[key];
    return null;
  }

  function noteServerStage(raw, meta = {}) {
    const mapped = mapServerStage(raw);
    if (!mapped) return false;
    const src = meta.source || 'server';
    const strong =
      src === 'server' ||
      src === 'sse-lifecycle' ||
      src === 'sse-phase' ||
      src === 'sse-plan' ||
      src === 'sse-graph' ||
      meta.allowRegress === true;
    const prev = discState.lifeStage;
    const prevIdx = LIFE_ORDER.indexOf(prev);
    const nextIdx = LIFE_ORDER.indexOf(mapped);
    // Soft event-type hints (sse-finding / sse-evidence / sse-rel / sse-event) must not
    // regress an already-advanced rail. Explicit server/lifecycle stages always win.
    if (
      !strong &&
      prevIdx >= 0 &&
      nextIdx >= 0 &&
      nextIdx < prevIdx &&
      mapped !== 'COMPLETE'
    ) {
      return false;
    }
    discState.serverStage = raw;
    discState.lifeStage = mapped;
    discState.stageSource = src;
    return true;
  }

  /**
   * Defensive QueryPlan / SSE `plan` parser.
   * Accepts: { plan }, { queryPlan }, nested plan.plan, snapshot shapes.
   * Never invents planId / seedClass / families — only paints what Server emits.
   * Plan is search-intent only · identityConclusions forced false on paint.
   */
  function parsePlanFromSse(data) {
    if (!data || typeof data !== 'object') return null;
    let raw = null;
    if (data.queryPlan && typeof data.queryPlan === 'object') raw = data.queryPlan;
    else if (data.plan && typeof data.plan === 'object') raw = data.plan;
    else if (data.session && typeof data.session === 'object' && data.session.queryPlan && typeof data.session.queryPlan === 'object') {
      raw = data.session.queryPlan;
    } else if (data.session && typeof data.session === 'object' && data.session.plan && typeof data.session.plan === 'object') {
      raw = data.session.plan;
    } else if (data.payload && typeof data.payload === 'object' && (data.payload.queryPlan || data.payload.plan || data.payload.planId)) {
      return parsePlanFromSse(data.payload);
    } else if (data.planId || data.seedClass || data.intents || data.orderedIntents || data.families || data.sourceFamilies) {
      raw = data;
    }
    if (!raw || typeof raw !== 'object') return null;
    // Nested envelope: { plan: { planId… } } already unwrapped above; one more hop if needed
    if (
      !(raw.planId || raw.id || raw.seedClass || raw.intents || raw.orderedIntents || raw.families || raw.sourceFamilies || raw.budgets) &&
      raw.plan &&
      typeof raw.plan === 'object'
    ) {
      raw = raw.plan;
    }
    if (!raw || typeof raw !== 'object') return null;

    const intentsIn = Array.isArray(raw.intents)
      ? raw.intents
      : Array.isArray(raw.orderedIntents)
        ? raw.orderedIntents
        : [];
    const intents = intentsIn
      .filter((i) => i && typeof i === 'object')
      .map((i) => ({
        intentId: i.intentId || i.intentKey || i.id || null,
        priority: typeof i.priority === 'number' ? i.priority : null,
        sourceFamilies: Array.isArray(i.sourceFamilies) ? i.sourceFamilies.map(String).slice(0, 12) : [],
        reason: i.reason != null ? String(i.reason).slice(0, 200) : null,
      }));

    const families = Array.isArray(raw.families)
      ? raw.families.map(String).slice(0, 24)
      : Array.isArray(raw.sourceFamilies)
        ? raw.sourceFamilies.map(String).slice(0, 24)
        : [];

    let budgets = null;
    if (raw.budgets && typeof raw.budgets === 'object') {
      budgets = {
        maxProviders: raw.budgets.maxProviders,
        maxFamilyCalls: raw.budgets.maxFamilyCalls,
        maxRequests: raw.budgets.maxRequests,
        maxWallMs: raw.budgets.maxWallMs,
        maxProviderMs: raw.budgets.maxProviderMs,
        maxSseLifetimeMs: raw.budgets.maxSseLifetimeMs,
        maxRetries: raw.budgets.maxRetries,
      };
    }

    const reasons = Array.isArray(raw.reasons)
      ? raw.reasons
          .filter((r) => r && typeof r === 'object')
          .map((r) => ({
            target: r.target != null ? String(r.target).slice(0, 80) : null,
            reason: r.reason != null ? String(r.reason).slice(0, 200) : null,
          }))
          .slice(0, 12)
      : [];

    const stopConditions = Array.isArray(raw.stopConditions)
      ? raw.stopConditions.map(String).slice(0, 12)
      : [];

    const planId = raw.planId || raw.id || null;
    const seedClass = raw.seedClass || null;
    // Soft: require at least one recognizable plan signal — else ignore (unstable events)
    if (!planId && !seedClass && !intents.length && !families.length && !budgets) return null;

    return {
      planId: planId ? String(planId).slice(0, 64) : null,
      seedClass: seedClass ? String(seedClass).slice(0, 48) : null,
      seedHash: raw.seedHash != null ? String(raw.seedHash).slice(0, 32) : null,
      intents,
      families,
      budgets,
      reasons,
      stopConditions,
      searchIntentOnly: true,
      identityConclusions: false,
    };
  }

  /**
   * Defensive SSE `graph` parser.
   * Accepts: { graph:{nodes,edges} }, top-level nodes/edges, merge chunks.
   */
  function parseGraphFromSse(data) {
    if (!data || typeof data !== 'object') return null;
    if (data.payload && typeof data.payload === 'object' && (data.payload.graph || data.payload.nodes || data.payload.edges)) {
      return parseGraphFromSse(data.payload);
    }
    const g =
      data.graph && typeof data.graph === 'object'
        ? data.graph
        : data.evidenceGraph && typeof data.evidenceGraph === 'object'
          ? data.evidenceGraph
          : null;
    const nodesIn = Array.isArray(g && g.nodes)
      ? g.nodes
      : Array.isArray(g && g.vertices)
        ? g.vertices
        : Array.isArray(data.nodes)
          ? data.nodes
          : Array.isArray(data.vertices)
            ? data.vertices
            : null;
    const edgesIn = Array.isArray(g && g.edges)
      ? g.edges
      : Array.isArray(g && g.links)
        ? g.links
        : Array.isArray(data.edges)
          ? data.edges
          : Array.isArray(data.links)
            ? data.links
            : null;
    if (nodesIn == null && edgesIn == null) return null;
    const nodes = (nodesIn || [])
      .filter((n) => n && (n.id != null || n.nodeId != null))
      .map((n) => ({
        ...n,
        id: n.id != null ? n.id : n.nodeId,
      }))
      .slice(0, 200);
    const edges = (edgesIn || [])
      .filter((e) => e && (e.id != null || e.from != null || e.source != null || e.to != null || e.target != null))
      .map((e, i) => ({
        ...e,
        id: e.id != null ? e.id : `e-${e.from || e.source || i}-${e.to || e.target || i}`,
        from: e.from != null ? e.from : e.source,
        to: e.to != null ? e.to : e.target,
      }))
      .slice(0, 400);
    return {
      nodes,
      edges,
      meta: (g && g.meta) || data.meta || {},
    };
  }

  /** Soft ingest budget / family journal from any SSE or snapshot payload. */
  function ingestBudgetFamilyFromPayload(data) {
    if (!data || typeof data !== 'object') return;
    if (data.budgetTelemetry && typeof data.budgetTelemetry === 'object') {
      discState.budgetTelemetry = {
        ...(discState.budgetTelemetry || {}),
        ...data.budgetTelemetry,
      };
    }
    if (data.budgetExhaustedReason) {
      discState.budgetExhaustedReason = String(data.budgetExhaustedReason).slice(0, 120);
    }
    if (
      data.budgetTelemetry &&
      data.budgetTelemetry.budgetExhaustedReason &&
      !discState.budgetExhaustedReason
    ) {
      discState.budgetExhaustedReason = String(
        data.budgetTelemetry.budgetExhaustedReason,
      ).slice(0, 120);
    }
    if (Array.isArray(data.familyJournal)) {
      discState.familyJournal = data.familyJournal.slice(0, 80);
    }
    // Mirror plan.budgets → telemetry.limits when Server has not yet sent used/remaining
    const plan = discState.queryPlan;
    if (plan && plan.budgets) {
      const bt = discState.budgetTelemetry || {};
      if (!bt.limits) {
        discState.budgetTelemetry = { ...bt, limits: { ...plan.budgets } };
      }
    }
  }

  /** Apply parsed plan onto discState — soft, never identity. */
  function applyParsedPlan(plan, meta = {}) {
    if (!plan) return false;
    discState.queryPlan = plan;
    discState.planSseSeen = true;
    ingestBudgetFamilyFromPayload({ budgets: plan.budgets, budgetTelemetry: discState.budgetTelemetry });
    if (plan.budgets) {
      const bt = discState.budgetTelemetry || {};
      discState.budgetTelemetry = { ...bt, limits: { ...(bt.limits || {}), ...plan.budgets } };
    }
    if (meta.source) discState.stageSource = meta.source;
    return true;
  }

  /** Merge parsed graph chunk — soft panel; marks graphFromServer. */
  function applyParsedGraph(parsed, meta = {}) {
    if (!parsed) return false;
    const prev = discState.graph || { nodes: [], edges: [] };
    discState.graph = {
      nodes: mergeById(prev.nodes || [], parsed.nodes || []),
      edges: mergeById(prev.edges || [], parsed.edges || []),
      meta: { ...(prev.meta || {}), ...(parsed.meta || {}) },
    };
    discState.graphFromServer = true;
    if (meta.source) discState.stageSource = meta.source;
    return true;
  }

  /** Soft Frontier presence — paint only when Server/payload already carries it. */
  function hasFrontierData(state) {
    if (!state || typeof state !== 'object') return false;
    const fr = state.frontier;
    if (fr && typeof fr === 'object') {
      if (typeof fr.size === 'number' && fr.size > 0) return true;
      if (Array.isArray(fr.items) && fr.items.length > 0) return true;
      if (Array.isArray(fr.keys) && fr.keys.length > 0) return true;
    }
    const mm = state.missionMemory;
    if (mm && typeof mm === 'object') {
      if (Array.isArray(mm.frontierDigest) && mm.frontierDigest.length > 0) return true;
    }
    const nl = state.nightLoop;
    if (nl && typeof nl === 'object' && nl.frontier && typeof nl.frontier === 'object') {
      if (typeof nl.frontier.size === 'number' && nl.frontier.size > 0) return true;
      if (Array.isArray(nl.frontier.items) && nl.frontier.items.length > 0) return true;
    }
    return false;
  }

  /** Wave depth from nightLoop / missionMemory / hopJournal — never invent. */
  function missionWave(state) {
    if (!state) return 0;
    const nl = state.nightLoop || {};
    const mm = state.missionMemory || {};
    const fromNl = Number(nl.wave || nl.waveDepth || nl.maxWaveSeen || 0) || 0;
    const fromMm = Number(mm.wave || 0) || 0;
    const journal = state.hopJournal || nl.hopJournal || mm.waves || [];
    let fromJ = 0;
    if (Array.isArray(journal)) {
      journal.forEach((h) => {
        const w = Number(h && (h.wave || h.waveId || h.w)) || 0;
        if (w > fromJ) fromJ = w;
      });
    }
    return Math.max(fromNl, fromMm, fromJ);
  }

  /**
   * Honest stopReason copy (§09) — NO_PROGRESS with wave≥2 ≠ failure.
   * Soft ≠ Acc · never invent reasons.
   */
  function stopReasonCopy(reason, state) {
    const r = String(reason || '').trim().toUpperCase();
    if (!r) return null;
    const wave = missionWave(state);
    const he = {
      NO_PROGRESS:
        wave >= 2
          ? ('NO_PROGRESS · לולאה הסתיימה (wave≥' + wave + ') · אין URL חדשים — לא כשל מערכת')
          : 'NO_PROGRESS · אין התקדמות נוספת כרגע · לא בהכרח כשל',
      EMPTY_FRONTIER: 'EMPTY_FRONTIER · חזית ריקה · אין מועמדים להרחבה',
      ALL_HOPS_SETTLED: 'ALL_HOPS_SETTLED · כל הקפיצות הסתיימו למשימה זו',
      BUDGET: 'BUDGET · תקציב גילוי מוצה · תוצאה חלקית',
      MAX_WAVES: 'MAX_WAVES · הגיע לתקרת גלים',
      POLICY_HOLD: 'POLICY_HOLD · מדיניות עצרה הרחבה',
      SAFETY: 'SAFETY · עצירה בטיחותית',
      EMPTY_PLAN: 'EMPTY_PLAN · אין תוכנית חיפוש',
      FLAG_OFF: 'FLAG_OFF · יכולת כבויה בצד שרת · הלקוח לא מדליק דגלים',
    };
    const en = {
      NO_PROGRESS:
        wave >= 2
          ? ('NO_PROGRESS · loop settled (wave≥' + wave + ') · no new URLs — not a system failure')
          : 'NO_PROGRESS · no further progress for now · not necessarily failure',
      EMPTY_FRONTIER: 'EMPTY_FRONTIER · empty expand queue · no candidates to expand',
      ALL_HOPS_SETTLED: 'ALL_HOPS_SETTLED · all hops settled for this mission',
      BUDGET: 'BUDGET · discovery budget exhausted · partial result',
      MAX_WAVES: 'MAX_WAVES · wave ceiling reached',
      POLICY_HOLD: 'POLICY_HOLD · policy stopped expand',
      SAFETY: 'SAFETY · safety stop',
      EMPTY_PLAN: 'EMPTY_PLAN · no search plan',
      FLAG_OFF: 'FLAG_OFF · server capability off · client never enables flags',
    };
    return {
      code: r,
      he: he[r] || (r + ' · סיבת עצירה מדווחת מהשרת'),
      en: en[r] || (r + ' · server-reported stop'),
      wave,
      settledOk: r === 'NO_PROGRESS' && wave >= 2,
    };
  }

  /** CONFLICT only when Server already emitted it — never invent from UNKNOWN. */
  function serverEmitsConflict(f, state) {
    if (f && typeof f === 'object') {
      const rel = String(f.relationship || f.relationshipState || '').toUpperCase();
      if (rel === 'CONFLICT') return true;
      if (f.conflict === true || f.hasConflict === true) return true;
      if (Array.isArray(f.conflicts) && f.conflicts.length) return true;
    }
    if (state && Array.isArray(state.contradictions)) {
      return state.contradictions.some((c) => {
        if (!c) return false;
        const k = String(c.kind || c.type || c.code || '').toUpperCase();
        return k === 'CONFLICT' || k === 'CONTRADICTION' || c.conflict === true;
      });
    }
    return false;
  }

  /** Ingest soft mission fields from snapshot/SSE — passthrough only. */
  function ingestMissionFields(target, payload) {
    if (!target || !payload || typeof payload !== 'object') return target;
    const nl = payload.nightLoop || (payload.session && payload.session.nightLoop) || null;
    if (nl && typeof nl === 'object') target.nightLoop = nl;
    const fr =
      payload.frontier ||
      (payload.session && payload.session.frontier) ||
      (nl && nl.frontier) ||
      null;
    if (fr && typeof fr === 'object') target.frontier = fr;
    const mm =
      payload.missionMemory ||
      (payload.session && payload.session.missionMemory) ||
      null;
    if (mm && typeof mm === 'object') target.missionMemory = mm;
    const sr =
      payload.stopReason ||
      (nl && nl.stopReason) ||
      (mm && mm.lastDecision && mm.lastDecision.reason) ||
      (payload.progress && payload.progress.stopReason) ||
      null;
    if (sr) target.stopReason = String(sr);
    const hj =
      (Array.isArray(payload.hopJournal) && payload.hopJournal) ||
      (nl && Array.isArray(nl.hopJournal) && nl.hopJournal) ||
      null;
    if (hj) target.hopJournal = hj;
    return target;
  }

  function deriveLifeStage(state) {
    const st = state.status;
    // Prefer Foundation/B0 / SSE stage when present — local heuristic is fallback only.
    // Never invent identity; stage labels are process UX only (Mission rail).
    const mapped = mapServerStage(state.serverStage || state.progress?.stage || state.progress?.lifecyclePhase);
    if (mapped) {
      if (!state.stageSource || state.stageSource === 'client') {
        state.stageSource = state.serverStage ? 'server' : 'server';
      }
      if ((st === 'complete' || st === 'failed_soft') && mapped !== 'COMPLETE') {
        state.stageSource = (state.stageSource || 'server') + '+terminal';
        return 'COMPLETE';
      }
      return mapped;
    }
    state.stageSource = 'client';
    if (st === 'complete' || st === 'failed_soft') return 'COMPLETE';
    if (st === 'idle') return 'PLANNING';
    const findingsN = (state.findings || []).length;
    const evidenceN = (state.evidence || []).length;
    const edgesN = ((state.graph && state.graph.edges) || []).length;
    const providers = state.providers || {};
    const anyProvider = Object.keys(providers).length > 0;
    const planFamilies =
      (state.queryPlan &&
        (Array.isArray(state.queryPlan.families) ? state.queryPlan.families : state.queryPlan.sourceFamilies)) ||
      [];
    const anyFamily =
      anyProvider ||
      (Array.isArray(state.familyJournal) && state.familyJournal.length > 0) ||
      (Array.isArray(planFamilies) && planFamilies.length > 0);
    if (st === 'reconnecting') return state.lifeStage || 'FAMILY';
    if (hasFrontierData(state) && findingsN > 0) return 'FRONTIER';
    if (evidenceN > 0 || edgesN > 0) return 'EVIDENCE';
    if (findingsN > 0) return 'FINDING';
    if (anyFamily) return 'FAMILY';
    if (state.planSseSeen || state.queryPlan) return 'PLANNING';
    if (st === 'running' || st === 'partial') return 'PLANNING';
    return 'PLANNING';
  }

  /** Soft Frontier readout — only when data present · Soft ≠ Acc. */
  function renderFrontierReadout() {
    if (!hasFrontierData(discState)) return '';
    const fr = discState.frontier || (discState.nightLoop && discState.nightLoop.frontier) || {};
    const mm = discState.missionMemory || {};
    const size =
      typeof fr.size === 'number'
        ? fr.size
        : Array.isArray(fr.items)
          ? fr.items.length
          : Array.isArray(mm.frontierDigest)
            ? mm.frontierDigest.length
            : 0;
    const keys = Array.isArray(fr.keys)
      ? fr.keys
      : Array.isArray(mm.frontierDigest)
        ? mm.frontierDigest
        : [];
    const preview = keys.slice(0, 4).map((k) => esc(String(k).slice(0, 48))).join(' · ');
    const wave = missionWave(discState);
    return `<div class="disc-frontier-readout" role="status" data-frontier-size="${esc(size)}" title="Frontier soft · expand queue · לא זהות · Soft≠Acc">
      <span class="disc-frontier-k">FRONTIER</span>
      <span class="disc-frontier-v">${esc(size)} בתור הרחבה${wave ? ` · wave ${esc(wave)}` : ''}</span>
      ${preview ? `<span class="disc-frontier-keys">${preview}</span>` : ''}
      <span class="disc-muted">מועמדים להרחבה · לא זהות · לא Acc</span>
    </div>`;
  }

  function renderStopReasonChip() {
    const raw =
      discState.stopReason ||
      (discState.nightLoop && discState.nightLoop.stopReason) ||
      (discState.missionMemory &&
        discState.missionMemory.lastDecision &&
        discState.missionMemory.lastDecision.reason) ||
      null;
    const copy = stopReasonCopy(raw, discState);
    if (!copy) return '';
    const cls = copy.settledOk ? 'disc-stop-settled' : 'disc-stop-info';
    return `<span class="disc-source-tag disc-stop-tag ${cls}" title="${esc(copy.en)}" data-stop-reason="${esc(copy.code)}">${esc(copy.he)}</span>`;
  }


  /* —— Lane L4 · gaps + officialWebsite QUICK READ · why-found (flags stay OFF) —— */
  const GAP_KIND_HE = {
    no_official_website: 'אין אתר רשמי מאומת',
    missing_independent_source: 'חסר מקור עצמאי',
    thin: 'כיסוי דל (thin)',
    no_findings: 'לא נאספו ממצאים',
    soft_er: 'softEntityResolve = candidate — לא עובדה',
    identity_ceiling: 'תקרת זהות — facets ≠ אמת זהות',
    provider_error: 'מקור נכשל',
    provider_skipped: 'מקור דולג',
    provider_partial: 'מקור חלקי',
    provider_pending: 'מקור לא הסתיים',
    unknown_rel: 'קשרים מסומנים UNKNOWN',
    budget: 'תקציב גילוי מוצה',
    contradiction: 'סתירה מדווחת',
  };

  function humanizeGap(g) {
    if (!g) return '';
    if (g.labelHe) return String(g.labelHe);
    if (g.label) return String(g.label);
    const k = String(g.kind || g.type || g.code || '').trim();
    if (!k) return 'פער לא מסווג · לא זהות';
    return GAP_KIND_HE[k] || GAP_KIND_HE[k.toLowerCase()] || k;
  }

  function parseFacetHintKv(h) {
    const s = String(h || '');
    const i = s.indexOf(':');
    if (i <= 0) return null;
    return { key: s.slice(0, i).trim(), value: s.slice(i + 1).trim() };
  }

  function isOfficialWebsiteKey(k) {
    return /^(officialWebsite|official_website|officialWebsiteUrl|officialWebsiteUrls|P856|p856)$/i.test(
      String(k || ''),
    );
  }

  /** Soft-collect officialWebsite / P856 URL candidates from facets + finding hints/fields + L1 plan surfaces. */
  function collectOfficialWebsiteCandidates(state) {
    const out = [];
    const seen = new Set();
    const push = (url, meta) => {
      const u = String(url || '').trim();
      if (!u || seen.has(u)) return;
      if (!/^https?:\/\//i.test(u) && !/^[a-z0-9.-]+\.[a-z]{2,}/i.test(u)) return;
      seen.add(u);
      out.push({
        url: u,
        provenance: meta.source || 'payload',
        findingId: meta.findingId || null,
        key: meta.key || 'officialWebsite',
        whyFound: meta.whyFound || '',
      });
    };
    (state.facets || []).forEach((f) => {
      if (!isOfficialWebsiteKey(f.key)) return;
      (f.buckets || f.values || []).forEach((b) => {
        const v = typeof b === 'string' ? b : b && (b.value || b.label);
        push(v, { source: 'facet', key: f.key });
      });
    });
    (state.findings || []).forEach((f) => {
      (f.facetHints || []).forEach((h) => {
        const kv = parseFacetHintKv(h);
        if (kv && isOfficialWebsiteKey(kv.key)) {
          push(kv.value, { source: 'facetHint', findingId: f.id, key: kv.key });
        }
      });
      ['officialWebsite', 'officialWebsiteUrl', 'official_website'].forEach((k) => {
        if (f[k]) push(f[k], { source: 'field', findingId: f.id, key: k });
      });
      const arr = f.officialWebsiteUrls || f.official_website_urls;
      if (Array.isArray(arr)) {
        arr.forEach((u) => push(u, { source: 'field', findingId: f.id, key: 'officialWebsiteUrls' }));
      }
      // L1 web_origin findings (hostFamily) — candidate URLs only · C1 UNKNOWN
      if (f.hostFamily === 'web_origin' || f.urlAlone === true) {
        const u = f.normalizedUrl || f.url || f.provenanceUrl || f.title;
        if (u && /^https?:\/\//i.test(String(u))) {
          push(u, {
            source: 'web_origin_finding',
            findingId: f.id,
            key: 'web_origin',
            whyFound: whyFoundText(f) || 'web_origin finding · URL-alone UNKNOWN',
          });
        }
      }
    });
    // L1 · session urlDomainCandidates (emit scrubbed)
    const udc = state.urlDomainCandidates || state.url_domain_candidates || [];
    if (Array.isArray(udc)) {
      udc.forEach((c) => {
        if (!c || typeof c !== 'object') return;
        const u = c.url || c.normalizedUrl || c.href;
        const why = Array.isArray(c.whyFound)
          ? c.whyFound.filter(Boolean).join(' · ')
          : c.whyFound || c.why_found || '';
        push(u, {
          source: 'urlDomainCandidates',
          findingId: c.findingId || null,
          key: c.source || c.method || 'urlDomainCandidates',
          whyFound: why,
        });
      });
    }
    // L1 · plan.urlTargets (allowed/blocked/unsafe) — show URL as candidate; never identity
    const plan = state.queryPlan || state.plan || null;
    const targets = (plan && plan.urlTargets) || state.urlTargets || [];
    if (Array.isArray(targets)) {
      targets.forEach((t) => {
        if (!t || typeof t !== 'object') return;
        const u = t.url || t.href;
        const safety = t.safety || t.status || '';
        push(u, {
          source: 'urlTargets',
          findingId: null,
          key: t.source || t.claim || 'urlTargets',
          whyFound: safety
            ? `plan urlTarget · safety=${safety} · ${t.source || t.claim || 'P856'} · לא זהות`
            : `plan urlTarget · ${t.source || 'P856'} · לא זהות`,
        });
      });
    }
    return out;
  }

  /** Track C · soft-collect search-sourced URL candidates (fixture / future Server generalWebSearch). */
  function collectSearchUrlCandidates(state) {
    const out = [];
    const seen = new Set();
    const push = (url, meta) => {
      const u = String(url || '').trim();
      if (!u || seen.has(u)) return;
      if (!/^https?:\/\//i.test(u) && !/^[a-z0-9.-]+\.[a-z]{2,}/i.test(u)) return;
      seen.add(u);
      out.push({
        url: u,
        provenance: meta.source || 'search',
        findingId: meta.findingId || null,
        whyFound: meta.whyFound || '',
        key: meta.key || 'urlCandidate',
      });
    };
    (state.findings || []).forEach((f) => {
      if (!isSearchUrlCandidateFinding(f) && !isUrlAloneFinding(f, [])) return;
      // Prefer explicit search-shaped findings for this strip (skip pure P856 OW unless also search)
      if (!isSearchUrlCandidateFinding(f)) return;
      const u = f.normalizedUrl || f.url || f.provenanceUrl || '';
      const why = whyFoundText(f);
      push(u, {
        source: f.sourceFamily || f.providerId || f.hostFamily || 'general_web',
        findingId: f.id,
        whyFound: why,
        key: 'urlCandidate',
      });
    });
    // Soft passthrough session.urlDomainCandidates with search-ish methods
    const udc = state.urlDomainCandidates || [];
    if (Array.isArray(udc)) {
      udc.forEach((c) => {
        if (!c || typeof c !== 'object') return;
        const method = String(c.method || c.extractionMethod || (Array.isArray(c.whyFound) ? c.whyFound.join(' ') : c.whyFound) || '');
        if (!/search|serp|general_web|snippet|web_search/i.test(method) && c.source !== 'general_web_search') return;
        const why = Array.isArray(c.whyFound) ? c.whyFound.filter(Boolean).join(' · ') : c.whyFound || method;
        push(c.url || c.normalizedUrl, {
          source: 'urlDomainCandidates',
          findingId: c.findingId || null,
          whyFound: why,
          key: 'urlCandidate',
        });
      });
    }
    // Soft passthrough generalWebHits / searchHits if Server emits
    const hits = state.generalWebHits || state.searchHits || state.general_web_hits || [];
    if (Array.isArray(hits)) {
      hits.forEach((h) => {
        if (!h || typeof h !== 'object') return;
        push(h.url || h.href, {
          source: 'generalWebHits',
          findingId: h.id || null,
          whyFound: h.whyFound || h.snippet || 'search hit · candidate · לא זהות',
          key: 'urlCandidate',
        });
      });
    }
    return out;
  }

  /**
   * why-found for URL / officialWebsite candidates.
   * Prefer server whyFound / why_found; soft WD P856 fallback only when payload cites that shape.
   */
  function whyFoundText(f) {
    if (!f || typeof f !== 'object') return '';
    let raw =
      f.whyFound ||
      f.why_found ||
      f.whyFoundReason ||
      f.discoveryReason ||
      (f.provenance && (f.provenance.whyFound || f.provenance.reason)) ||
      '';
    if (Array.isArray(raw)) raw = raw.filter(Boolean).join(' · ');
    if (String(raw).trim()) return String(raw).trim();
    const hints = f.facetHints || [];
    const owHint = hints.map(parseFacetHintKv).find((kv) => kv && isOfficialWebsiteKey(kv.key));
    const fromWd =
      (f.providers || []).some((p) => /wikidata/i.test(String(p))) ||
      hints.some((h) => /provider:wikidata|family:wikidata|wikidata/i.test(String(h))) ||
      /wikidata/i.test(String(f.sourceFamily || f.familyId || f.family || ''));
    if (owHint && fromWd) {
      return 'מועמד מאתר רשמי בויקידאטה (P856) · מועמד בלבד · לא זהות · URL לבד = UNKNOWN';
    }
    if (owHint) {
      return 'מועמד מפן officialWebsite ב־payload · לא מאומת · לא זהות';
    }
    if (
      (f.facetHints || []).some((h) => /sourceClaim:P856|wikidata_p856|source:wikidata_p856/i.test(String(h))) ||
      /wikidata_p856|P856/i.test(String(f.sourceFinding || f.source || ''))
    ) {
      return 'מועמד מ־P856 (ויקידאטה) · מועמד בלבד · לא זהות · URL לבד = UNKNOWN';
    }
    // Track C · search / snippet shape — only when payload cites search provenance
    if (isSearchUrlCandidateFinding(f)) {
      const snip = f.snippet || f.searchSnippet || (f.provenance && f.provenance.snippet) || '';
      if (snip) {
        return `מועמד מחיפוש ווב · ציטוט/snippet · לא זהות · C1: כותרת/דומיין ≠ SAME-ENTITY · «${String(snip).slice(0, 120)}»`;
      }
      return 'מועמד מחיפוש ווב / url_candidate · לא מאומת · לא זהות · URL/כותרת ≠ SAME-ENTITY';
    }
    return '';
  }

  /** Soft-merge officialWebsite facet group when only finding hints carry URLs. */
  function facetsWithOfficialWebsite(state) {
    const base = Array.isArray(state.facets) ? state.facets.slice() : [];
    if (base.some((f) => isOfficialWebsiteKey(f.key))) return base;
    const cands = collectOfficialWebsiteCandidates(state);
    if (!cands.length) return base;
    base.push({
      key: 'officialWebsite',
      label: FACET_LABEL_HE.officialWebsite || 'אתר רשמי (מועמד)',
      buckets: cands.slice(0, 12).map((c) => ({ value: c.url, count: 1 })),
    });
    return base;
  }

  function facetsWithSearchUrlCandidates(state) {
    const base = facetsWithOfficialWebsite(state);
    if (base.some((f) => /^(urlCandidate|searchUrl|generalWeb)$/i.test(String(f.key)))) return base;
    const cands = collectSearchUrlCandidates(state);
    if (!cands.length) return base;
    base.push({
      key: 'urlCandidate',
      label: FACET_LABEL_HE.urlCandidate || 'URL מועמד (חיפוש)',
      buckets: cands.slice(0, 12).map((c) => ({ value: c.url, count: 1 })),
    });
    return base;
  }

  function computeGaps(state) {
    const gaps = [];
    const providers = state.providers || {};
    Object.entries(providers).forEach(([id, s]) => {
      if (s === 'error') gaps.push({ kind: 'provider_error', label: `מקור ${id} נכשל (שגיאה) — לא no-match` });
      else if (s === 'skipped') gaps.push({ kind: 'provider_skipped', label: `מקור ${id} דולג` });
      else if (s === 'partial') gaps.push({ kind: 'provider_partial', label: `מקור ${id} חלקי` });
      else if (s === 'pending' && (state.status === 'complete' || state.status === 'partial' || state.status === 'failed_soft')) {
        gaps.push({ kind: 'provider_pending', label: `מקור ${id} לא הסתיים` });
      }
    });
    const edges = (state.graph && state.graph.edges) || [];
    const unkEdges = edges.filter((e) => /unknown/i.test(String(e.relationship || e.kind || '')));
    if (unkEdges.length) {
      gaps.push({
        kind: 'unknown_rel',
        label: `${unkEdges.length} קשרים מסומנים UNKNOWN — אינו שקר ואינו אישור זהות`,
      });
    }
    if ((state.findings || []).length === 0 && (state.status === 'complete' || state.status === 'partial' || state.status === 'failed_soft')) {
      gaps.push({ kind: 'no_findings', label: 'לא נאספו ממצאים — ייתכן כיסוי חלקי או seed דל · thin ≠ no-match' });
    }
    if (state.budgetExhaustedReason) {
      gaps.push({
        kind: 'budget',
        label: `תקציב גילוי מוצה · ${state.budgetExhaustedReason} — תוצאה חלקית · לא זהות`,
      });
    }
    if (
      (state.findings || []).length > 0 &&
      (state.findings || []).length <= 2 &&
      (state.status === 'complete' || state.status === 'partial')
    ) {
      gaps.push({
        kind: 'thin',
        label: 'כיסוי דל (thin) — מעט ממצאים · אינו מאשר או שולל זהות',
      });
    }
    const soft = state.softEr;
    if (soft && soft.status === 'candidate') {
      gaps.push({ kind: 'soft_er', label: 'softEntityResolve = candidate — לא עובדה, לא זהות' });
    }
    (state.contradictions || []).forEach((c, i) => {
      gaps.push({ kind: 'contradiction', label: c.summary || c.note || `סתירה #${i + 1}` });
    });
    (state.gaps || []).forEach((g) => {
      if (!g) return;
      const label = humanizeGap(g);
      if (label) gaps.push({ kind: g.kind || g.type || 'gap', label, action: g.action || g.hint || '' });
    });
    // L4 · honest surface gaps from payload absence (not invented world-facts)
    const terminal =
      state.status === 'complete' || state.status === 'partial' || state.status === 'failed_soft';
    if (terminal) {
      const ow = collectOfficialWebsiteCandidates(state);
      if (!ow.length && !gaps.some((g) => g.kind === 'no_official_website')) {
        gaps.push({
          kind: 'no_official_website',
          label: GAP_KIND_HE.no_official_website,
          action: 'אין P856/officialWebsite ב־payload הנוכחי · לא אומר שאין אתר בעולם',
        });
      }
      const providers = new Set();
      (state.findings || []).forEach((f) => (f.providers || []).forEach((p) => providers.add(String(p))));
      Object.keys(state.providers || {}).forEach((p) => providers.add(p));
      if (
        providers.size <= 1 &&
        (state.findings || []).length > 0 &&
        !gaps.some((g) => g.kind === 'missing_independent_source')
      ) {
        gaps.push({
          kind: 'missing_independent_source',
          label: GAP_KIND_HE.missing_independent_source,
          action: 'כיסוי ספק/משפחה יחיד במשטח · דרוש מקור עצמאי לאימות',
        });
      }
    }
    // dedupe by label
    const seen = new Set();
    return gaps.filter((g) => {
      const k = g.label;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  function ensureGraph(state) {
    const g = state.graph && typeof state.graph === 'object' ? state.graph : { nodes: [], edges: [] };
    let nodes = Array.isArray(g.nodes) ? g.nodes.slice() : [];
    let edges = Array.isArray(g.edges) ? g.edges.slice() : [];
    const meta = g.meta && typeof g.meta === 'object' ? { ...g.meta } : {};
    // Server graph wins when present (even if sparse) — soft panel, no derived laundering over it
    if (state.graphFromServer && (nodes.length || edges.length)) {
      return { nodes, edges, meta: { ...meta, source: 'server' } };
    }
    if (!nodes.length && (state.findings || []).length) {
      nodes = [
        { id: 'seed', kind: 'seed', label: state.q || 'seed' },
        ...state.findings.slice(0, 24).map((f) => ({
          id: f.id,
          kind: 'finding',
          label: f.title,
        })),
      ];
      // Derive weak supports edges finding→seed (display only; not laundering)
      edges = state.findings.slice(0, 24).map((f, i) => ({
        id: `supports-${i}`,
        kind: 'supports',
        from: f.id,
        to: 'seed',
        relationship: 'supports',
        derived: true,
      }));
      meta.source = 'client-derived';
      meta.soft = true;
    }
    return { nodes, edges, meta };
  }

  function highValueFindings(list) {
    const arr = (list || []).slice();
    arr.sort((a, b) => (Number(b.scoreFinding) || 0) - (Number(a.scoreFinding) || 0));
    return arr;
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
      if (ok) {
        announceFacetNarrow({ source: 'server' });
        return;
      }
      // graceful degrade: client-side filter only
      discState.narrowSource = 'client';
    } else {
      discState.narrowSource = Object.keys(selectedFacets).length ? 'client' : 'none';
    }
    renderDiscovery();
    announceFacetNarrow({ source: discState.narrowSource || 'client' });
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

  /** Premium empty / thin / UNKNOWN soft card — never identity chrome. */
  function renderPremiumEmpty(opts = {}) {
    const kind = opts.kind || 'generic';
    const title = opts.title || 'אין נתונים עדיין';
    const body = opts.body || '';
    const soft = opts.soft !== false;
    const hint = opts.hint || '';
    const actions = opts.actions || '';
    return `<div class="disc-empty-premium${soft ? ' soft' : ''}" data-empty="${esc(kind)}" role="status">
      <div class="disc-empty-kicker">${esc(title)}</div>
      ${body ? `<p class="disc-empty-body">${body}</p>` : ''}
      ${hint ? `<div class="disc-empty-hint">${esc(hint)}</div>` : ''}
      ${actions ? `<div class="disc-empty-actions">${actions}</div>` : ''}
    </div>`;
  }

  /** Soft QueryPlan / Family / Budget strip — paint only when Server emitted. */
  function renderPlanBudgetPanel() {
    const plan = discState.queryPlan;
    const bt = discState.budgetTelemetry || {};
    const limits = (bt.limits || (plan && plan.budgets) || {}) || {};
    const used = bt.used || {};
    const remaining = bt.remaining || {};
    const families =
      (plan && plan.families) ||
      (Array.isArray(discState.familyJournal)
        ? [...new Set(discState.familyJournal.map((j) => j && j.familyId).filter(Boolean))]
        : []);
    const intents = (plan && plan.intents) || [];
    const exhausted = discState.budgetExhaustedReason || bt.budgetExhaustedReason || null;

    if (!plan && !families.length && !Object.keys(limits).length && !exhausted) {
      // Waiting soft cue during PLANNING when stream is live but plan flag OFF / not yet arrived
      const life = discState.lifeStage || '';
      if (
        (life === 'PLANNING' || life === 'START' || discState.status === 'running') &&
        !(discState.findings || []).length
      ) {
        return `<div class="disc-plan-panel soft-wait" aria-label="תכנון גילוי">
          <div class="disc-plan-head"><span class="k">QUERY PLAN</span><span class="s">ממתין ל-SSE · plan ≠ זהות</span></div>
          <p class="disc-plan-blurb">Foundation עשוי להנפיק אירוע <code>plan</code> (flag-gated). עד אז — אין המצאת תוכנית.</p>
        </div>`;
      }
      return '';
    }

    const famChips = (families || [])
      .slice(0, 12)
      .map((f) => `<span class="disc-fam-chip">${esc(f)}</span>`)
      .join('');

    const budgetKeys = [
      ['maxProviders', 'providers', 'providers'],
      ['maxFamilyCalls', 'familyCalls', 'family'],
      ['maxRequests', 'requests', 'req'],
      ['maxWallMs', 'wallMs', 'wall'],
    ];
    const meters = budgetKeys
      .map(([limKey, usedKey, label]) => {
        const lim = limits[limKey];
        if (lim == null || lim === '') return '';
        const u = used[usedKey] != null ? used[usedKey] : used[limKey];
        const rem = remaining[usedKey] != null ? remaining[usedKey] : remaining[limKey];
        let pct = null;
        if (typeof lim === 'number' && lim > 0 && typeof u === 'number') {
          pct = Math.min(100, Math.round((u / lim) * 100));
        }
        const val =
          u != null
            ? `${u}/${lim}`
            : rem != null
              ? `≤${lim} · rem ${rem}`
              : String(lim);
        return `<div class="disc-budget-meter" title="${esc(limKey)}">
          <div class="bk">${esc(label)}</div>
          <div class="bv">${esc(val)}</div>
          ${pct != null ? `<div class="bb" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>` : ''}
        </div>`;
      })
      .filter(Boolean)
      .join('');

    const intentBits = intents
      .slice(0, 4)
      .map((i) => {
        const id = i.intentId || 'intent';
        const fams = (i.sourceFamilies || []).slice(0, 3).join(', ');
        return `<li><span class="mono">${esc(id)}</span>${fams ? ` · <span class="disc-muted">${esc(fams)}</span>` : ''}${i.reason ? ` · ${esc(String(i.reason).slice(0, 80))}` : ''}</li>`;
      })
      .join('');

    const seedClass = plan && plan.seedClass
      ? `<span class="disc-source-tag disc-plan-tag" title="seedClass · soft · not identity">class:${esc(plan.seedClass)}</span>`
      : '';
    const planId = plan && (plan.planId || plan.id)
      ? `<span class="disc-source-tag disc-plan-tag" title="QueryPlan id · Foundation · soft">plan:${esc(plan.planId || plan.id)}</span>`
      : plan
        ? `<span class="disc-source-tag disc-plan-tag">plan:ready</span>`
        : '';

    return `<div class="disc-plan-panel disc-plan-hierarchy" aria-label="תוכנית גילוי · QueryPlan soft">
      <div class="disc-plan-head">
        <span class="k">QUERY PLAN · FAMILY · BUDGET</span>
        <span class="s">search-intent only · לא זהות</span>
        ${planId}${seedClass}
        ${exhausted ? `<span class="disc-source-tag disc-budget-exh" title="budget exhaust · soft terminal">budget:${esc(exhausted)}</span>` : ''}
      </div>
      ${famChips ? `<div class="disc-fam-row" aria-label="source families">${famChips}</div>` : ''}
      ${meters ? `<div class="disc-budget-row" aria-label="budget caps">${meters}</div>` : ''}
      ${intentBits ? `<ol class="disc-intent-list">${intentBits}</ol>` : ''}
      <p class="disc-plan-blurb">תוכנית / משפחה / תקציב הם איתותי חיפוש בלבד. <strong>plan ≠ identity</strong> · INFORMATION ≠ IDENTITY.</p>
    </div>`;
  }


  /** Connection / stream chip — process UX only · never identity. */
  function connectionChip() {
    const st = discState.status;
    const tx = discState.transport || '';
    let kind = 'idle';
    let label = 'מוכן';
    if (st === 'reconnecting') { kind = 'reconnecting'; label = 'מתחבר מחדש'; }
    else if (st === 'running' || st === 'partial') {
      kind = tx === 'sse' || tx === 'sse→get' ? 'live' : 'searching';
      label = kind === 'live' ? 'חי · SSE' : 'מחפש…';
    } else if (st === 'complete') { kind = 'complete'; label = 'הושלם'; }
    else if (st === 'failed_soft') { kind = 'failed'; label = 'חלקי / שגיאה'; }
    else if (st === 'idle') { kind = 'idle'; label = 'מוכן'; }
    return `<span class="disc-conn-chip disc-conn-${kind}" data-conn="${esc(kind)}" title="מצב חיבור · לא זהות">${esc(label)}</span>`;
  }

  function renderProgressStrip() {
    const st = discState.status;
    const prog = discState.progress || {};
    const providers = discState.providers || {};
    const done = Object.values(providers).filter((s) => s && s !== 'pending').length;
    const total = Object.keys(providers).length || prog.totalHint || 0;
    const findingsN = (discState.findings || []).length;
    const label = STATUS_HE[st] || st;
    const stClass =
      st === 'reconnecting'
        ? ' reconnecting'
        : st === 'failed_soft'
          ? ' failed'
          : st === 'complete'
            ? ' complete'
            : st === 'partial'
              ? ' partial'
              : '';
    const reconnectHint =
      st === 'reconnecting' && discState.reconnectAttempt
        ? ` <span class="disc-source-tag">#${esc(discState.reconnectAttempt)}/${SSE_MAX_RECONNECT}</span>`
        : '';
    const life = discState.lifeStage || deriveLifeStage(discState);
    const lifeIdx = LIFE_ORDER.indexOf(life);
    const stagesHtml = LIFE_STAGES.map((s, i) => {
      let cls = 'pending';
      let cur = '';
      if (i < lifeIdx) cls = 'done';
      else if (i === lifeIdx) { cls = 'active'; cur = ' aria-current="step"'; }
      if (life === 'COMPLETE') cls = 'done';
      if (life === 'COMPLETE' && s.id === 'COMPLETE') { cls = 'active'; cur = ' aria-current="step"'; }
      return `<div class="disc-life-stage ${cls}" role="listitem" title="${esc(s.he)}"${cur}>${esc(s.label)}<span class="visually-hidden"> ${esc(s.he)}</span></div>`;
    }).join('');
    const barPct =
      total
        ? Math.min(100, Math.round((done / total) * 100))
        : st === 'complete'
          ? 100
          : st === 'reconnecting'
            ? 12
            : Math.min(90, 8 + lifeIdx * 12);
    const providerChips = Object.entries(providers)
      .map(([id, s]) => `<span class="disc-prov ${esc(s)}">${esc(id)} · ${esc(s)}</span>`)
      .join('');
    const plan = discState.queryPlan;
    const planTag =
      plan && (plan.planId || plan.id)
        ? `<span class="disc-source-tag disc-plan-tag" title="QueryPlan (Foundation · soft · not identity)">plan:${esc(plan.planId || plan.id)}</span>`
        : plan
          ? `<span class="disc-source-tag disc-plan-tag">plan:ready</span>`
          : '';
    const stageSrc = discState.stageSource
      ? `<span class="disc-source-tag" title="מקור שלב lifecycle">stage:${esc(discState.stageSource)}</span>`
      : '';
    const budgetTag = discState.budgetExhaustedReason
      ? `<span class="disc-source-tag disc-budget-exh" title="תקציב מוצה · soft">budget:${esc(discState.budgetExhaustedReason)}</span>`
      : '';
    const graphTag = discState.graphFromServer
      ? `<span class="disc-source-tag disc-graph-tag" title="גרף משרת · soft">graph:sse</span>`
      : '';
    // Concise SSE live announcement (separate polite region · avoids re-reading whole strip)
    const liveBits = [label, `שלב ${life}`];
    if (findingsN) liveBits.push(`${findingsN} ממצאים`);
    if (st === 'reconnecting' && discState.reconnectAttempt) {
      liveBits.push(`reconnect ${discState.reconnectAttempt}/${SSE_MAX_RECONNECT}`);
    }
    announceSseLive(liveBits.join(' · '));
    return `
      <div id="disc-sse-live" class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">${esc(lastSseLiveText)}</div>
      <div id="disc-progress" class="disc-life" role="status" aria-live="polite" aria-atomic="false" data-disc-status="${esc(st)}" data-life="${esc(life)}" data-stage-source="${esc(discState.stageSource || '')}" aria-label="התקדמות גילוי: ${esc(label)}, שלב ${esc(life)}">
        <div class="disc-life-top">
          <span class="disc-status${stClass}">${esc(label)}</span>${reconnectHint}
          ${connectionChip()}
          <span class="disc-counts">${findingsN} ממצאים · ${done}/${total || '—'} מקורות · שלב ${esc(life)}</span>
          ${discState.source ? `<span class="disc-source-tag">${esc(discState.source)}</span>` : ''}
          ${discState.transport ? `<span class="disc-source-tag">tx:${esc(discState.transport)}</span>` : ''}
          ${stageSrc}
          ${discState.narrowSource && discState.narrowSource !== 'none' ? `<span class="disc-source-tag">narrow:${esc(discState.narrowSource)}</span>` : ''}
          ${planTag}
          ${budgetTag}
          ${graphTag}
          ${narrowInFlight ? `<span class="disc-source-tag">מצמצם…</span>` : ''}
        </div>
        <div class="disc-life-stages disc-mission-stages" role="list" aria-label="שלבי משימת גילוי">${stagesHtml}</div>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${barPct}" aria-label="התקדמות מקורות"><i style="width:${barPct}%"></i></div>
        <div class="disc-prov-row" aria-label="מצב מקורות">${providerChips || '<span class="disc-muted">מאתר מקורות…</span>'}</div>
        ${renderStopReasonChip()}
        ${renderFrontierReadout()}
        ${renderPlanBudgetPanel()}
        ${vocabLegend()}
      </div>`;
  }
  function renderFacets() {
    const facets = facetsWithSearchUrlCandidates(discState).filter((f) => (f.buckets || []).length);
    const activeN = Object.keys(selectedFacets).length;
    if (!facets.length) {
      return `<aside class="disc-facets" id="disc-facets">
        <details class="disc-facets-drawer" open>
          <summary aria-expanded="true" aria-controls="disc-facets-body">מסננים <span class="chev">facets · אין עדיין</span></summary>
          <div class="disc-facets-body" id="disc-facets-body">
            <div class="disc-facet-sheet-head"><span class="k">FACETS</span><span class="s">סינון תצוגה · לא זהות</span></div>
            ${(discState.status === 'running' || discState.status === 'partial' || discState.status === 'reconnecting')
              ? `<div class="disc-facet-empty disc-facet-searching" role="status"><span class="disc-searching-dot" aria-hidden="true"></span>מחפש מסננים… · עדיין אין ערכים · לא זהות</div>
                 <div class="disc-skel-block disc-skel-facet"><div class="skel-line short"></div><div class="skel-line mid"></div></div>`
              : `<div class="disc-facet-empty">אין עדיין ערכים לסינון · UNKNOWN soft</div>`}
          </div>
        </details>
      </aside>`;
    }
    const groups = facets
      .map((f) => {
        const label = FACET_LABEL_HE[f.key] || f.label || f.key;
        const chips = (f.buckets || [])
          .map((b) => {
            const on = selectedFacets[f.key] && selectedFacets[f.key].has(b.value);
            const ow = isOfficialWebsiteKey(f.key);
            const short = ow && String(b.value).length > 42 ? `${String(b.value).slice(0, 40)}…` : b.value;
            return `<button type="button" class="disc-facet-chip${on ? ' on' : ''}${ow ? ' disc-facet-ow' : ''}" data-fkey="${esc(f.key)}" data-fval="${esc(b.value)}" title="${ow ? 'אתר רשמי (מועמד) · לא זהות · URL לבד = UNKNOWN' : esc(String(b.value))}" aria-pressed="${on ? 'true' : 'false'}">${esc(short)} <span class="n">${esc(b.count)}</span></button>`;
          })
          .join('');
        const bucketN = (f.buckets || []).length;
        return `<div class="disc-facet-group" role="group" aria-label="${esc(label)}"><div class="disc-facet-label"><span class="fl">${esc(label)}</span><span class="fn">${bucketN}</span></div><div class="disc-facet-chips">${chips}</div></div>`;
      })
      .join('');
    const clearBtn = activeN
      ? `<button type="button" class="disc-facet-clear" id="disc-facet-clear">נקה מסננים</button>`
      : '';
    const summaryN = activeN ? `${activeN} פעילים` : 'facets';
    const drawerOpen = !!activeN;
    return `<aside class="disc-facets" id="disc-facets" aria-label="מסנני ממצאים">
      <details class="disc-facets-drawer"${drawerOpen ? ' open' : ''}>
        <summary aria-expanded="${drawerOpen ? 'true' : 'false'}" aria-controls="disc-facets-body">מסננים <span class="chev">${esc(summaryN)}</span></summary>
        <div class="disc-facets-body" id="disc-facets-body">
          <div class="disc-facet-sheet-head"><span class="k">FACETS</span><span class="s">${esc(summaryN)} · סינון ≠ זהות</span></div>
          <div class="stamp"><span>מסננים</span><span class="n">facets</span></div>
          ${groups}${clearBtn}
        </div>
      </details>
    </aside>`;
  }
  function renderFindingCard(f, evMap, opts = {}) {
    const kind = KIND_HE[f.kind] || f.kind;
    const score =
      typeof f.scoreFinding === 'number'
        ? `<span class="conf${f.scoreFinding >= 0.8 ? ' hi' : ''}">רלוונטיות ${(f.scoreFinding * 100).toFixed(0)}%</span>`
        : typeof f.findingScore === 'number'
          ? `<span class="conf${f.findingScore >= 0.8 ? ' hi' : ''}">רלוונטיות ${(f.findingScore * 100).toFixed(0)}%</span>`
          : '';
    const evIds = f.evidenceIds || [];
    const evList = evIds.map((id) => evMap.get(id)).filter(Boolean);
    const relHint = (f.facetHints || []).find((h) => String(h).startsWith('relationship:'));
    const rel = f.relationship || (relHint ? String(relHint).split(':').slice(1).join(':') : '');
    const searchCand = isSearchUrlCandidateFinding(f);
    const urlAlone = searchCand || isUrlAloneFinding(f, evList);
    const providerSet = [...new Set(evList.map((e) => e.providerId || e.provider).filter(Boolean))];
    const providerRow = providerSet.length
      ? `<div class="disc-prov-providers" aria-label="ספקי ראיות">${providerSet.map((p) => `<span class="disc-prov ok" title="${esc(p)}">${esc(labelProvider(p))}</span>`).join('')}</div>`
      : '';
    const provenance = evList
      .map((e, ei) => {
        const url = e.provenanceUrl || e.url || '';
        const href = safeHref(url);
        const host = hostnameOf(url);
        const copyBtn = href !== '#'
          ? `<button type="button" class="disc-copy-link" data-copy-url="${esc(url)}" aria-label="העתק קישור מקור ${ei + 1}">העתק קישור</button>`
          : '';
        return `<div class="disc-ev" role="listitem">
          <div class="disc-prov-meta">
            <span class="disc-ev-k">ספק</span><span class="disc-ev-v">${esc(e.providerId || e.provider || '—')}</span>
            ${host ? `<span class="disc-ev-k">מארח</span><span class="disc-ev-v disc-ev-host">${esc(host)}</span>` : ''}
            <span class="disc-ev-k">URL</span><span class="disc-ev-v disc-ev-urlrow">${href !== '#' ? `<a class="disc-ev-link" href="${href}" target="_blank" rel="noopener noreferrer">${esc(url)}</a>` : esc(url || '—')}${copyBtn}</span>
            ${e.quote ? `<span class="disc-ev-k">ציטוט</span><span class="disc-ev-v"><q>${esc(e.quote)}</q></span>` : ''}
            <span class="disc-ev-k">נשלף</span><span class="disc-ev-v mono">${esc(e.retrievedAt || '—')}</span>
          </div>
        </div>`;
      })
      .join('');
    const firstUrl = evList[0] ? safeHref(evList[0].provenanceUrl || evList[0].url) : '#';
    const open = opts.forceOpenEvidence || opts.hi ? '' : ' hidden';
    const badge = rel || urlAlone ? relBadge(rel || 'unknown', { urlAlone }) : '';
    const rank = opts.rank
      ? `<span class="disc-finding-rank" title="דירוג גילוי · לא זהות">#${esc(opts.rank)}</span>`
      : '';
    const evN = evList.length;
        const tab = opts.rovingIndex === 0 ? '0' : '-1';
    const famId = findingFamilyId(f);
    const famHe = labelFamily(famId);
    const famEn = labelFamilyEn(famId);
    const familyChip = famId
      ? `<span class="disc-family-chip" title="${esc(famEn || famId)} · משפחת מקור · לא זהות" data-family="${esc(famId)}">${esc(famHe)}</span>`
      : '';
    const whyRaw = whyFoundText(f);
    const whyFoundBlock = whyRaw
      ? `<details class="disc-why-found"><summary>למה נמצא? · why-found · לא זהות</summary><p>${esc(whyRaw)}</p></details>`
      : '';
    const conflictOn = !urlAlone && serverEmitsConflict(f, discState);
    const conflictCls = conflictOn ? ' disc-finding-conflict' : '';
    const conflictBadge = conflictOn
      ? `<span class="disc-badge conflict" title="CONFLICT · שרת דיווח · לא invented">CONFLICT</span>`
      : '';
return `<article class="disc-finding${opts.hi ? ' hi' : ''}${conflictCls}" data-fid="${esc(f.id)}" id="finding-${esc(f.id)}" role="option" tabindex="${tab}" aria-selected="false" data-conflict="${conflictOn ? '1' : '0'}">
      <div class="disc-finding-head">
        ${rank}
        <span class="disc-kind">${esc(kind)}</span>
        ${familyChip}
        ${score}
        ${badge}
        ${conflictBadge}
        ${evN ? `<span class="disc-finding-evn" title="מספר ראיות מצוטטות">${evN} ראיות</span>` : ''}
      </div>
      <h3 class="disc-finding-title" id="finding-title-${esc(f.id)}">${esc(f.title)}</h3>
      ${f.summary ? `<p class="disc-finding-sum">${esc(f.summary)}</p>` : ''}
      ${whyFoundBlock}
      <div class="disc-finding-actions">
        <button type="button" class="disc-prov-toggle" aria-expanded="${open ? 'false' : 'true'}">למה הממצא? · ראיות</button>
        ${firstUrl !== '#' ? `<a class="go" href="${firstUrl}" target="_blank" rel="noopener noreferrer">פתח מקור</a>` : ''}
        <button type="button" class="disc-prov-toggle disc-focus-node" data-node="${esc(f.id)}">הצג בגרף</button>
      </div>
      <div class="disc-provenance"${open} id="prov-${esc(f.id)}" role="region" aria-label="ראיות provenance לממצא · לא זהות">
        <div class="disc-provenance-label disc-provenance-sticky"><span class="k">PROVENANCE</span> <span class="s">${evList.length} מקורות · ניתן לבדיקה · לא commit זהות</span>
          <button type="button" class="disc-prov-close secondary" data-prov-close aria-label="סגור ראיות">סגור</button>
        </div>
        ${providerRow}
        <div class="disc-prov-list" role="list">${provenance || '<div class="disc-muted">אין provenance (cite-or-drop)</div>'}</div>
      </div>
    </article>`;
  }
  function renderExecutiveSummary(list, gaps) {
    const providers = discState.providers || {};
    const okN = Object.values(providers).filter((s) => s === 'ok' || s === 'partial').length;
    const visibleEvidence = new Set(
      (list || []).flatMap((f) => Array.isArray(f.evidenceIds) ? f.evidenceIds : []),
    );
    const evN = visibleEvidence.size || (discState.evidence || []).length;
    const edgeN = ((discState.graph && discState.graph.edges) || []).length;
    const life = discState.lifeStage || deriveLifeStage(discState);
    const lead = list && list[0];
    const leadEvidence = lead && Array.isArray(lead.evidenceIds) ? lead.evidenceIds.length : 0;
    const owCands = collectOfficialWebsiteCandidates(discState);
    const searchCands = collectSearchUrlCandidates(discState);
    const gapsQuick = (gaps || []).slice(0, 5);
    const gapsQuickHtml = gapsQuick.length
      ? `<ul class="disc-quick-gaps">${gapsQuick
          .map(
            (g) =>
              `<li><span class="disc-quick-gap-kind">${esc(g.kind || 'gap')}</span><span class="disc-quick-gap-label">${esc(g.label)}</span>${
                g.action ? `<small>${esc(g.action)}</small>` : ''
              }</li>`,
          )
          .join('')}</ul>`
      : `<p class="disc-quick-gaps-empty">אין פערים מדווחים כרגע · היעדר פער ברשימה ≠ שלמות</p>`;
    const owQuickHtml = owCands.length
      ? `<ul class="disc-quick-ow">${owCands
          .slice(0, 5)
          .map((c) => {
            const href = safeHref(c.url);
            const host = hostnameOf(c.url) || c.url;
            const link =
              href !== '#'
                ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${esc(host)}</a>`
                : esc(host);
            return `<li><span class="disc-badge unk url-alone">UNKNOWN</span> ${link} <small>מועמד · ${esc(c.provenance)} · לא זהות</small></li>`;
          })
          .join('')}</ul>`
      : `<p class="disc-quick-ow-empty">אין מועמד officialWebsite/P856 ב־payload · ${esc(GAP_KIND_HE.no_official_website)}</p>`;
    const searchQuickHtml = searchCands.length
      ? `<ul class="disc-quick-search">${searchCands
          .slice(0, 5)
          .map((c) => {
            const href = safeHref(c.url);
            const host = hostnameOf(c.url) || c.url;
            const link =
              href !== '#'
                ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${esc(host)}</a>`
                : esc(host);
            const why = c.whyFound ? ` · ${esc(String(c.whyFound).slice(0, 90))}` : '';
            return `<li><span class="disc-badge unk url-alone">UNKNOWN</span> ${link} <small>חיפוש · ${esc(c.provenance)} · לא זהות${why}</small></li>`;
          })
          .join('')}</ul>`
      : `<p class="disc-quick-search-empty">אין מועמדי URL מחיפוש ב־payload · WAIT Server generalWebSearch / Track C treatment</p>`;
    const readout = (list || []).slice(0, 3).map((f, i) => `
      <li><span class="disc-readout-index">0${i + 1}</span><span><strong>${esc(f.title)}</strong><small>${lead && f.id === lead.id ? 'האות הבולט ביותר לפי דירוג גילוי' : 'ממצא שדורש אימות במקור'}</small></span></li>`).join('');
    return `<section class="disc-sec disc-sec-exec" id="disc-sec-exec" aria-labelledby="disc-h-exec">
      <div class="disc-sec-head">
        <h2 id="disc-h-exec"><span class="code">01</span> סיכום גילוי · Executive</h2>
        <span class="n">${esc(life)}</span>
      </div>
      <div class="disc-sec-body">
        <div class="disc-exec-grid">
          <div class="disc-metric"><div class="k">SEED</div><div class="v" style="font-size:14px;word-break:break-word">${esc(discState.q || '—')}</div><div class="s">סוג קלט: ${esc(discState.seedKind || '—')}</div></div>
          <div class="disc-metric"><div class="k">FINDINGS</div><div class="v">${list.length}</div><div class="s">ממצאים מוצגים${Object.keys(selectedFacets).length ? ' · מסונן' : ''}</div></div>
          <div class="disc-metric"><div class="k">EVIDENCE</div><div class="v">${evN}</div><div class="s">${okN} מקורות פעילים · ניתן לבדיקה</div></div>
          <div class="disc-metric"><div class="k">GAPS</div><div class="v">${gaps.length}</div><div class="s">${edgeN} קשרים במשטח</div></div>
        </div>
        <div class="disc-exec-readout" aria-label="קריאת מצב">
          <div class="disc-exec-readout-head"><span>QUICK READ</span><span>${lead ? `ראיה ראשית · ${leadEvidence}` : 'ממתין לראיות'}</span></div>
          ${lead ? `<p class="disc-exec-lead"><strong>${esc(lead.title)}</strong>${lead.summary ? ` <span>${esc(lead.summary)}</span>` : ''}</p>` : renderPremiumEmpty({ kind: 'summary', title: 'אין איתות ראשי עדיין', body: 'הממצאים יופיעו כאן כשהמערכת תקבל נתונים ציבוריים מצוטטים.', hint: 'אין איתות ≠ no-match' })}
          ${readout ? `<ol class="disc-readout-list">${readout}</ol>` : ''}
        </div>
        <div class="disc-quick-scan" aria-label="QUICK READ · פערים ואתר רשמי · לא זהות">
          <div class="disc-quick-scan-head"><span>QUICK READ · GAPS</span><span>${gapsQuick.length} פערים</span></div>
          ${gapsQuickHtml}
          <div class="disc-quick-scan-head" style="margin-top:10px"><span>QUICK READ · OFFICIAL WEBSITE</span><span>${owCands.length} מועמדים</span></div>
          ${owQuickHtml}
          <div class="disc-quick-scan-head" style="margin-top:10px"><span>QUICK READ · SEARCH URL CANDIDATES</span><span>${searchCands.length} מועמדים</span></div>
          ${searchQuickHtml}
          <p class="disc-quick-scan-note">אתר רשמי / חיפוש כאן = מועמד עם provenance · <strong>לא</strong> אימות זהות · C1: URL/כותרת/דומיין לבד → UNKNOWN · לעולם לא SAME-ENTITY מחיפוש</p>
        </div>
        <p class="disc-exec-blurb">אוסף מידע ציבורי סביב ה-seed. דירוג = רלוונטיות גילוי בלבד. <strong>אין טענת זהות</strong>. UNKNOWN נשאר UNKNOWN; קשרים הם מועמדים עד שנבדקו בראיות.</p>
      </div>
    </section>`;
  }

  function renderEvidenceSection(list, evMap) {
    const items = [];
    list.forEach((f) => {
      (f.evidenceIds || []).forEach((id) => {
        const e = evMap.get(id);
        if (e) items.push({ finding: f, evidence: e });
      });
    });
    const body = items.length
      ? items
          .slice(0, 40)
          .map(({ finding, evidence: e }) => {
            const evidenceUrl = e.provenanceUrl || e.url || '';
            const href = safeHref(evidenceUrl);
            return `<div class="disc-rel-row" tabindex="0" data-fid="${esc(finding.id)}">
              <div>
                <p class="t">${esc(finding.title)}</p>
                <div class="m"><span class="disc-ev-k">${esc(e.providerId || e.provider || '')}</span>
                  ${href !== '#' ? `<a class="disc-ev-link" href="${href}" target="_blank" rel="noopener noreferrer">${esc(evidenceUrl)}</a>` : esc(evidenceUrl || '')}
                  ${e.quote ? `<div><q>${esc(e.quote)}</q></div>` : ''}
                </div>
              </div>
              <span class="disc-badge fact">EVIDENCE</span>
            </div>`;
          })
          .join('')
      : discState.status === 'running' || discState.status === 'partial' || discState.status === 'reconnecting'
        ? `<div class="disc-skel-block"><div class="skel-line mid"></div><div class="skel-line"></div><div class="skel-line short"></div></div>`
        : renderPremiumEmpty({
            kind: 'evidence',
            title: 'אין ראיות עדיין',
            body: 'ראיות יופיעו עם ממצאים מצוטטים · cite-or-drop. היעדר ראיה ≠ no-match.',
            hint: 'UNKNOWN soft · לא השלמה לזהות',
          });
    return `<section class="disc-sec" id="disc-sec-evidence" aria-labelledby="disc-h-ev">
      <div class="disc-sec-head"><h2 id="disc-h-ev"><span class="code">03</span> ראיות · Evidence</h2><span class="n">${items.length}</span></div>
      <div class="disc-sec-body"><div class="disc-rel-list">${body}</div></div>
    </section>`;
  }

  function renderRelationshipsSection(graph) {
    const edges = graph.edges || [];
    const nodes = new Map((graph.nodes || []).map((n) => [n.id, n]));
    const labelOf = (id) => {
      const n = nodes.get(id);
      if (n && (n.label || n.title || n.name)) return n.label || n.title || n.name;
      const f = (discState.findings || []).find((x) => x.id === id);
      if (f) return f.title;
      if (id === 'seed' || (n && n.kind === 'seed')) return discState.q || 'seed';
      return id;
    };
    const body = edges.length
      ? edges
          .slice(0, 40)
          .map((e) => {
            const from = e.from ?? e.source;
            const to = e.to ?? e.target;
            const rel = e.relationship || e.kind || 'unknown';
            const derived = e.derived ? ' <span class="disc-badge unk">view-derived</span>' : '';
            return `<div class="disc-rel-row" tabindex="0" data-edge="${esc(e.id)}" role="button">
              <div>
                <p class="t">${esc(labelOf(from))} → ${esc(labelOf(to))}</p>
                <div class="m">${esc(REL_HE[rel] || rel)}${e.coalesceKeys ? ` · keys: ${esc((e.coalesceKeys || []).slice(0, 3).join(', '))}` : ''}${derived}</div>
              </div>
              ${relBadge(rel)}
            </div>`;
          })
          .join('')
      : renderPremiumEmpty({
          kind: 'relationships',
          title: 'אין קשרים מפורשים עדיין',
          body: 'היעדר קשר בגרף ≠ היעדר קשר בעולם — רק במשטח הנוכחי. UNKNOWN נשאר רך.',
          hint: 'CANDIDATE ≠ FACT · לא SAME-ENTITY לזהות',
        });
    return `<section class="disc-sec" id="disc-sec-rel" aria-labelledby="disc-h-rel">
      <div class="disc-sec-head"><h2 id="disc-h-rel"><span class="code">04</span> קשרים · Relationships</h2><span class="n">${edges.length}</span></div>
      <div class="disc-sec-body">
        <p class="disc-exec-blurb" style="margin-bottom:10px">same-reference / same-entity כאן הם <strong>מועמדים</strong> מבוססי typed soft-ref — לא SAME-ENTITY לתיק זהות. UNKNOWN נשאר רך.</p>
        <div class="disc-rel-list">${body}</div>
        <div id="disc-edge-detail" class="disc-edge-ev" hidden></div>
      </div>
    </section>`;
  }

  function renderSourcesSection() {
    const providers = discState.providers || {};
    const entries = Object.entries(providers);
    const findings = discState.findings || [];
    const evidence = discState.evidence || [];
    const sourceMap = new Map();
    evidence.forEach((e) => {
      const url = e && (e.provenanceUrl || e.url);
      const host = hostnameOf(url) || 'מקור ללא מארח';
      const provider = e && (e.providerId || e.provider) || 'provider לא ידוע';
      const key = `${provider}|${host}`;
      const row = sourceMap.get(key) || { provider, host, url, evidence: 0, findings: new Set() };
      row.evidence += 1;
      findings.forEach((f) => {
        if ((f.evidenceIds || []).includes(e.id)) row.findings.add(f.id);
      });
      if (!row.url && url) row.url = url;
      sourceMap.set(key, row);
    });
    const sourceRows = [...sourceMap.values()].slice(0, 40).map((row) => {
      const href = safeHref(row.url);
      const link = href !== '#'
        ? `<a class="disc-source-link" href="${href}" target="_blank" rel="noopener noreferrer">${esc(row.host)}</a>`
        : `<span class="disc-source-link muted">${esc(row.host)}</span>`;
      return `<div class="disc-src-row disc-src-evidence">
        <div><p class="t" style="margin:0 0 4px;font-size:13px;font-weight:600">${link}</p>
        <div class="m" style="font-size:12px;color:var(--disc-soft)">${esc(row.provider)} · ${row.evidence} ראיות · ${row.findings.size} ממצאים</div></div>
        <span class="disc-badge fact">CITED</span>
      </div>`;
    }).join('');
    const providerRows = entries.map(([id, status]) => {
      const n = findings.filter((f) => (f.providers || []).includes(id)).length;
      return `<div class="disc-src-row disc-src-provider">
        <div><p class="t" style="margin:0 0 4px;font-size:13px;font-weight:600">${esc(id)}</p>
        <div class="m" style="font-size:12px;color:var(--disc-soft)">${n} ממצאים מקושרים · סטטוס provider</div></div>
        <span class="disc-prov ${esc(status)}">${esc(status)}</span>
      </div>`;
    }).join('');
    const body = sourceRows || providerRows
      ? `${sourceRows ? `<div class="disc-source-subhead">מקורות מצוטטים</div>${sourceRows}` : ''}${providerRows ? `<div class="disc-source-subhead">כיסוי providers</div>${providerRows}` : ''}`
      : renderPremiumEmpty({
          kind: 'sources',
          title: 'ממתינים למקורות',
          body: 'סטטוס providers יופיע עם התקדמות הגילוי. מקור שלא הוחזר אינו no-match.',
          hint: 'error/partial ≠ no-match',
        });
    return `<section class="disc-sec" id="disc-sec-src" aria-labelledby="disc-h-src">
      <div class="disc-sec-head"><h2 id="disc-h-src"><span class="code">05</span> מקורות · Sources</h2><span class="n">${sourceMap.size || entries.length}</span></div>
      <div class="disc-sec-body">
        <p class="disc-src-intro">מקור מצוטט = כתובת ציבורית שניתן לפתוח ולבדוק. מספר ממצאים ≠ מספר משפחות בלתי־תלויות. error/partial אינם no-match.</p>
        <div class="disc-src-list">${body}</div>
      </div>
    </section>`;
  }

  function renderGapsSection(gaps) {
    const body = gaps.length
      ? gaps
          .map(
            (g) => `<div class="disc-gap-row" style="cursor:default" tabindex="0">
          <div><p class="t" style="margin:0;font-size:13px">${esc(g.label)}</p>
          <div class="m" style="font-size:11px;color:var(--muted)">${esc(g.kind || 'gap')}</div></div>
          <span class="disc-badge unk">UNKNOWN/GAP</span>
        </div>`,
          )
          .join('')
      : renderPremiumEmpty({
          kind: 'gaps',
          title: 'אין פערים מדווחים כרגע',
          body: 'היעדר סתירה ברשימה <strong>אינו</strong> הוכחת שלמות או no-match. UNKNOWN נשאר UNKNOWN.',
          hint: 'UNKNOWN ≠ FALSE',
        });
    return `<section class="disc-sec" id="disc-sec-gaps" aria-labelledby="disc-h-gaps">
      <div class="disc-sec-head"><h2 id="disc-h-gaps"><span class="code">06</span> לא ידוע / פערים · Unknown</h2><span class="n">${gaps.length}</span></div>
      <div class="disc-sec-body">
        <p class="disc-gap-intro">UNKNOWN ≠ FALSE · כיסוי חלקי / שגיאת מקור / קשר לא מסווג נשארים גלויים. אין השלמה אוטומטית לזהות.</p>
        <div class="disc-gap-list">${body}</div>
      </div>
    </section>`;
  }

  function clampGraphScale(s) {
    return Math.min(GRAPH_SCALE_MAX, Math.max(GRAPH_SCALE_MIN, s));
  }

  function resetGraphView() {
    graphView = { scale: 1, tx: 0, ty: 0 };
  }

  function announceSseLive(text) {
    const t = String(text || '').trim();
    if (!t || t === lastSseLiveText) return;
    lastSseLiveText = t;
    const el = document.getElementById('disc-sse-live');
    if (el) el.textContent = t;
  }

  /** Copy URL with secure-context clipboard + textarea/prompt fallback · never identity. */
  async function copyDiscoveryUrl(url) {
    const text = String(url || '').trim();
    if (!text) return { ok: false, method: 'empty' };
    const secure = typeof window !== 'undefined' && window.isSecureContext === true;
    if (secure && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        return { ok: true, method: 'clipboard' };
      } catch (_) { /* fall through */ }
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.setAttribute('aria-hidden', 'true');
      ta.style.cssText = 'position:fixed;inset-inline-start:0;top:0;width:1px;height:1px;padding:0;border:0;opacity:0;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, text.length);
      const ok = document.execCommand && document.execCommand('copy');
      ta.remove();
      if (ok) return { ok: true, method: 'textarea' };
    } catch (_) { /* fall through */ }
    try {
      if (typeof window.prompt === 'function') {
        window.prompt('העתיקו את קישור המקור (לא זהות):', text);
        return { ok: true, method: 'prompt' };
      }
    } catch (_) {}
    return { ok: false, method: 'failed' };
  }


  /** Facet/narrow count announce — soft UX only · never identity. */
  let facetAnnounceTimer = null;
  function announceFacetNarrow(opts = {}) {
    const findingsN = opts.findingsN != null ? opts.findingsN : (filteredFindings().length);
    const activeFacets = Object.keys(selectedFacets).length;
    const src = opts.source || discState.narrowSource || 'none';
    const bits = [
      activeFacets ? `${activeFacets} מסננים פעילים` : 'ללא מסננים',
      `${findingsN} ממצאים מוצגים`,
      src !== 'none' ? `narrow:${src}` : null,
      'סינון ≠ זהות',
    ].filter(Boolean);
    const text = bits.join(' · ');
    // Debounce rapid facet clicks · keep latest announce only
    if (facetAnnounceTimer) clearTimeout(facetAnnounceTimer);
    facetAnnounceTimer = setTimeout(() => {
      facetAnnounceTimer = null;
      announceSseLive(text);
    }, 120);
  }


  /** Layout nodes in a soft ring — display only · not identity geometry. */
  function layoutGraphNodes(nodes, w, h) {
    const cx = w / 2;
    const cy = h / 2;
    const n = Math.max(nodes.length, 1);
    const r = Math.min(w, h) * 0.34;
    return nodes.map((node, i) => {
      if (node.kind === 'seed' || node.id === 'seed') {
        return { ...node, _x: cx, _y: cy };
      }
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return { ...node, _x: cx + Math.cos(angle) * r, _y: cy + Math.sin(angle) * r };
    });
  }

  function edgeHasEvidence(edge) {
    return Array.isArray(edge && edge.evidenceIds) && edge.evidenceIds.length > 0 ||
      Array.isArray(edge && edge.evidence) && edge.evidence.length > 0;
  }

  function filterGraphForDisplay(graph) {
    const rawNodes = Array.isArray(graph && graph.nodes) ? graph.nodes : [];
    const rawEdges = Array.isArray(graph && graph.edges) ? graph.edges : [];
    if (graphFilter === 'all') return { ...graph, nodes: rawNodes, edges: rawEdges };
    const findingById = new Map((discState.findings || []).map((f) => [String(f.id), f]));
    const evidenceIds = new Set(
      (discState.evidence || []).map((e) => String(e.id)),
    );
    const edgeIsEvidenceBacked = (e) => edgeHasEvidence(e) ||
      (Array.isArray(e && e.evidenceIds) && e.evidenceIds.some((id) => evidenceIds.has(String(id))) ||
        [e && (e.from ?? e.source), e && (e.to ?? e.target)].some((id) => {
          const f = findingById.get(String(id));
          return f && Array.isArray(f.evidenceIds) && f.evidenceIds.length > 0;
        }));
    const wantedEdges = rawEdges.filter((e) => {
      const rel = String(e.relationship || e.kind || 'unknown');
      return graphFilter === 'evidence' ? edgeIsEvidenceBacked(e) : /unknown/i.test(rel);
    });
    const wantedIds = new Set(['seed']);
    wantedEdges.forEach((e) => {
      if (e.from ?? e.source) wantedIds.add(String(e.from ?? e.source));
      if (e.to ?? e.target) wantedIds.add(String(e.to ?? e.target));
    });
    if (graphFilter === 'evidence') {
      rawNodes.forEach((n) => {
        const f = findingById.get(String(n.id));
        if (f && Array.isArray(f.evidenceIds) && f.evidenceIds.length) wantedIds.add(String(n.id));
      });
    }
    return {
      ...graph,
      nodes: rawNodes.filter((n) => wantedIds.has(String(n.id))),
      edges: wantedEdges,
    };
  }

  function renderGraphCanvas(graph, nodeLabelFn) {
    const viewGraph = filterGraphForDisplay(graph);
    const nodes = (viewGraph.nodes || []).slice(0, 48);
    const edges = (viewGraph.edges || []).slice(0, 120);
    if (!nodes.length) return '';
    const W = 640;
    const H = 360;
    const laid = layoutGraphNodes(nodes, W, H);
    const byId = new Map(laid.map((n) => [String(n.id), n]));
    // Hoist before edgeLines map — avoids TDZ ReferenceError (focus used in .map callback).
    const focus = discState.focusedNodeId;
    const edgeLines = edges
      .map((e) => {
        const from = byId.get(String(e.from ?? e.source));
        const to = byId.get(String(e.to ?? e.target));
        if (!from || !to) return '';
        const rel = e.relationship || e.kind || 'unknown';
        const soft = e.derived ? ' derived' : '';
        const onEdge = focus && (String(e.from ?? e.source) === String(focus) || String(e.to ?? e.target) === String(focus));
        return `<line class="disc-graph-edge${soft}${onEdge ? ' on' : ''}" data-edge="${esc(e.id)}" x1="${from._x.toFixed(1)}" y1="${from._y.toFixed(1)}" x2="${to._x.toFixed(1)}" y2="${to._y.toFixed(1)}" aria-hidden="true"><title>${esc(REL_HE[rel] || rel)}</title></line>`;
      })
      .join('');
    const nodeBtns = laid
      .map((n) => {
        const on = focus && String(n.id) === String(focus);
        const label = nodeLabelFn(n);
        const isSeed = n.kind === 'seed' || n.id === 'seed';
        return `<button type="button" class="disc-graph-canvas-node${on ? ' on' : ''}${isSeed ? ' seed' : ''}" data-node="${esc(n.id)}" style="left:${n._x.toFixed(1)}px;top:${n._y.toFixed(1)}px" title="${esc(label)}" aria-pressed="${on ? 'true' : 'false'}" aria-current="${on ? 'true' : 'false'}" aria-label="${esc((isSeed ? 'seed · ' : '') + label)} · צומת גרף · לא זהות"><span class="nk">${esc(isSeed ? 'seed' : (n.kind || n.type || 'node'))}</span><span class="nl">${esc(String(label).slice(0, 36))}</span></button>`;
      })
      .join('');
    const pct = Math.round(graphView.scale * 100);
    return `<div class="disc-graph-canvas-wrap">
      <div class="disc-graph-canvas-toolbar" role="toolbar" aria-label="בקרות זום וסינון גרף · לא זהות">
        <button type="button" class="disc-graph-tool" id="disc-graph-zoom-out" aria-label="הקטן זום" title="הקטן (−)">−</button>
        <button type="button" class="disc-graph-tool" id="disc-graph-zoom-in" aria-label="הגדל זום" title="הגדל (+)">+</button>
        <button type="button" class="disc-graph-tool" id="disc-graph-zoom-reset" aria-label="איפוס זום ופאן" title="איפוס (0)">איפוס</button>
        <span class="disc-graph-filter-label">תצוגה</span>
        ${[['all','הכול'],['evidence','עם ראיות'],['unknown','UNKNOWN']].map(([key,label]) => `<button type="button" class="disc-graph-tool disc-graph-filter${graphFilter === key ? ' on' : ''}" data-graph-filter="${key}" aria-pressed="${graphFilter === key ? 'true' : 'false'}">${label}</button>`).join('')}
        <span class="disc-graph-zoom-label" id="disc-graph-zoom-label" aria-live="polite">${pct}%</span>
        <span class="disc-muted disc-graph-hint">גלגלת · גרירה · צביטה</span>
      </div>
      <div class="disc-graph-canvas" id="disc-graph-canvas" tabindex="0" role="application" aria-label="קנבס גרף ראיות · זום ופאן · לא זהות">
        <div class="disc-graph-canvas-inner" id="disc-graph-canvas-inner" style="width:${W}px;height:${H}px;transform:translate(${graphView.tx}px,${graphView.ty}px) scale(${graphView.scale})">
          <svg class="disc-graph-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${edgeLines}</svg>
          ${nodeBtns}
        </div>
      </div>
    </div>`;
  }

  function applyGraphViewTransform() {
    const inner = document.getElementById('disc-graph-canvas-inner');
    const label = document.getElementById('disc-graph-zoom-label');
    if (inner) {
      inner.style.transform = `translate(${graphView.tx}px, ${graphView.ty}px) scale(${graphView.scale})`;
    }
    if (label) label.textContent = `${Math.round(graphView.scale * 100)}%`;
  }

  function bindGraphCanvasControls(out) {
    const canvas = out.querySelector('#disc-graph-canvas');
    if (!canvas) return;
    const zoomIn = out.querySelector('#disc-graph-zoom-in');
    const zoomOut = out.querySelector('#disc-graph-zoom-out');
    const zoomReset = out.querySelector('#disc-graph-zoom-reset');
    const zoomBy = (factor, cx, cy) => {
      const prev = graphView.scale;
      const next = clampGraphScale(prev * factor);
      if (next === prev) return;
      // Zoom toward pointer (cx,cy) in canvas client space when provided
      if (typeof cx === 'number' && typeof cy === 'number') {
        const rect = canvas.getBoundingClientRect();
        const px = cx - rect.left;
        const py = cy - rect.top;
        graphView.tx = px - (px - graphView.tx) * (next / prev);
        graphView.ty = py - (py - graphView.ty) * (next / prev);
      }
      graphView.scale = next;
      applyGraphViewTransform();
    };
    if (zoomIn) zoomIn.onclick = (ev) => { ev.preventDefault(); zoomBy(1.15); };
    if (zoomOut) zoomOut.onclick = (ev) => { ev.preventDefault(); zoomBy(1 / 1.15); };
    if (zoomReset) {
      zoomReset.onclick = (ev) => {
        ev.preventDefault();
        resetGraphView();
        applyGraphViewTransform();
      };
    }
    // Wheel zoom (prevent page scroll while over canvas)
    canvas.onwheel = (ev) => {
      ev.preventDefault();
      const dir = ev.deltaY > 0 ? 1 / 1.08 : 1.08;
      zoomBy(dir, ev.clientX, ev.clientY);
    };
    // Pointer pan
    let panning = false;
    let lastX = 0;
    let lastY = 0;
    let pointerId = null;
    canvas.onpointerdown = (ev) => {
      if (ev.button !== 0 && ev.pointerType === 'mouse') return;
      // Don't start pan when clicking a node button
      if (ev.target && ev.target.closest && ev.target.closest('.disc-graph-canvas-node')) return;
      panning = true;
      pointerId = ev.pointerId;
      lastX = ev.clientX;
      lastY = ev.clientY;
      try { canvas.setPointerCapture(ev.pointerId); } catch (_) {}
      canvas.classList.add('panning');
    };
    canvas.onpointermove = (ev) => {
      if (!panning || (pointerId != null && ev.pointerId !== pointerId)) return;
      const dx = ev.clientX - lastX;
      const dy = ev.clientY - lastY;
      lastX = ev.clientX;
      lastY = ev.clientY;
      graphView.tx += dx;
      graphView.ty += dy;
      applyGraphViewTransform();
    };
    const endPan = (ev) => {
      if (pointerId != null && ev && ev.pointerId !== pointerId) return;
      panning = false;
      pointerId = null;
      canvas.classList.remove('panning');
    };
    canvas.onpointerup = endPan;
    canvas.onpointercancel = endPan;
    // Touch pinch
    let pinchDist = null;
    let pinchScale = 1;
    canvas.ontouchstart = (ev) => {
      if (ev.touches.length === 2) {
        const [a, b] = ev.touches;
        pinchDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        pinchScale = graphView.scale;
        panning = false;
      }
    };
    canvas.ontouchmove = (ev) => {
      if (ev.touches.length === 2 && pinchDist) {
        ev.preventDefault();
        const [a, b] = ev.touches;
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const midX = (a.clientX + b.clientX) / 2;
        const midY = (a.clientY + b.clientY) / 2;
        const next = clampGraphScale(pinchScale * (d / pinchDist));
        const prev = graphView.scale;
        if (next !== prev) {
          const rect = canvas.getBoundingClientRect();
          const px = midX - rect.left;
          const py = midY - rect.top;
          graphView.tx = px - (px - graphView.tx) * (next / prev);
          graphView.ty = py - (py - graphView.ty) * (next / prev);
          graphView.scale = next;
          applyGraphViewTransform();
        }
      }
    };
    canvas.ontouchend = () => { pinchDist = null; };
    // Keyboard: +/- / 0 when canvas focused
    canvas.onkeydown = (ev) => {
      if (ev.key === '+' || ev.key === '=') { ev.preventDefault(); zoomBy(1.15); }
      else if (ev.key === '-' || ev.key === '_') { ev.preventDefault(); zoomBy(1 / 1.15); }
      else if (ev.key === '0') { ev.preventDefault(); resetGraphView(); applyGraphViewTransform(); }
      else if (ev.key === 'ArrowLeft') { ev.preventDefault(); graphView.tx += 24; applyGraphViewTransform(); }
      else if (ev.key === 'ArrowRight') { ev.preventDefault(); graphView.tx -= 24; applyGraphViewTransform(); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); graphView.ty += 24; applyGraphViewTransform(); }
      else if (ev.key === 'ArrowDown') { ev.preventDefault(); graphView.ty -= 24; applyGraphViewTransform(); }
    };
  }

  function isMobileFacetsViewport() {
    try {
      return window.matchMedia && window.matchMedia('(max-width:860px)').matches;
    } catch (_) {
      return false;
    }
  }

  function getFocusableIn(root) {
    if (!root) return [];
    const sel = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),summary';
    return [...root.querySelectorAll(sel)].filter((el) => {
      if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') return false;
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }

  function bindFacetDrawerA11y(out) {
    const drawer = out.querySelector('.disc-facets-drawer');
    if (!drawer) return;
    const summary = drawer.querySelector('summary');
    const syncExpanded = () => {
      if (summary) summary.setAttribute('aria-expanded', drawer.open ? 'true' : 'false');
      drawer.setAttribute('data-trap', drawer.open && isMobileFacetsViewport() ? '1' : '0');
    };
    syncExpanded();
    drawer.addEventListener('toggle', syncExpanded);
    // Escape closes (mobile drawer) + returns focus to summary
    drawer.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && drawer.open && isMobileFacetsViewport()) {
        ev.preventDefault();
        drawer.open = false;
        syncExpanded();
        if (summary) summary.focus();
        return;
      }
      // Focus trap while mobile drawer open
      if (ev.key !== 'Tab' || !drawer.open || !isMobileFacetsViewport()) return;
      const focusables = getFocusableIn(drawer);
      if (focusables.length < 2) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      }
    });
  }

  function renderGraphPanel(graph) {
    const viewGraph = filterGraphForDisplay(graph);
    const nodes = viewGraph.nodes || [];
    const edges = viewGraph.edges || [];
    const focus = nodes.some((n) => String(n.id) === String(discState.focusedNodeId))
      ? discState.focusedNodeId
      : (nodes[0] && nodes[0].id) || null;
    const nodeLabel = (n) => {
      if (!n) return '—';
      if (n.label || n.title || n.name) return n.label || n.title || n.name;
      if (n.kind === 'seed' || n.id === 'seed') return discState.q || 'seed';
      const f = (discState.findings || []).find((x) => x.id === n.id);
      return (f && f.title) || n.id;
    };
    const nodesHtml = nodes.length
      ? nodes
          .map((n) => {
            const on = focus && String(n.id) === String(focus);
            return `<button type="button" class="disc-graph-node${on ? ' on' : ''}" data-node="${esc(n.id)}">
              <span class="nk">${esc(n.kind || n.type || 'node')}</span>${esc(nodeLabel(n))}
            </button>`;
          })
          .join('')
      : discState.graphFromServer
        ? renderPremiumEmpty({
            kind: 'graph-sparse',
            title: 'גרף שרת · דליל',
            body: 'התקבל אירוע graph מ-SSE אך ללא צמתים אחרי scrub — soft panel · לא זהות.',
            hint: 'graph ≠ dossier',
          })
        : discState.lifeStage === 'FRONTIER' || discState.lifeStage === 'EVIDENCE' || discState.lifeStage === 'GRAPH' || discState.lifeStage === 'RELATIONSHIPS'
          ? `<div class="disc-graph-loading" role="status" aria-live="polite">${renderPremiumEmpty({
              kind: 'graph-wait',
              title: 'טוען גרף ראיות…',
              body: 'שלב EVIDENCE/FRONTIER פעיל · צמתים יופיעו כש-Foundation ינפיק chunk. טעינה ≠ זהות.',
              hint: 'soft wait · plan/graph flag-gated · ring layout',
            })}</div>`
          : graphFilter !== 'all'
            ? renderPremiumEmpty({
                kind: 'graph-filtered',
                title: 'אין צמתים בתצוגת המסנן',
                body: 'מסנן הגרף הסתיר את כל הצמתים. אפשר להציג הכול או לאפס זום/פאן. סינון תצוגה ≠ זהות.',
                hint: 'UNKNOWN soft · ring layout',
                actions: `<button type="button" class="secondary" id="disc-graph-filter-all">הצג הכול</button>
                  <button type="button" class="secondary" id="disc-graph-zoom-reset-empty">איפוס זום</button>`,
              })
            : renderPremiumEmpty({
              kind: 'graph',
              title: 'גרף יופיע עם ממצאים',
              body: 'פאנל canvas + list+detail · זום/פאן · לחיצה על צומת מרחיבה קשרים. אין commit זהות.',
              hint: 'derived edges מסומנים view-derived',
            });
    const related = edges.filter((e) => {
      const from = e.from ?? e.source;
      const to = e.to ?? e.target;
      return focus && (String(from) === String(focus) || String(to) === String(focus));
    });
    const focusNode = nodes.find((n) => String(n.id) === String(focus));
    const detailEdges = related.length
      ? related
          .map((e) => {
            const from = e.from ?? e.source;
            const to = e.to ?? e.target;
            const rel = e.relationship || e.kind || 'unknown';
            const other = String(from) === String(focus) ? to : from;
            const otherNode = nodes.find((n) => String(n.id) === String(other));
            return `<div class="disc-rel-row" tabindex="0" data-edge="${esc(e.id)}">
              <div>
                <p class="t">${esc(nodeLabel(focusNode))} ↔ ${esc(nodeLabel(otherNode) || other)}</p>
                <div class="m">${esc(REL_HE[rel] || rel)}${e.derived ? ' · view-derived (לא laundering)' : ''}</div>
              </div>
              ${relBadge(rel)}
            </div>`;
          })
          .join('')
      : renderPremiumEmpty({
          kind: 'graph-edges',
          title: 'אין קשתות לצומת זה',
          body: 'בחרו צומת אחר או המתינו ל-corroboration. היעדר קשת ≠ היעדר קשר בעולם.',
          hint: 'UNKNOWN soft',
        });
    const softGraph = discState.graphFromServer;
    const derivedSoft = !softGraph && (discState.graph && discState.graph.meta && discState.graph.meta.soft);
    const canvasHtml = nodes.length ? renderGraphCanvas(viewGraph, nodeLabel) : '';
    const filterNote = graphFilter !== 'all' ? ` · תצוגת ${graphFilter === 'evidence' ? 'ראיות' : 'UNKNOWN'}` : '';
    return `<section class="disc-sec${softGraph ? ' disc-graph-soft' : ''}" id="disc-sec-graph" aria-labelledby="disc-h-graph" data-graph-source="${softGraph ? 'server' : derivedSoft ? 'client-derived' : 'none'}">
      <div class="disc-sec-head"><h2 id="disc-h-graph"><span class="code">G</span> גרף ראיות · Evidence graph</h2><span class="n">${nodes.length}n · ${edges.length}e${filterNote}${softGraph ? ' · sse' : derivedSoft ? ' · soft' : ''}</span></div>
      <div class="disc-sec-body">
        <p class="disc-exec-blurb" style="margin-bottom:10px">קנבס זום/פאן + list+detail · לחיצה על צומת מרחיבה קשרים · לחיצה על קשת מציגה ראיות. ${softGraph ? '<strong>גרף משרת (SSE)</strong> · soft · לא dossier.' : 'גרף נגזר לתצוגה מסומן soft.'} גרף ≠ זהות · INFORMATION ≠ IDENTITY.</p>
        ${canvasHtml}
        <div class="disc-graph-panel${softGraph ? ' from-server' : ''}">
          <div class="disc-graph-nodes" role="group" aria-label="צמתי גרף">${nodesHtml}</div>
          <div class="disc-graph-detail">
            <h3>${esc(nodeLabel(focusNode) || 'בחרו צומת')}</h3>
            <div class="disc-muted" style="font-size:11px;margin-bottom:8px">${esc((focusNode && (focusNode.kind || focusNode.type)) || '')}</div>
            <div class="disc-rel-list">${detailEdges}</div>
            <div id="disc-graph-edge-detail" class="disc-edge-ev" hidden></div>
          </div>
        </div>
      </div>
    </section>`;
  }

  function renderFindingsSection(list, evMap) {
    const ranked = highValueFindings(list);
    const hi = ranked.slice(0, Math.min(5, ranked.length));
    const rest = ranked.slice(hi.length);
    let body;
    if (!ranked.length) {
      const filtered = Object.keys(selectedFacets).length > 0;
      if (discState.status === 'running' || discState.status === 'partial' || discState.status === 'reconnecting') {
        body = `<div class="disc-searching-banner" role="status" aria-live="polite"><span class="disc-searching-dot" aria-hidden="true"></span><strong>מחפש ממצאים…</strong> <span>זרם חלקי · עדיין אין פריטים · מחפש ≠ no-match · לא זהות</span></div>
             <div class="disc-skel-block" aria-hidden="true"><div class="skel-line mid"></div><div class="skel-line"></div><div class="skel-line short"></div></div>
             <div class="disc-skel-block" aria-hidden="true"><div class="skel-line mid"></div><div class="skel-line short"></div></div>`;
      } else {
        const actions = filtered
          ? `<button type="button" class="secondary" id="disc-empty-clear-facets">נקה מסננים</button>`
          : `<button type="button" class="secondary" id="disc-empty-back">חזרה לטופס</button>`;
        body = renderPremiumEmpty({
          kind: filtered ? 'findings-filtered' : 'findings',
          title: filtered ? 'אין ממצאים תחת המסננים' : 'אין ממצאים להצגה',
          body: filtered
            ? 'המסננים צמצמו את הרשימה לריק · הסינון אינו יוצר זהות ואינו קובע «זה האדם».'
            : discState.status === 'complete' || discState.status === 'partial' || discState.status === 'failed_soft'
              ? 'כיסוי דל / thin · ייתכן seed חלש או מקורות חלקיים. thin ≠ no-match · לא זהות.'
              : 'ממצאים יופיעו עם התקדמות הגילוי.',
          hint: 'INFORMATION ≠ IDENTITY · UNKNOWN soft',
          actions,
        });
      }
    } else {
      body =
        `<div class="disc-findings-hi" role="listbox" aria-label="ממצאים מובילים · ניווט חצים" data-roving="findings">` +
        hi.map((f, i) => renderFindingCard(f, evMap, { hi: true, rank: i + 1, rovingIndex: i })).join('') +
        `</div>` +
        (rest.length
          ? `<details class="disc-findings-more"><summary>עוד ${rest.length} ממצאים · דירוג נמוך יותר</summary><div class="disc-findings-rest" role="listbox" aria-label="ממצאים נוספים" data-roving="findings-rest">${rest.map((f, i) => renderFindingCard(f, evMap, { rovingIndex: i })).join('')}</div></details>`
          : '');
    }
    return `<section class="disc-sec disc-sec-findings" id="disc-sec-findings" aria-labelledby="disc-h-find">
      <div class="disc-sec-head"><h2 id="disc-h-find"><span class="code">02</span> ממצאים בעלי ערך · High-value</h2><span class="n">${ranked.length}</span></div>
      <div class="disc-sec-body">
        <p class="disc-sec-lead">סריקה מלמעלה למטה: כותרת ← רלוונטיות ← ראיות. דירוג = ערך גילוי בלבד · לא זהות.</p>
        ${body}
      </div>
    </section>`;
  }

  function classifyDiscoveryError(msg) {
    const m = String(msg || '').toLowerCase();
    if (/offline|navigator\.onLine\s*===\s*false|no internet|ש offline/.test(m) || (typeof navigator !== 'undefined' && navigator.onLine === false && /network|fetch|failed/.test(m))) return 'offline';
    if (/stale session|session expired|session.?stale|gone|410/.test(m)) return 'stale-session';
    if (/session not found|session.?missing|404/.test(m)) return 'session-not-found';
    if (/no matching fixture|fixture (index )?missing|fixture load failed|fixture-miss/.test(m)) return 'fixture-miss';
    if (/sse reconnect exhausted|reconnect exhausted|eventsource|sse/.test(m) && /exhaust|fail|error|disconnect|unsupported/.test(m)) return 'sse-disconnect';
    if (/network|failed to fetch|load failed|api \d+/.test(m)) return 'network';
    return 'generic';
  }

  function renderErrorRecovery() {
    if (!discState.errorMessage) return '';
    const kind = classifyDiscoveryError(discState.errorMessage);
    const copy = {
      offline: {
        title: 'אין חיבור לרשת',
        body: 'הדפדפן מדווח offline. בדקו את החיבור ונסו שוב, או הריצו הדגמת פיקסצ׳ר מקומית. Offline ≠ no-match · לא זהות.',
        primary: 'retry',
        secondary: 'fixture',
      },
      'stale-session': {
        title: 'ה-session פג / לא בתוקף',
        body: 'המזהה ישן או שפג תוקף בשרת. התחילו גילוי חדש מהטופס, או השתמשו בהדגמה. Session ישן ≠ זהות.',
        primary: 'back',
        secondary: 'fixture',
      },
      'session-not-found': {
        title: 'ה-session לא נמצא',
        body: 'ייתכן שפג תוקף או שהמזהה שגוי. אפשר להתחיל גילוי חדש או להריץ הדגמת פיקסצ׳ר. שגיאה ≠ no-match · לא זהות.',
        primary: 'back',
        secondary: 'fixture',
      },
      'fixture-miss': {
        title: 'פיקסצ׳ר לא נמצא',
        body: 'אין התאמה בקטלוג ההדגמה ל-seed הזה. נסו seed=seed-person-he / seed-person-latin / seed-domain-org, או חזרו לחיפוש רגיל. שגיאה ≠ זהות.',
        primary: 'back',
        secondary: 'retry',
      },
      'sse-disconnect': {
        title: 'ניתוק מהזרם החי (SSE)',
        body: 'החיבור לזרם נותק אחרי ניסיונות חזרה. אפשר לנסות שוב, לעבור להדגמה, או לחזור לטופס. ניתוק ≠ no-match · לא זהות.',
        primary: 'retry',
        secondary: 'fixture',
      },
      network: {
        title: 'תקלת רשת / שרת',
        body: 'לא הצלחנו להשלים את הבקשה. אפשר לנסות שוב או להדגמת פיקסצ׳ר מקומית. שגיאה ≠ no-match.',
        primary: 'retry',
        secondary: 'fixture',
      },
      generic: {
        title: 'לא הצלחנו להשלים את הגילוי',
        body: 'אפשר לנסות שוב, להריץ הדגמה, או לחזור לטופס. שגיאה ≠ no-match · INFORMATION ≠ IDENTITY.',
        primary: 'retry',
        secondary: 'fixture',
      },
    }[kind] || {
      title: 'לא הצלחנו להשלים את הגילוי',
      body: 'אפשר לנסות שוב או להדגמה. שגיאה ≠ no-match.',
      primary: 'retry',
      secondary: 'fixture',
    };
    const btn = {
      retry: `<button type="button" id="disc-retry" class="disc-btn-primary">נסה שוב</button>`,
      fixture: `<button type="button" class="secondary" id="disc-retry-fixture">הדגמה (פיקסצ׳ר)</button>`,
      back: `<button type="button" class="secondary" id="disc-error-back">חזרה לטופס</button>`,
    };
    const primary = btn[copy.primary] || btn.retry;
    const secondary = btn[copy.secondary] || btn.fixture;
    const tertiary = copy.primary === 'back' || copy.secondary === 'back'
      ? (copy.primary !== 'retry' && copy.secondary !== 'retry' ? btn.retry : '')
      : btn.back;
    return `<div class="disc-error-card" role="alert" data-error-kind="${esc(kind)}">
      <div class="disc-error-kicker">${esc(kind)}</div>
      <strong class="disc-error-title">${esc(copy.title)}</strong>
      <p class="disc-error-detail">${esc(discState.errorMessage)}</p>
      <p class="disc-error-body">${esc(copy.body)}</p>
      <div class="disc-retry-row">
        ${primary}
        ${secondary}
        ${tertiary}
      </div>
    </div>`;
  }

  function renderDiscovery() {
    const out = document.getElementById('out');
    if (!out) return;
    out.dataset.surface = 'discovery';
    out.className = 'disc-out';
    out.setAttribute('tabindex', '-1');
    out.setAttribute('aria-label', 'תוצאות גילוי');
    discState.lifeStage = deriveLifeStage(discState);
    discState.graph = ensureGraph(discState);
    const evMap = evidenceMap(discState.evidence);
    const list = filteredFindings();
    const gaps = computeGaps(discState);
    const narrowBanner =
      discState.narrowSource && discState.narrowSource !== 'none'
        ? `<div class="disc-narrow-banner" role="status">תצוגה מסוננת · narrow:${esc(discState.narrowSource)} · הסינון אינו יוצר זהות ואינו מצמצם את מרחב האפשרויות ל־«זה האדם».</div>`
        : '';
    const mobileNav = `<nav class="disc-mobile-nav" aria-label="ניווט תוצאות">
      <a href="#disc-progress" aria-current="true">התקדמות</a>
      <a href="#disc-sec-exec">סיכום</a>
      <a href="#disc-sec-findings">ממצאים</a>
      <a href="#disc-sec-evidence">ראיות</a>
      <a href="#disc-sec-rel">קשרים</a>
      <a href="#disc-sec-graph">גרף</a>
      <a href="#disc-sec-src">מקורות</a>
      <a href="#disc-sec-gaps">פערים</a>
      <a href="#disc-facets">מסננים</a>
    </nav>`;
    out.innerHTML = `
      <p class="disc-workspace-label">INVESTIGATION WORKSPACE · DISCOVERY</p>
      <nav class="disc-skip-row" aria-label="דילוג בתוך תוצאות גילוי">
        <a href="#disc-progress">להתקדמות</a>
        <a href="#disc-sec-findings">לממצאים</a>
        <a href="#disc-sec-graph">לגרף</a>
        <a href="#disc-facets">למסננים</a>
      </nav>
      <div class="mode"><span>מצב: גילוי (Discovery)</span><span class="chip">INFORMATION ≠ IDENTITY</span><span class="chip">UNKNOWN ≠ FALSE</span><span class="chip">CANDIDATE ≠ FACT</span>${discState.q ? `<span class="chip">Seed: ${esc(discState.q)}</span>` : ''}</div>
      ${renderErrorRecovery()}
      ${renderProgressStrip()}
      ${mobileNav}
      ${narrowBanner}
      <div class="disc-layout">
        ${renderFacets()}
        <div class="disc-main-col" id="disc-results" role="region" aria-label="תוצאות גילוי · INFORMATION ≠ IDENTITY">
          <div class="disc-hier">
            ${renderExecutiveSummary(list, gaps)}
            ${renderFindingsSection(list, evMap)}
            ${renderEvidenceSection(list, evMap)}
            ${renderRelationshipsSection(discState.graph)}
            ${renderGraphPanel(discState.graph)}
            ${renderSourcesSection()}
            ${renderGapsSection(gaps)}
          </div>
        </div>
      </div>
      <p class="disc-footer-note">אין דיוקן · אין תיק זהות · אין «זה האדם» · ראיות ניתנות לבדיקה · אין graph laundering — קשת view-derived מסומנת במפורש · URL לבד ≠ זהות.</p>
    `;
    bindDiscoveryResultHandlers(out);
    const skip = document.querySelector('a.skip-link');
    if (skip) skip.setAttribute('href', '#disc-progress');
    // Move focus to results region once progressive content appears (a11y)
    if (
      discState._focusResultsOnce !== true &&
      ((discState.findings || []).length > 0 || discState.status === 'complete' || discState.status === 'failed_soft')
    ) {
      discState._focusResultsOnce = true;
      try {
        const exec = document.getElementById('disc-sec-exec') || out;
        if (exec && typeof exec.focus === 'function') exec.setAttribute('tabindex', '-1'), exec.focus({ preventScroll: true });
      } catch (_) {}
    }
    if (discState.status === 'idle' || (discState.status === 'running' && !(discState.findings || []).length)) {
      discState._focusResultsOnce = false;
    }
  }

  function showEdgeDetail(edgeId, hostId) {
    const host = document.getElementById(hostId);
    if (!host) return;
    const edges = (discState.graph && discState.graph.edges) || [];
    const e = edges.find((x) => String(x.id) === String(edgeId));
    if (!e) {
      host.setAttribute('hidden', '');
      return;
    }
    discState.selectedEdgeId = edgeId;
    const rel = e.relationship || e.kind || 'unknown';
    const evMap = evidenceMap(discState.evidence);
    const directItems = Array.isArray(e.evidence) ? e.evidence : [];
    const directIds = Array.isArray(e.evidenceIds) ? e.evidenceIds : [];
    const findingIds = e.findingIds || [e.from || e.source, e.to || e.target].filter(Boolean);
    const evidenceIds = directIds.length ? directIds : findingIds.flatMap((fid) => {
      const f = (discState.findings || []).find((x) => x.id === fid);
      return f && Array.isArray(f.evidenceIds) ? f.evidenceIds : [];
    });
    const evBits = [];
    const edgeEvidence = directItems.length ? directItems : [...new Set(evidenceIds)].map((eid) => evMap.get(eid) || evMap.get(String(eid))).filter(Boolean);
    edgeEvidence.forEach((ev) => {
      const href = safeHref(ev.provenanceUrl || ev.url);
      const link = href !== '#' ? `<a class="disc-ev-link" href="${href}" target="_blank" rel="noopener noreferrer">${esc(ev.provenanceUrl || ev.url || '')}</a>` : esc(ev.provenanceUrl || ev.url || '');
      evBits.push(`<div><strong>${esc(ev.providerId || ev.provider || 'מקור')}</strong> · ${link}${ev.quote ? ` — <q>${esc(ev.quote)}</q>` : ''}</div>`);
    });
    host.innerHTML = `
      <div><strong>קשת נבחרה</strong> · ${relBadge(rel)} · id <span class="mono">${esc(e.id)}</span></div>
      <div style="margin-top:6px">מצב סמנטי: <strong>${esc(REL_CLASS[rel] === 'fact' ? 'provenance-backed' : REL_CLASS[rel] === 'cand' ? 'CANDIDATE (לא עובדה)' : 'UNKNOWN')}</strong> — לא זהות.</div>
      ${e.derived ? '<div style="margin-top:6px">קשת זו נגזרה לתצוגה מ־findings→seed ואינה מחליפה edge שרת.</div>' : ''}
      <div style="margin-top:8px">${evBits.join('') || '<span class="disc-muted">אין evidence ids מקושרים לקשת — בדקו את כרטיס הממצא.</span>'}</div>
    `;
    host.removeAttribute('hidden');
  }

  function bindDiscoveryResultHandlers(out) {
    out.querySelectorAll('.disc-facet-chip').forEach((btn) => {
      btn.onclick = () => toggleFacet(btn.getAttribute('data-fkey'), btn.getAttribute('data-fval'));
    });
    const clear = document.getElementById('disc-facet-clear');
    if (clear) clear.onclick = () => clearFacets();
    out.querySelectorAll('.disc-prov-toggle').forEach((btn) => {
      if (btn.classList.contains('disc-focus-node')) return;
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
    out.querySelectorAll('[data-prov-close]').forEach((btn) => {
      btn.onclick = () => {
        const panel = btn.closest('.disc-provenance');
        const card = btn.closest('.disc-finding');
        const toggle = card && card.querySelector('.disc-prov-toggle:not(.disc-focus-node)');
        if (panel) panel.setAttribute('hidden', '');
        if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
      };
    });
    out.querySelectorAll('.disc-copy-link').forEach((btn) => {
      btn.onclick = async () => {
        const url = btn.getAttribute('data-copy-url') || '';
        if (!url) return;
        const prev = btn.textContent;
        btn.disabled = true;
        const result = await copyDiscoveryUrl(url);
        if (result.ok) {
          btn.textContent = result.method === 'prompt' ? 'הוצג להעתקה' : 'הועתק';
          announceSseLive(
            result.method === 'prompt'
              ? 'קישור הוצג להעתקה ידנית · לא זהות'
              : 'קישור מקור הועתק · לא זהות',
          );
        } else {
          btn.textContent = prev || 'העתק קישור';
          announceSseLive('העתקה נכשלה · סמנו את הקישור ידנית');
        }
        setTimeout(() => { btn.textContent = prev || 'העתק קישור'; btn.disabled = false; }, 1600);
      };
    });
    out.querySelectorAll('[data-node]').forEach((btn) => {
      btn.onclick = () => {
        discState.focusedNodeId = btn.getAttribute('data-node');
        renderDiscovery();
        const g = document.getElementById('disc-sec-graph');
        if (g) g.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
    });
    out.querySelectorAll('[data-edge]').forEach((el) => {
      el.onclick = () => {
        const id = el.getAttribute('data-edge');
        showEdgeDetail(id, 'disc-edge-detail');
        showEdgeDetail(id, 'disc-graph-edge-detail');
      };
      el.onkeydown = (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          el.click();
        }
      };
    });
    const retry = document.getElementById('disc-retry');
    if (retry) {
      retry.onclick = () => {
        discState.errorMessage = null;
        startDiscovery();
      };
    }
    const retryFx = document.getElementById('disc-retry-fixture');
    if (retryFx) {
      retryFx.onclick = async () => {
        discState.errorMessage = null;
        try {
          const idx = await loadFixtureIndex();
          const entry = (idx.fixtures || [])[0];
          if (!entry) return startDiscovery();
          const data = await loadFixtureFile(entry.file);
          const input = document.getElementById('disc-q');
          if (input) input.value = data.q || '';
          return startDiscovery({ forceFixture: true, fixtureData: data });
        } catch (_) {
          startDiscovery();
        }
      };
    }
    // Keyboard: roving tabindex + Enter opens evidence + Escape closes provenance
    const bindRoving = (root) => {
      if (!root) return;
      const cards = [...root.querySelectorAll('.disc-finding')];
      if (!cards.length) return;
      cards.forEach((card, idx) => {
        card.setAttribute('tabindex', idx === 0 ? '0' : '-1');
        card.setAttribute('aria-selected', 'false');
        card.onkeydown = (ev) => {
          const list = [...root.querySelectorAll('.disc-finding')];
          const i = list.indexOf(card);
          if (ev.key === 'ArrowDown' || ev.key === 'ArrowLeft') {
            ev.preventDefault();
            const next = list[Math.min(list.length - 1, i + 1)] || list[0];
            list.forEach((c) => { c.tabIndex = -1; c.setAttribute('aria-selected', 'false'); });
            next.tabIndex = 0;
            next.setAttribute('aria-selected', 'true');
            next.focus();
          } else if (ev.key === 'ArrowUp' || ev.key === 'ArrowRight') {
            ev.preventDefault();
            const prev = list[Math.max(0, i - 1)] || list[list.length - 1];
            list.forEach((c) => { c.tabIndex = -1; c.setAttribute('aria-selected', 'false'); });
            prev.tabIndex = 0;
            prev.setAttribute('aria-selected', 'true');
            prev.focus();
          } else if (ev.key === 'Home') {
            ev.preventDefault();
            list.forEach((c) => { c.tabIndex = -1; c.setAttribute('aria-selected', 'false'); });
            list[0].tabIndex = 0;
            list[0].setAttribute('aria-selected', 'true');
            list[0].focus();
          } else if (ev.key === 'End') {
            ev.preventDefault();
            list.forEach((c) => { c.tabIndex = -1; c.setAttribute('aria-selected', 'false'); });
            const last = list[list.length - 1];
            last.tabIndex = 0;
            last.setAttribute('aria-selected', 'true');
            last.focus();
          } else if (ev.key === 'Enter' || ev.key === ' ') {
            if (ev.target && ev.target.closest && ev.target.closest('button,a')) return;
            ev.preventDefault();
            const btn = card.querySelector('.disc-prov-toggle:not(.disc-focus-node)');
            if (btn) btn.click();
          } else if (ev.key === 'Escape') {
            const panel = card.querySelector('.disc-provenance');
            const btn = card.querySelector('.disc-prov-toggle:not(.disc-focus-node)');
            if (panel && !panel.hasAttribute('hidden')) {
              ev.preventDefault();
              panel.setAttribute('hidden', '');
              if (btn) { btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
            }
          }
        };
      });
    };
    bindRoving(out.querySelector('.disc-findings-hi'));
    bindRoving(out.querySelector('.disc-findings-rest'));
    // Document-level Escape closes any open provenance when focus inside discovery out
    if (!out.dataset.escProvenanceBound) {
      out.dataset.escProvenanceBound = '1';
      out.addEventListener('keydown', (ev) => {
        if (ev.key !== 'Escape') return;
        const openPanel = out.querySelector('.disc-provenance:not([hidden])');
        if (!openPanel) return;
        const card = openPanel.closest('.disc-finding');
        const btn = card && card.querySelector('.disc-prov-toggle:not(.disc-focus-node)');
        openPanel.setAttribute('hidden', '');
        if (btn) { btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
        ev.preventDefault();
      });
    }
    // Mobile section jump: mark aria-current (CSS already styles it)
    out.querySelectorAll('.disc-mobile-nav a').forEach((a) => {
      a.addEventListener('click', () => {
        out.querySelectorAll('.disc-mobile-nav a').forEach((x) => x.removeAttribute('aria-current'));
        a.setAttribute('aria-current', 'true');
      });
    });
    out.querySelectorAll('[data-graph-filter]').forEach((btn) => {
      btn.onclick = () => {
        graphFilter = btn.getAttribute('data-graph-filter') || 'all';
        discState.graphFilter = graphFilter;
        renderDiscovery();
        const graph = document.getElementById('disc-sec-graph');
        if (graph) graph.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
    });
    // Facet drawer: Escape + focus trap (mobile) + aria-expanded sync
    
    // Checkpoint H · empty/error recovery actions
    const clearEmptyFacets = document.getElementById('disc-empty-clear-facets');
    if (clearEmptyFacets) {
      clearEmptyFacets.onclick = () => {
        if (typeof clearFacets === 'function') clearFacets();
        else {
          selectedFacets = {};
          discState.narrowSource = 'none';
          renderDiscovery();
        }
      };
    }
    const emptyBack = document.getElementById('disc-empty-back');
    if (emptyBack) {
      emptyBack.onclick = () => {
        const q = document.getElementById('disc-q');
        if (q) q.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }
    const errBack = document.getElementById('disc-error-back');
    if (errBack) {
      errBack.onclick = () => {
        discState.errorMessage = null;
        const q = document.getElementById('disc-q');
        if (q) q.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        renderDiscovery();
      };
    }
    const graphFilterAll = document.getElementById('disc-graph-filter-all');
    if (graphFilterAll) {
      graphFilterAll.onclick = () => {
        graphFilter = 'all';
        discState.graphFilter = 'all';
        renderDiscovery();
      };
    }
    const graphResetEmpty = document.getElementById('disc-graph-zoom-reset-empty');
    if (graphResetEmpty) {
      graphResetEmpty.onclick = () => {
        if (typeof resetGraphView === 'function') resetGraphView();
        renderDiscovery();
      };
    }
    
    bindFacetDrawerA11y(out);
    // Graph canvas zoom/pan/pinch + toolbar
    bindGraphCanvasControls(out);
  }

  function applySnapshot(snap, meta = {}) {
    if (!snap || typeof snap !== 'object') {
      renderDiscovery();
      return;
    }
    const merge = meta.merge === true;
    let findings;
    if (Array.isArray(snap.findings)) {
      findings = merge
        ? mergeById(discState.findings, snap.findings)
        : snap.findings;
    } else {
      findings = discState.findings || [];
    }
    let evidence;
    if (Array.isArray(snap.evidence)) {
      evidence = merge
        ? mergeById(discState.evidence, snap.evidence)
        : snap.evidence;
    } else {
      evidence = discState.evidence || [];
    }

    // Never wipe a good feed with an empty non-narrow snapshot (replay / soft glitch)
    if (
      !merge &&
      Array.isArray(snap.findings) &&
      snap.findings.length === 0 &&
      (discState.findings || []).length > 0 &&
      meta.narrowSource !== 'server' &&
      meta.allowEmptyFindings !== true
    ) {
      findings = discState.findings;
    }

    const prevStatus =
      discState.status === 'reconnecting'
        ? discState.statusBeforeReconnect || 'running'
        : discState.status;
    let nextStatus = snap.status || prevStatus || 'partial';
    // Do not regress terminal → running on reconnect/replay paint
    if (
      meta.preserveTerminal !== false &&
      isTerminalStatus(prevStatus, discState.providers) &&
      nextStatus === 'running'
    ) {
      nextStatus = prevStatus;
    }

    const parsedSnapGraph = parseGraphFromSse(snap);
    let nextGraph = discState.graph || { nodes: [], edges: [] };
    let nextGraphFromServer = !!discState.graphFromServer;
    if (parsedSnapGraph) {
      nextGraph = {
        nodes: merge
          ? mergeById((discState.graph && discState.graph.nodes) || [], parsedSnapGraph.nodes || [])
          : parsedSnapGraph.nodes || [],
        edges: merge
          ? mergeById((discState.graph && discState.graph.edges) || [], parsedSnapGraph.edges || [])
          : parsedSnapGraph.edges || [],
        meta: { ...((discState.graph && discState.graph.meta) || {}), ...(parsedSnapGraph.meta || {}), source: 'server' },
      };
      nextGraphFromServer = true;
    } else if (snap.graph && typeof snap.graph === 'object') {
      nextGraph = {
        nodes: Array.isArray(snap.graph.nodes) ? snap.graph.nodes : (discState.graph && discState.graph.nodes) || [],
        edges: Array.isArray(snap.graph.edges) ? snap.graph.edges : (discState.graph && discState.graph.edges) || [],
        meta: { ...((snap.graph && snap.graph.meta) || {}), source: 'server' },
      };
      nextGraphFromServer = true;
    }

    const parsedSnapPlan = parsePlanFromSse(snap);
    const nextPlan = parsedSnapPlan || discState.queryPlan || null;
    const nextServerStage =
      snap.stage ||
      snap.lifeStage ||
      snap.lifecyclePhase ||
      (snap.progress && (snap.progress.stage || snap.progress.lifecyclePhase)) ||
      discState.serverStage ||
      null;

    const prevSoft = {
      budgetTelemetry: discState.budgetTelemetry,
      budgetExhaustedReason: discState.budgetExhaustedReason,
      familyJournal: discState.familyJournal,
      planSseSeen: discState.planSseSeen,
      stageSource: discState.stageSource,
      _focusResultsOnce: discState._focusResultsOnce,
      nightLoop: discState.nightLoop,
      frontier: discState.frontier,
      missionMemory: discState.missionMemory,
      stopReason: discState.stopReason,
      hopJournal: discState.hopJournal,
    };

    discState = {
      findings,
      evidence,
      facets: Array.isArray(snap.facets) ? snap.facets : discState.facets || [],
      status: nextStatus,
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
      statusBeforeReconnect: null,
      reconnectAttempt: 0,
      graph: nextGraph,
      contradictions: Array.isArray(snap.contradictions)
        ? snap.contradictions
        : discState.contradictions || [],
      softEr: snap.softEr !== undefined ? snap.softEr : discState.softEr,
      gaps: Array.isArray(snap.gaps) ? snap.gaps : discState.gaps || [],
      urlDomainCandidates: Array.isArray(snap.urlDomainCandidates)
        ? snap.urlDomainCandidates
        : Array.isArray(snap.url_domain_candidates)
          ? snap.url_domain_candidates
          : discState.urlDomainCandidates || [],
      urlTargets: Array.isArray(snap.urlTargets)
        ? snap.urlTargets
        : discState.urlTargets || [],
      generalWebHits: Array.isArray(snap.generalWebHits)
        ? snap.generalWebHits
        : Array.isArray(snap.searchHits)
          ? snap.searchHits
          : discState.generalWebHits || [],
      focusedNodeId: discState.focusedNodeId,
      selectedEdgeId: discState.selectedEdgeId,
      graphFilter: discState.graphFilter || 'all',
      seedKind: discState.seedKind || 'name',
      errorMessage: meta.errorMessage !== undefined ? meta.errorMessage : discState.errorMessage,
      serverStage: nextServerStage,
      queryPlan: nextPlan,
      lifeStage: 'PLANNING',
      nightLoop: snap.nightLoop || prevSoft.nightLoop || null,
      frontier: snap.frontier || prevSoft.frontier || null,
      missionMemory: snap.missionMemory || prevSoft.missionMemory || null,
      stopReason:
        snap.stopReason ||
        (snap.nightLoop && snap.nightLoop.stopReason) ||
        prevSoft.stopReason ||
        null,
      hopJournal: Array.isArray(snap.hopJournal)
        ? snap.hopJournal
        : prevSoft.hopJournal || null,
      budgetTelemetry: snap.budgetTelemetry || prevSoft.budgetTelemetry || null,
      budgetExhaustedReason:
        snap.budgetExhaustedReason || prevSoft.budgetExhaustedReason || null,
      familyJournal: Array.isArray(snap.familyJournal)
        ? snap.familyJournal
        : prevSoft.familyJournal || null,
      graphFromServer: nextGraphFromServer,
      planSseSeen: !!parsedSnapPlan || !!prevSoft.planSseSeen || !!nextPlan,
      stageSource: prevSoft.stageSource || null,
      _focusResultsOnce: prevSoft._focusResultsOnce,
    };
    if (parsedSnapPlan) applyParsedPlan(parsedSnapPlan, {});  // plan soft · do not overwrite stageSource
    ingestBudgetFamilyFromPayload(snap);
    ingestMissionFields(discState, snap);
    if (nextServerStage) noteServerStage(nextServerStage, { source: 'server', allowRegress: true });
    discState.lifeStage = deriveLifeStage(discState);
    stripIdentityChrome(discState);
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

  function clearReconnectOverlay() {
    if (discState.status === 'reconnecting') {
      discState.status = discState.statusBeforeReconnect || 'running';
    }
    discState.statusBeforeReconnect = null;
    discState.reconnectAttempt = 0;
  }

  function settleTerminalStatus(explicit) {
    clearReconnectOverlay();
    if (explicit && isTerminalStatus(explicit, discState.providers)) {
      discState.status = explicit;
    } else if (!isTerminalStatus(discState.status, discState.providers)) {
      discState.status = explicit || 'complete';
    }
    discState.transport = discState.transport || 'sse';
  }

  function applySsePayload(eventName, data, lastEventId) {
    if (!data || typeof data !== 'object') return false;
    const type = String(eventName || data.type || data.event || 'message').toLowerCase();
    noteSseCursor(data, lastEventId);
    // Drop reconnecting overlay as soon as real traffic resumes
    if (discState.status === 'reconnecting' && type !== 'error') {
      clearReconnectOverlay();
    }

    if (type === 'error' && (data.error || data.message)) {
      // Soft provider error may carry failed_soft — settle, don't thrash
      if (data.status === 'failed_soft' || data.status === 'partial') {
        settleTerminalStatus(data.status);
        renderDiscovery();
        return true;
      }
      throw new Error(String(data.error || data.message));
    }

    // Server meta frame (sessionId / seed) — never treat as full snapshot wipe
    if (type === 'meta') {
      if (data.sessionId) discState.sessionId = data.sessionId;
      if (data.q || data.seed) discState.q = data.q || data.seed;
      discState.transport = 'sse';
      stripIdentityChrome(discState);
      renderDiscovery();
      return false;
    }

    // Per-provider state updates
    if (type === 'provider') {
      const pid = data.providerId || data.id;
      if (pid) {
        discState.providers = { ...(discState.providers || {}), [pid]: data.state || data.status || 'ok' };
      }
      if (data.providers) discState.providers = { ...discState.providers, ...data.providers };
      discState.transport = 'sse';
      renderDiscovery();
      return false;
    }

    // Full snapshot / session projection (named events or default message with findings[])
    // Require findings[] or status+facets — bare sessionId (meta-shaped) must not wipe.
    if (
      type === 'snapshot' ||
      type === 'session' ||
      (type === 'message' && Array.isArray(data.findings))
    ) {
      if (Array.isArray(data.findings) || data.status || data.facets) {
        applySnapshot(data, {
          source: 'api',
          sessionId: data.sessionId || discState.sessionId,
          q: discState.q,
          narrowSource: 'none',
          transport: 'sse',
          cursor: discState.cursor,
          merge: metaMergeHint(data),
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
      if (data.status && data.status !== 'reconnecting') discState.status = data.status;
      if (data.progress) discState.progress = data.progress;
      if (data.providers) discState.providers = data.providers;
      if (data.stage) noteServerStage(data.stage, { source: 'server' });
      else if (data.progress && data.progress.stage) noteServerStage(data.progress.stage, { source: 'server' });
      else noteServerStage('FINDINGS', { source: 'sse-finding' });
      discState.transport = 'sse';
      stripIdentityChrome(discState);
      renderDiscovery();
      return isTerminalStatus(discState.status, discState.providers);
    }

    if (type === 'progress' || type === 'chunk') {
      if (data.status && data.status !== 'reconnecting') discState.status = data.status;
      if (data.progress) discState.progress = data.progress;
      if (data.providers) discState.providers = data.providers;
      if (Array.isArray(data.findings)) {
        data.findings.forEach((f) => mergeFindingChunk(f, data.evidence || []));
      }
      ingestBudgetFamilyFromPayload(data);
      ingestMissionFields(discState, data);
      // Soft plan hitchhiker on progress (some dual-run emits)
      const hitchPlan = parsePlanFromSse(data);
      if (hitchPlan) applyParsedPlan(hitchPlan, { source: 'sse-progress' });
      // Foundation emits stage / lifecyclePhase on progress (S1…S10 / PLAN / DISCOVER / PLANNING…)
      if (data.lifecyclePhase) noteServerStage(data.lifecyclePhase, { source: 'sse-lifecycle' });
      else if (data.phase) noteServerStage(data.phase, { source: 'sse-phase' });
      else if (data.stage) noteServerStage(data.stage, { source: 'server' });
      else if (data.progress && data.progress.stage) noteServerStage(data.progress.stage, { source: 'server' });
      else if (data.progress && data.progress.lifecyclePhase) {
        noteServerStage(data.progress.lifecyclePhase, { source: 'sse-lifecycle' });
      }
      discState.transport = 'sse';
      renderDiscovery();
      return false; // progress alone never ends the stream
    }

    if (type === 'status') {
      if (data.status) discState.status = data.status;
      if (data.progress) discState.progress = data.progress;
      if (data.providers) discState.providers = data.providers;
      if (Array.isArray(data.findings)) {
        data.findings.forEach((f) => mergeFindingChunk(f, data.evidence || []));
      }
      ingestBudgetFamilyFromPayload(data);
      ingestMissionFields(discState, data);
      const hitchPlan = parsePlanFromSse(data);
      if (hitchPlan) applyParsedPlan(hitchPlan, { source: 'sse-status' });
      const hitchGraph = parseGraphFromSse(data);
      if (hitchGraph) applyParsedGraph(hitchGraph, { source: 'sse-status' });
      if (data.stage) noteServerStage(data.stage, { source: 'server' });
      else if (data.lifecyclePhase) noteServerStage(data.lifecyclePhase, { source: 'sse-lifecycle' });
      discState.transport = 'sse';
      renderDiscovery();
      // status may be terminal; wait for `done` when present, but settle if clearly terminal
      return isTerminalStatus(data.status, data.providers || discState.providers);
    }

    if (type === 'facets') {
      if (Array.isArray(data.facets)) discState.facets = data.facets;
      else if (Array.isArray(data)) discState.facets = data;
      discState.transport = 'sse';
      renderDiscovery();
      return false;
    }

    // GO-IMPL-500: graceful new lifecycle / graph events (compatible with B0 names)
    if (
      type === 'planning' ||
      type === 'plan' ||
      type === 'stage' ||
      type === 'lifecycle' ||
      type === 'discovery' ||
      type === 'start' ||
      type === 'meta'
    ) {
      if (data.status && data.status !== 'reconnecting') discState.status = data.status;
      if (data.progress) discState.progress = data.progress;
      if (data.providers) discState.providers = { ...discState.providers, ...data.providers };
      ingestBudgetFamilyFromPayload(data);
      ingestMissionFields(discState, data);
      // Soft Foundation surface — defensive parse; never invent plan; never treat as identity
      const parsedPlan = parsePlanFromSse(data);
      if (parsedPlan) applyParsedPlan(parsedPlan, { source: type === 'plan' ? 'sse-plan' : 'sse-event' });
      if (data.lifecyclePhase) noteServerStage(data.lifecyclePhase, { source: 'sse-lifecycle' });
      else if (data.stage) noteServerStage(data.stage, { source: 'server' });
      else if (data.lifeStage) noteServerStage(data.lifeStage, { source: 'server' });
      else if (type === 'start' || type === 'meta') noteServerStage('START', { source: 'sse-event' });
      else if (type === 'planning' || type === 'plan') noteServerStage('PLANNING', { source: 'sse-plan' });
      else if (type === 'discovery') noteServerStage('DISCOVERY', { source: 'sse-event' });
      discState.transport = 'sse';
      discState.lifeStage = deriveLifeStage(discState);
      renderDiscovery();
      return false;
    }

    if (type === 'evidence') {
      const evItems = Array.isArray(data.evidence)
        ? data.evidence
        : data.evidenceItem
          ? [data.evidenceItem]
          : Array.isArray(data)
            ? data
            : [];
      if (evItems.length) {
        const ev = discState.evidence ? discState.evidence.slice() : [];
        const byId = new Map(ev.map((e) => [e.id, e]));
        evItems.forEach((e) => {
          if (!e || !e.id) return;
          byId.set(e.id, { ...(byId.get(e.id) || {}), ...e });
        });
        discState.evidence = [...byId.values()];
      }
      noteServerStage('EVIDENCE', { source: 'sse-evidence' });
      discState.transport = 'sse';
      renderDiscovery();
      return false;
    }

    if (type === 'relationships' || type === 'relationship' || type === 'graph') {
      const parsed = parseGraphFromSse(data);
      if (parsed) {
        applyParsedGraph(parsed, { source: type === 'graph' ? 'sse-graph' : 'sse-rel' });
      } else if (data.graph && typeof data.graph === 'object') {
        // Fallback soft merge if parser rejected empty-but-present envelope
        discState.graph = {
          nodes: Array.isArray(data.graph.nodes)
            ? mergeById((discState.graph && discState.graph.nodes) || [], data.graph.nodes)
            : (discState.graph && discState.graph.nodes) || [],
          edges: Array.isArray(data.graph.edges)
            ? mergeById((discState.graph && discState.graph.edges) || [], data.graph.edges)
            : (discState.graph && discState.graph.edges) || [],
        };
        discState.graphFromServer = true;
      }
      ingestBudgetFamilyFromPayload(data);
      ingestMissionFields(discState, data);
      if (data.lifecyclePhase) noteServerStage(data.lifecyclePhase, { source: 'sse-lifecycle' });
      else if (type === 'graph') noteServerStage('GRAPH', { source: 'sse-graph' });
      else noteServerStage('RELATIONSHIPS', { source: 'sse-rel' });
      discState.transport = 'sse';
      stripIdentityChrome(discState);
      renderDiscovery();
      return false;
    }

    if (type === 'gaps' || type === 'unknown') {
      if (Array.isArray(data.gaps)) discState.gaps = data.gaps;
      else if (Array.isArray(data.items)) discState.gaps = data.items;
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
      if (Array.isArray(data.findings) && data.findings.length) {
        applySnapshot(data, {
          source: 'api',
          sessionId: discState.sessionId,
          q: discState.q,
          narrowSource: 'none',
          transport: 'sse',
          cursor: discState.cursor,
          merge: true,
        });
      }
      settleTerminalStatus(data.status || null);
      if (data.progress) discState.progress = data.progress;
      if (data.providers) discState.providers = data.providers;
      ingestBudgetFamilyFromPayload(data);
      ingestMissionFields(discState, data);
      const donePlan = parsePlanFromSse(data);
      if (donePlan) applyParsedPlan(donePlan, { source: 'sse-done' });
      const doneGraph = parseGraphFromSse(data);
      if (doneGraph) applyParsedGraph(doneGraph, { source: 'sse-done' });
      if (data.lifecyclePhase) noteServerStage(data.lifecyclePhase, { source: 'sse-lifecycle' });
      stripIdentityChrome(discState);
      renderDiscovery();
      return true;
    }

    return isTerminalStatus(data.status, data.providers || discState.providers);
  }

  /** Prefer merge when payload looks like additive replay fragment. */
  function metaMergeHint(data) {
    if (data && data.merge === true) return true;
    // If we already have findings and payload findings overlap by id → merge-safe
    if (
      (discState.findings || []).length &&
      Array.isArray(data.findings) &&
      data.findings.some((f) => f && discState.findings.some((e) => e.id === f.id))
    ) {
      return true;
    }
    return false;
  }

  /**
   * Arch BOUNDARIES SSE: terminal status ∈ { partial, complete, failed_soft }.
   * `running` keeps the stream/poll alive; anything else ends progressive intake.
   */
  function isTerminalStatus(st, providers) {
    if (!st || st === 'running' || st === 'idle' || st === 'reconnecting') return false;
    if (st === 'complete' || st === 'failed_soft') return true;
    if (st === 'partial') {
      // Soft-terminal when no provider still pending (budget / fan-out done)
      if (!providers || !Object.keys(providers).length) return true;
      return Object.values(providers).every((s) => s && s !== 'pending');
    }
    return false;
  }

  /**
   * Prefer EventSource on …/events.
   * Hardened: cursor / Last-Event-ID resume, exponential backoff reconnect,
   * no infinite thrash after terminal, GET snapshot fallback after exhaustion.
   * Rejects quickly on first-connect failure so caller can poll.
   */
  function runViaSse(sessionId, q, signal) {
    return new Promise((resolve, reject) => {
      if (typeof EventSource === 'undefined') {
        reject(new Error('EventSource unsupported'));
        return;
      }

      let settled = false;
      let reachedTerminal = false;
      let attempt = 0;
      let sawEventOnThisConnect = false;
      let everSawEvent = false;
      let bootTimer = null;
      let reconnectTimer = null;
      let es = null;

      const clearBoot = () => {
        if (bootTimer) {
          clearTimeout(bootTimer);
          bootTimer = null;
        }
      };
      const clearReconnectTimer = () => {
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
      };

      const finish = (fn, arg) => {
        if (settled) return;
        settled = true;
        reachedTerminal = true;
        clearBoot();
        clearReconnectTimer();
        try {
          if (signal) signal.removeEventListener('abort', onAbort);
        } catch (_) {}
        closeSse();
        clearReconnectOverlay();
        fn(arg);
      };

      const onAbort = () => finish(reject, new DOMException('Aborted', 'AbortError'));

      const markReconnecting = () => {
        if (settled || reachedTerminal) return;
        if (discState.status !== 'reconnecting') {
          discState.statusBeforeReconnect =
            discState.status === 'reconnecting'
              ? discState.statusBeforeReconnect
              : discState.status;
          discState.status = 'reconnecting';
        }
        discState.reconnectAttempt = attempt;
        discState.transport = 'sse';
        renderDiscovery();
      };

      const buildUrl = () => {
        let url = `/api/discovery/sessions/${encodeURIComponent(sessionId)}/events`;
        const qs = [];
        if (discState.cursor != null && discState.cursor !== '') {
          const c = String(discState.cursor);
          qs.push(`cursor=${encodeURIComponent(c)}`);
          qs.push(`lastEventId=${encodeURIComponent(c)}`);
        }
        if (qs.length) url += `?${qs.join('&')}`;
        return url;
      };

      const fallbackGetThenSettle = async () => {
        try {
          const snap = await fetchSessionSnapshot(sessionId, signal);
          if (snap) {
            applySnapshot(snap, {
              source: 'api',
              sessionId,
              q: q || discState.q,
              narrowSource: 'none',
              transport: 'sse→get',
              merge: (discState.findings || []).length > 0,
            });
            finish(resolve, discState);
            return;
          }
        } catch (_) {}
        if (everSawEvent) finish(resolve, discState);
        else finish(reject, new Error('SSE reconnect exhausted'));
      };

      const scheduleReconnect = (reason) => {
        if (settled || reachedTerminal) return;
        // Already terminal under the overlay — settle, do not thrash
        const underlying =
          discState.status === 'reconnecting'
            ? discState.statusBeforeReconnect
            : discState.status;
        if (isTerminalStatus(underlying, discState.providers)) {
          finish(resolve, discState);
          return;
        }
        if (attempt >= SSE_MAX_RECONNECT) {
          fallbackGetThenSettle();
          return;
        }
        attempt += 1;
        markReconnecting();
        closeSse();
        clearBoot();
        const delay = Math.min(8000, SSE_BACKOFF_BASE_MS * Math.pow(2, attempt - 1));
        reconnectTimer = setTimeout(() => connect(`reconnect:${reason || 'error'}`), delay);
        discTimers.push(reconnectTimer);
      };

      const handle = (eventName, ev) => {
        if (settled) return;
        let data;
        try {
          data = JSON.parse(ev.data);
        } catch {
          return;
        }
        sawEventOnThisConnect = true;
        everSawEvent = true;
        clearBoot();
        try {
          const terminal = applySsePayload(eventName, data, ev.lastEventId || null);
          if (terminal) {
            reachedTerminal = true;
            finish(resolve, discState);
          }
        } catch (e) {
          // Soft settle if we already have a useful feed; else reject / reconnect
          if ((discState.findings || []).length && /failed_soft|partial/i.test(String(e && e.message))) {
            settleTerminalStatus('failed_soft');
            renderDiscovery();
            finish(resolve, discState);
          } else if (everSawEvent) {
            scheduleReconnect('payload-error');
          } else {
            finish(reject, e);
          }
        }
      };

      const attachHandlers = (source) => {
        source.onopen = () => {
          // open alone ≠ healthy (some stacks "open" on 404)
        };
        source.onmessage = (ev) => handle('message', ev);
        [
          'meta',
          'snapshot',
          'session',
          'finding',
          'findings',
          'progress',
          'provider',
          'status',
          'chunk',
          'facets',
          'complete',
          'done',
          'terminal',
          'error',
          'tombstone',
          'start',
          'planning',
          'plan',
          'stage',
          'lifecycle',
          'discovery',
          'evidence',
          'relationships',
          'relationship',
          'graph',
          'gaps',
          'unknown',
        ].forEach((name) => {
          source.addEventListener(name, (ev) => handle(name, ev));
        });
        source.onerror = () => {
          if (settled || reachedTerminal) return;
          const underlying =
            discState.status === 'reconnecting'
              ? discState.statusBeforeReconnect
              : discState.status;
          if (isTerminalStatus(underlying, discState.providers)) {
            finish(resolve, discState);
            return;
          }
          // Close to disable browser auto-reconnect thrash; we own backoff
          try {
            source.close();
          } catch (_) {}
          if (!sawEventOnThisConnect && attempt === 0 && !everSawEvent) {
            // First connect failed fast → let caller poll
            if (source.readyState === EventSource.CLOSED) {
              finish(reject, new Error('SSE closed before data'));
            }
            // else bootTimer decides
            return;
          }
          scheduleReconnect('onerror');
        };
      };

      const connect = () => {
        if (settled || reachedTerminal) return;
        if (signal && signal.aborted) {
          onAbort();
          return;
        }
        closeSse();
        clearBoot();
        sawEventOnThisConnect = false;
        const url = buildUrl();
        try {
          es = new EventSource(url);
          discEventSource = es;
        } catch (e) {
          if (attempt === 0 && !everSawEvent) {
            finish(reject, e);
          } else {
            scheduleReconnect('construct');
          }
          return;
        }
        attachHandlers(es);
        const bootMs = attempt === 0 ? SSE_BOOT_MS : Math.min(6000, SSE_BOOT_MS + attempt * 400);
        bootTimer = setTimeout(() => {
          if (settled || reachedTerminal || sawEventOnThisConnect) return;
          if (attempt === 0 && !everSawEvent) {
            finish(reject, new Error('SSE timeout / unavailable'));
          } else {
            try {
              es && es.close();
            } catch (_) {}
            scheduleReconnect('boot-timeout');
          }
        }, bootMs);
        discTimers.push(bootTimer);
      };

      if (signal) {
        if (signal.aborted) {
          onAbort();
          return;
        }
        signal.addEventListener('abort', onAbort);
      }
      connect();
    });
  }

  /** GET Acc-scrubbed session snapshot (replay-from-complete / reconnect fallback). */
  async function fetchSessionSnapshot(sessionId, signal) {
    const gr = await fetch(`/api/discovery/sessions/${encodeURIComponent(sessionId)}`, {
      signal,
      cache: 'no-store',
    });
    if (!gr.ok) return null;
    const body = await gr.json();
    // Support { ok, ...snap } or bare snap
    if (body && body.ok === false) return null;
    return body;
  }

  /**
   * Open an existing session (incl. already-complete): GET snapshot first (no blank),
   * then optional SSE replay with merge-by-id (no duplicate spam).
   */
  async function hydrateSession(sessionId, opts = {}) {
    const signal = opts.signal || (discAbort && discAbort.signal);
    const snap = await fetchSessionSnapshot(sessionId, signal);
    if (!snap) throw new Error('session not found');
    applySnapshot(snap, {
      source: 'api',
      sessionId,
      q: snap.q || snap.seed || opts.q || '',
      narrowSource: 'none',
      transport: 'get',
    });
    const terminal = isTerminalStatus(snap.status, snap.providers);
    const wantReplay =
      opts.replay === true ||
      params().get('replay') === '1' ||
      params().get('discoveryReplay') === '1';

    if (terminal) {
      if (wantReplay && preferSseTransport()) {
        // Full replay from cursor 0 — merge-by-id prevents spam; GET already painted
        const kept = discState.cursor;
        discState.cursor = null;
        try {
          await runViaSse(sessionId, discState.q, signal);
        } catch (_) {
          discState.cursor = kept;
          // Keep GET snapshot — never blank on replay failure
          renderDiscovery();
        }
      }
      return discState;
    }

    if (preferSseTransport()) {
      try {
        await runViaSse(sessionId, discState.q, signal);
        return discState;
      } catch (sseErr) {
        if (signal && signal.aborted) throw sseErr;
        closeSse();
      }
    }
    await runViaPoll(sessionId, discState.q, signal, opts.pollAfter || 300);
    return discState;
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
        // Terminal on create — consistent snapshot already painted (no blank).
        // Optional SSE replay-from-complete for UX verify (?discoveryReplay=1).
        const wantReplay =
          params().get('discoveryReplay') === '1' || params().get('replay') === '1';
        if (wantReplay && preferSseTransport()) {
          discState.cursor = null;
          try {
            await runViaSse(sessionId, q, signal);
          } catch (_) {
            discState.transport = 'get';
            renderDiscovery();
          }
        } else {
          discState.transport = discState.transport || 'poll';
          renderDiscovery();
        }
        return discState;
      }
    } else if (created.sessionId) {
      discState.sessionId = sessionId;
      discState.q = q;
      discState.source = 'api';
      discState.status = created.status || 'running';
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
      const fullGraph = data.graph || null;
      const lifeForIdx = (idx, total) => {
        const seq = ['PLANNING', 'FAMILY', 'FINDING', 'EVIDENCE', 'FRONTIER', 'COMPLETE'];
        if (idx >= total - 1) return 'COMPLETE';
        return seq[Math.min(idx + 1, seq.length - 2)];
      };
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
            graph: fullGraph,
            gaps: data.gaps || [],
            softEr: data.softEr || null,
            contradictions: data.contradictions || [],
            stage: 'COMPLETE',
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
          const life = stage.lifeStage || lifeForIdx(idx, stages.length);
          const includeGraph = ['EVIDENCE', 'FRONTIER', 'COMPLETE', 'RELATIONSHIPS', 'GRAPH'].includes(life) || idx >= stages.length - 2;
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
              graph: includeGraph ? (stage.graph || fullGraph) : undefined,
              gaps: stage.gaps || (idx === stages.length - 1 ? data.gaps : undefined),
              softEr: data.softEr || null,
              contradictions: idx === stages.length - 1 ? (data.contradictions || []) : [],
              stage: life,
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
    const sessionParam = opts.sessionId || params().get('session') || params().get('sessionId');
    const q = String((opts.fixtureData && opts.fixtureData.q) || (input && input.value) || '').trim();
    const out = document.getElementById('out');

    function applySeedKindHint() {
      let kind = readSeedKindFromDom();
      if (opts.fixtureData && opts.fixtureData.seedKind) {
        const sk = String(opts.fixtureData.seedKind);
        if (/domain/i.test(sk)) kind = 'domain';
        else if (/org/i.test(sk)) kind = 'organization';
        else if (/url/i.test(sk)) kind = 'url';
        else if (/person|name/i.test(sk)) kind = 'name';
      } else if (q) {
        if (/^https?:\/\//i.test(q)) kind = 'url';
        else if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(q) && !/\s/.test(q)) kind = 'domain';
      }
      discState.seedKind = kind;
      document.querySelectorAll('.disc-seed-type').forEach((b) => {
        b.setAttribute('aria-pressed', b.getAttribute('data-seed-kind') === kind ? 'true' : 'false');
      });
    }

    // Open existing / already-complete session — no Seed required
    if (sessionParam && !opts.forceFixture && !opts.fixtureData) {
      clearDiscTimers();
      if (discAbort) try { discAbort.abort(); } catch (_) {}
      discAbort = typeof AbortController !== 'undefined' ? new AbortController() : null;
      selectedFacets = {};
      discState = emptyState();
      graphFilter = 'all';
      resetGraphView();
    lastSseLiveText = '';
      applySeedKindHint();
      discState.status = 'running';
      discState.lifeStage = 'PLANNING';
      discState.sessionId = String(sessionParam);
      discState.source = 'api:hydrate';
      renderDiscovery();
      const go = document.getElementById('disc-go');
      const cancel = document.getElementById('disc-cancel');
      if (go) {
        go.disabled = true;
        go.textContent = 'רץ…';
      }
      if (cancel) cancel.classList.add('show');
      try {
        await hydrateSession(String(sessionParam), {
          signal: discAbort && discAbort.signal,
          replay: opts.replay === true,
          q,
        });
        if (input && discState.q && !input.value) input.value = discState.q;
      } catch (e) {
        const msg = String((e && e.message) || e || '');
        const aborted = (e && e.name === 'AbortError') || /abort/i.test(msg);
        if (out) {
          out.dataset.surface = 'discovery';
          if (aborted) {
            out.className = 'err';
            out.innerHTML = '<span class="big">CANCELLED</span>הגילוי בוטל.';
          } else {
            discState.errorMessage = `שגיאה בפתיחת session: ${msg}`;
            discState.status = 'failed_soft';
            renderDiscovery();
          }
        }
      } finally {
        if (go) {
          go.disabled = false;
          go.textContent = 'גלה';
        }
        if (cancel) cancel.classList.remove('show');
      }
      return;
    }

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
    graphFilter = 'all';
    resetGraphView();
    lastSseLiveText = '';
    applySeedKindHint();
    discState.status = 'running';
    discState.lifeStage = 'PLANNING';
    discState.stageSource = 'client';
    discState._focusResultsOnce = false;
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
        if (aborted) {
          out.className = 'err';
          out.innerHTML = '<span class="big">CANCELLED</span>הגילוי בוטל.';
        } else {
          discState.errorMessage = `שגיאה בגילוי: ${msg}`;
          discState.status = 'failed_soft';
          renderDiscovery();
        }
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
    const go = document.getElementById('disc-go');
    const cancel = document.getElementById('disc-cancel');
    if (go) {
      go.disabled = false;
      go.textContent = 'גלה';
    }
    if (cancel) cancel.classList.remove('show');
  }

  function bindDiscoveryChrome() {
    const entMore = document.getElementById('entity-more-toggle');
    const entPanel = document.getElementById('entity-more');
    if (entMore && entPanel) {
      entMore.onclick = () => {
        const open = entPanel.hasAttribute('hidden');
        if (open) entPanel.removeAttribute('hidden');
        else entPanel.setAttribute('hidden', '');
        entMore.setAttribute('aria-expanded', open ? 'true' : 'false');
      };
    }
    const tabEnt = document.getElementById('tab-entity');
    const tabDisc = document.getElementById('tab-discovery');
    if (tabEnt) tabEnt.onclick = () => setMode('entity');
    if (tabDisc) tabDisc.onclick = () => setMode('discovery');
    // Tablist keyboard: Left/Right/Home/End (a11y)
    const tablist = document.querySelector('.mode-tabs[role="tablist"]');
    if (tablist && tabEnt && tabDisc) {
      const tabs = [tabEnt, tabDisc];
      tablist.addEventListener('keydown', (e) => {
        const i = tabs.indexOf(document.activeElement);
        if (i < 0) return;
        let next = -1;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          next = e.key === 'ArrowLeft' ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next < 0) return;
        e.preventDefault();
        tabs[next].focus();
        tabs[next].click();
      });
    }
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
    // Seed-type chips + examples (product home)
    document.querySelectorAll('.disc-seed-type').forEach((btn) => {
      btn.onclick = () => {
        const kind = btn.getAttribute('data-seed-kind') || 'name';
        discState.seedKind = kind;
        document.querySelectorAll('.disc-seed-type').forEach((b) => {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        const input = document.getElementById('disc-q');
        if (input && SEED_PLACEHOLDERS[kind]) {
          input.placeholder = SEED_PLACEHOLDERS[kind];
          if (kind === 'url' || kind === 'domain') input.setAttribute('dir', 'ltr');
          else input.removeAttribute('dir');
        }
      };
    });
    document.querySelectorAll('.disc-example').forEach((btn) => {
      btn.onclick = () => {
        const ex = btn.getAttribute('data-example') || '';
        const kind = btn.getAttribute('data-kind') || 'other';
        const input = document.getElementById('disc-q');
        if (input) input.value = ex;
        discState.seedKind = kind;
        document.querySelectorAll('.disc-seed-type').forEach((b) => {
          b.setAttribute('aria-pressed', b.getAttribute('data-seed-kind') === kind ? 'true' : 'false');
        });
        if (SEED_PLACEHOLDERS[kind] && input) input.placeholder = SEED_PLACEHOLDERS[kind];
      };
    });

    // Intercept Entity Mode go when somehow visible — no-op; entity handlers stay.
    populateFixtureChips();
    applyModeChrome();

    // Deep-link: ?mode=discovery&session=<id>[&replay=1] — open complete/running session
    if (isDiscoveryMode() && (params().get('session') || params().get('sessionId'))) {
      startDiscovery({
        sessionId: params().get('session') || params().get('sessionId'),
        replay: params().get('replay') === '1' || params().get('discoveryReplay') === '1',
      }).catch(() => {});
    }

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
    hydrateSession,
    fetchSessionSnapshot,
    isTerminalStatus,
    deriveLifeStage,
    computeGaps,
    LIFE_STAGES,
    MISSION_STAGES,
    stopReasonCopy,
    hasFrontierData,
    missionWave,
    serverEmitsConflict,
    ingestMissionFields,
  };
})();
