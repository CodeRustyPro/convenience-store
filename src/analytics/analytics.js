// Playtest telemetry: one row per choice, one summary row per playthrough.
//
// Rows are POSTed to a Google Apps Script web app (see analytics/apps-script/
// Code.gs) which appends them to a Google Sheet you can download as .xlsx.
// Everything is anonymous — a random run id and a random browser id, no PII.
//
// The site is static, so there is no server to hide anything behind: the
// endpoint URL ships in the bundle. The shared token below is a spam speed
// bump, not authentication. Treat the sheet as public-writable in principle.
//
// Config (Vite env, set in .env.local and in Vercel → Settings → Environment):
//   VITE_ANALYTICS_URL    — the Apps Script /exec URL. Unset = logging off.
//   VITE_ANALYTICS_TOKEN  — must match TOKEN in Code.gs.
//
// Nothing here is allowed to break the game: every call is wrapped so a dead
// endpoint, a blocked request or a full localStorage just no-ops.

// Guarded so this module also runs outside Vite (e.g. the node smoke test).
const ENV = import.meta.env || {};
const ENDPOINT = ENV.VITE_ANALYTICS_URL || '';
const TOKEN = ENV.VITE_ANALYTICS_TOKEN || '';
const APP_VERSION = ENV.VITE_APP_VERSION || 'dev';

const FLUSH_DEBOUNCE_MS = 2500;   // batch chatty events instead of one POST each
const MAX_BATCH = 40;
const PENDING_KEY = 'cs_analytics_pending';   // rows not yet accepted by the sheet
const ARCHIVE_KEY = 'cs_analytics_archive';   // local mirror, for CSV export
const BROWSER_KEY = 'cs_analytics_browser';   // stable-ish anonymous browser id
const OPTOUT_KEY = 'cs_analytics_optout';
const ARCHIVE_LIMIT = 400;

let queue = [];
let flushTimer = null;
let seq = 0;
let run = null;   // { id, startedAt, choices: [], lastFrameAt }

// The story engine registers a getter here so an abandoned run can still
// record where the player stood when they left. Kept as a callback rather
// than an import so analytics doesn't have to depend on the engine.
let snapshotSource = null;

function snapshot() {
  try { return snapshotSource ? snapshotSource() : null; } catch { return null; }
}

/* ---------------------------------------------------------------- storage */

function ls(fn, fallback) {
  try { return fn(window.localStorage); } catch { return fallback; }
}

function readJson(key, fallback) {
  return ls((s) => {
    const raw = s.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }, fallback);
}

function writeJson(key, value) {
  ls((s) => s.setItem(key, JSON.stringify(value)));
}

function randomId() {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID().slice(0, 18);
  } catch {}
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function browserId() {
  let id = ls((s) => s.getItem(BROWSER_KEY), null);
  if (!id) {
    id = randomId();
    ls((s) => s.setItem(BROWSER_KEY, id));
  }
  return id;
}

export function isEnabled() {
  if (ls((s) => s.getItem(OPTOUT_KEY), null) === '1') return false;
  return Boolean(ENDPOINT);
}

/* -------------------------------------------------------------- transport */

function post(rows, useBeacon) {
  if (!ENDPOINT || !rows.length) return Promise.resolve(false);
  const body = JSON.stringify({ token: TOKEN, rows });

  // text/plain keeps this a CORS "simple request" — no preflight, which
  // Apps Script does not answer.
  if (useBeacon && navigator.sendBeacon) {
    try {
      const ok = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain;charset=utf-8' }));
      return Promise.resolve(ok);
    } catch { /* fall through to fetch */ }
  }

  return fetch(ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',                       // response is opaque; we can't read it
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body,
    keepalive: true,
  }).then(() => true).catch(() => false);
}

// Rows that failed to send are parked in localStorage and retried on the next
// flush — including on the visitor's next visit.
function stash(rows) {
  const pending = readJson(PENDING_KEY, []);
  writeJson(PENDING_KEY, pending.concat(rows).slice(-200));
}

async function flush({ beacon = false } = {}) {
  clearTimeout(flushTimer);
  flushTimer = null;
  if (!isEnabled()) { queue = []; return; }

  const pending = readJson(PENDING_KEY, []);
  writeJson(PENDING_KEY, []);
  const rows = pending.concat(queue).slice(-MAX_BATCH * 4);
  queue = [];
  if (!rows.length) return;

  for (let i = 0; i < rows.length; i += MAX_BATCH) {
    const batch = rows.slice(i, i + MAX_BATCH);
    // no-cors gives an opaque response, so a network-level failure is all we
    // can detect; anything else we consider delivered.
    const ok = await post(batch, beacon);
    if (!ok) stash(batch);
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => flush(), FLUSH_DEBOUNCE_MS);
}

/* ------------------------------------------------------------------ rows */

function context() {
  const w = typeof window === 'undefined' ? null : window;
  return {
    browser_id: browserId(),
    app_version: APP_VERSION,
    viewport: w ? `${w.innerWidth}x${w.innerHeight}` : '',
    touch: w && w.matchMedia?.('(hover: none) and (pointer: coarse)').matches ? 1 : 0,
    language: navigator?.language || '',
    referrer: (typeof document !== 'undefined' && document.referrer) || '',
    ua: navigator?.userAgent || '',
  };
}

function emit(row) {
  const full = { ts: new Date().toISOString(), seq: (seq += 1), ...context(), ...row };
  archive(full);
  if (!isEnabled()) return full;
  queue.push(full);
  if (queue.length >= MAX_BATCH) flush();
  else scheduleFlush();
  return full;
}

function archive(row) {
  const list = readJson(ARCHIVE_KEY, []);
  list.push(row);
  writeJson(ARCHIVE_KEY, list.slice(-ARCHIVE_LIMIT));
}

/* ------------------------------------------------------------ public API */

export const analytics = {
  /** Called once when a playthrough begins (title screen → first scene). */
  startRun() {
    run = { id: randomId(), startedAt: Date.now(), choices: [], lastFrameAt: Date.now() };
    emit({ sheet: 'events', event: 'run_start', run_id: run.id });
  },

  /** Stamp the moment a new frame is on screen, so we can time deliberation. */
  markFrame() {
    if (run) run.lastFrameAt = Date.now();
  },

  /**
   * One row per decision.
   * @param {object} p
   * @param {string} p.scene       ink knot name (e.g. "bread")
   * @param {number} p.choiceIndex 0-based index as shown on screen
   * @param {string} p.choiceLabel visible button text
   * @param {number} p.optionCount how many options this scene offered
   * @param {object} p.effects     { coins, time, standing } deltas from the tag
   * @param {object} p.before      game state before the choice applied
   * @param {object} p.after       game state after the choice applied
   */
  choice({ scene, choiceIndex, choiceLabel, optionCount, effects = {}, before = {}, after = {} }) {
    if (!run) return;   // e.g. the "Shop again?" click after the run was closed
    const now = Date.now();
    run.choices.push({ scene, label: choiceLabel, optionCount });
    emit({
      sheet: 'events',
      event: 'choice',
      run_id: run.id,
      scene,
      choice_index: choiceIndex,
      choice_label: choiceLabel,
      option_count: optionCount,
      // Single-option scenes are just "Continue" pacing clicks — their
      // deliberation_ms is read time, not decision time. Filter on this.
      is_decision: optionCount > 1 ? 1 : 0,
      choice_number: run.choices.length,
      delta_coins: effects.coins ?? 0,
      delta_time: effects.time ?? 0,
      delta_dignity: effects.standing ?? 0,
      coins_before: before.coins,
      coins_after: after.coins,
      time_left_before: before.timeSeconds,
      time_left_after: after.timeSeconds,
      dignity_before: before.standing,
      dignity_after: after.standing,
      deliberation_ms: now - (run.lastFrameAt || now),
      run_ms: now - run.startedAt,
    });
    run.lastFrameAt = now;
  },

  /**
   * One summary row per playthrough, written when the final screen appears.
   * @param {object} state  the game store snapshot
   * @param {object} vars   ink variables (joinedClub, subtotal, ...)
   */
  endRun(state = {}, vars = {}) {
    if (!run) return;
    emit({
      sheet: 'runs',
      event: 'run_end',
      completed: 1,
      last_scene: 'final',
      ...summary(state, vars),
    });
    flush();
    run = null;
  },

  /** Fired when the tab goes away mid-run — tells us where people drop off. */
  abandon() {
    if (!run) return;
    const snap = snapshot() || {};
    const last = run.choices[run.choices.length - 1];
    emit({
      sheet: 'runs',
      event: 'run_abandon',
      completed: 0,
      last_scene: last ? last.scene : 'intro',
      ...summary(snap.state || {}, snap.vars || {}),
    });
    run = null;
  },

  /** Called by the story engine so abandoned runs can still be described. */
  provideSnapshot(fn) {
    snapshotSource = fn;
  },

  flush,

  /* ---- local fallback / debugging, reachable as window.CSAnalytics ---- */

  rows: () => readJson(ARCHIVE_KEY, []),

  csv() {
    const rows = readJson(ARCHIVE_KEY, []);
    if (!rows.length) return '';
    const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
    const cell = (v) => {
      if (v === undefined || v === null) return '';
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n');
  },

  downloadCsv(filename = 'convenience-store-playtests.csv') {
    const blob = new Blob([this.csv()], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },

  clearLocal() {
    ls((s) => { s.removeItem(ARCHIVE_KEY); s.removeItem(PENDING_KEY); });
  },

  optOut(on = true) {
    ls((s) => (on ? s.setItem(OPTOUT_KEY, '1') : s.removeItem(OPTOUT_KEY)));
  },
};

// Shared shape for both run_end and run_abandon, so a drop-off row describes
// the player's state just as fully as a completed one.
function summary(state = {}, vars = {}) {
  const flags = state.flags || {};
  return {
    run_id: run.id,
    run_ms: Date.now() - run.startedAt,
    choices_made: run.choices.length,
    final_coins: state.coins,
    final_time_left: state.timeSeconds,
    final_dignity: state.standing,
    overspent: typeof state.coins === 'number' && state.coins < 0 ? 1 : 0,
    subtotal: vars.subtotal,
    joined_club: vars.joinedClub ? 1 : 0,
    nags_refused: vars.nagsRefused,
    bought_bread: vars.boughtBread,
    bought_maggi: vars.boughtMaggi,
    bought_rice: vars.boughtRice,
    bought_apples: vars.boughtApples,
    bought_vicks: vars.boughtVicks,
    bought_eggs: vars.boughtEggs,
    bought_chocolate: vars.boughtChocolate ? 1 : 0,
    took_express: vars.tookExpress ? 1 : 0,
    paid_gate_fee: vars.paidGateFee ? 1 : 0,
    paid_drip_fees: vars.paidDripFees ? 1 : 0,
    sneak_compliance: vars.sneakCompliance,
    sneaked_care: flags.sneakedCare ? 1 : 0,
    path: run.choices.map((c) => `${c.scene}:${c.label}`).join(' | '),
    // { scene: label } for real decisions only — drives the wide "plays" tab,
    // one column per scene. Single-option "Continue" clicks are left out; they
    // aren't choices. Consumed and removed server-side, so it never becomes a
    // column of its own.
    picks: run.choices.reduce((acc, c) => {
      if (c.optionCount > 1) acc[c.scene] = c.label;
      return acc;
    }, {}),
  };
}

/* --------------------------------------------------------------- wire-up */

if (typeof window !== 'undefined') {
  // ?notrack=1 disables logging for this browser (useful while you playtest).
  try {
    if (new URLSearchParams(location.search).get('notrack') === '1') analytics.optOut(true);
  } catch {}

  window.CSAnalytics = analytics;

  // Retry anything left over from a previous visit.
  setTimeout(() => flush(), 1500);

  // pagehide is the reliable "tab is going away" signal on iOS Safari too.
  window.addEventListener('pagehide', () => {
    analytics.abandon();
    flush({ beacon: true });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush({ beacon: true });
  });
}
