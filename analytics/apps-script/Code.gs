/**
 * Convenience Store — playtest logger.
 *
 * Receives batches of rows from the game and appends them to two tabs of the
 * bound spreadsheet: "events" (one row per choice) and "runs" (one row per
 * playthrough). Headers are created on first write and new fields are appended
 * as new columns automatically, so you never have to maintain them by hand.
 *
 * Setup: see analytics/README.md.
 */

// Must match VITE_ANALYTICS_TOKEN in the game's .env / Vercel env vars.
// This only deters casual junk — the token ships inside a public JS bundle.
var TOKEN = 'CHANGE_ME';

// Leave '' when this script lives inside the sheet (Extensions → Apps Script),
// which is the normal setup. If the script is standalone, or you ever want it
// to write to a specific sheet, paste that sheet's id here — it's the long
// string in its URL: docs.google.com/spreadsheets/d/<THIS_PART>/edit
var SPREADSHEET_ID = '';

function book() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error(
      'No bound spreadsheet. This script is standalone — set SPREADSHEET_ID ' +
      'at the top of Code.gs to the id of the sheet you want to write to.'
    );
  }
  return ss;
}

// The "plays" tab: one row per playthrough, one column per decision scene
// holding the option that player picked, then the stats they ended on.
// In story order. Scenes with a single "Continue" button aren't decisions and
// don't get a column. A blank cell means that scene never came up — e.g. an
// empty membership_2 means they joined the Savers Club at the first ask.
var DECISION_SCENES = [
  'membership_1', 'membership_2', 'membership_3', 'bread', 'maggi', 'rice',
  'produce', 'vicks', 'eggs', 'crossroads', 'gate', 'register'
];

var PLAYS_HEAD = ['ts', 'run_id', 'browser_id', 'completed', 'last_scene'];
var PLAYS_TAIL = [
  'final_coins', 'final_dignity', 'final_time_left', 'overspent', 'subtotal',
  'joined_club', 'nags_refused', 'choices_made', 'run_ms'
];

// Columns pinned to the front of each sheet, in this order. Anything else the
// client sends is appended to the right in the order it first appears.
var LEAD_COLUMNS = {
  events: [
    'ts', 'run_id', 'browser_id', 'seq', 'event', 'scene',
    'choice_number', 'choice_index', 'choice_label', 'option_count', 'is_decision',
    'delta_coins', 'delta_time', 'delta_dignity',
    'coins_after', 'time_left_after', 'dignity_after',
    'deliberation_ms', 'run_ms'
  ],
  runs: [
    'ts', 'run_id', 'browser_id', 'event', 'completed', 'run_ms', 'choices_made',
    'final_coins', 'final_time_left', 'final_dignity', 'overspent', 'subtotal',
    'joined_club', 'nags_refused', 'bought_bread', 'bought_maggi', 'bought_rice',
    'bought_apples', 'bought_vicks', 'bought_eggs', 'bought_chocolate',
    'took_express', 'paid_gate_fee', 'paid_drip_fees', 'sneak_compliance',
    'last_scene', 'path'
  ]
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json({ ok: false, error: 'busy' });
  }

  try {
    var payload = JSON.parse(e.postData.contents);
    if (TOKEN && payload.token !== TOKEN) return json({ ok: false, error: 'bad token' });

    var rows = payload.rows || [];
    if (!rows.length) return json({ ok: true, written: 0 });
    if (rows.length > 200) rows = rows.slice(0, 200);

    // Group by target tab so each sheet is touched once per batch.
    var groups = {};
    var plays = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var name = row.sheet === 'runs' ? 'runs' : 'events';
      delete row.sheet;
      row.received_at = new Date().toISOString();

      // Every finished-or-abandoned run also becomes one wide "plays" row.
      // picks is consumed here so it never lands in the runs tab as a blob.
      if (name === 'runs') {
        plays.push(playRow(row, row.picks || {}));
        delete row.picks;
      }

      (groups[name] = groups[name] || []).push(row);
    }

    var written = 0;
    for (var sheetName in groups) {
      written += appendRows(sheetName, groups[sheetName]);
    }
    if (plays.length) written += appendPlays(plays);
    return json({ ok: true, written: written });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Sanity-check the deployment by opening the /exec URL in a browser.
 * Add ?token=YOUR_TOKEN to also get the exact spreadsheet it writes to and
 * the row count of every tab — the fastest way to find data that "vanished".
 */
// "Where you stand" on the end screen compares a player's dignity with
// everyone else's. Only finished runs since the current dignity scoring
// went live count: older runs used a different scale.
var STATS_SINCE = new Date('2026-10-13T00:00:00Z');
var STATS_CACHE_SECONDS = 120;

// GET ?stats=dignity -> { ok, total, counts: { "35": 4, ... } }
// Aggregate counts only, so it needs no token and exposes no rows.
function dignityStats() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get('dignity-stats');
  if (hit) return JSON.parse(hit);

  var out = { ok: true, total: 0, counts: {} };
  var sheet = book().getSheetByName('runs');
  if (sheet && sheet.getLastRow() > 1) {
    var values = sheet.getDataRange().getValues();
    var head = values[0];
    var col = function (name) { return head.indexOf(name); };
    var cTs = col('ts'), cEvent = col('event'), cDone = col('completed'), cDig = col('final_dignity');
    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      if (cEvent >= 0 && row[cEvent] !== 'run_end') continue;
      if (cDone >= 0 && Number(row[cDone]) !== 1) continue;
      var ts = row[cTs] instanceof Date ? row[cTs] : new Date(String(row[cTs]));
      if (!(ts >= STATS_SINCE)) continue;
      var d = Number(row[cDig]);
      if (row[cDig] === '' || isNaN(d)) continue;
      d = Math.max(0, Math.min(100, Math.round(d)));
      out.counts[d] = (out.counts[d] || 0) + 1;
      out.total += 1;
    }
  }
  cache.put('dignity-stats', JSON.stringify(out), STATS_CACHE_SECONDS);
  return out;
}

function doGet(e) {
  if (e && e.parameter && e.parameter.stats === 'dignity') {
    try {
      return json(dignityStats());
    } catch (err) {
      return json({ ok: false, error: String(err) });
    }
  }

  var out = { ok: true, service: 'convenience-store-analytics' };
  var token = e && e.parameter ? e.parameter.token : null;

  if (TOKEN && token === TOKEN) {
    try {
      var ss = book();
      out.spreadsheet_name = ss.getName();
      out.spreadsheet_id = ss.getId();
      out.spreadsheet_url = ss.getUrl();
      out.bound = !SPREADSHEET_ID;
      out.tabs = ss.getSheets().map(function (s) {
        return { name: s.getName(), rows: s.getLastRow(), columns: s.getLastColumn() };
      });
    } catch (err) {
      out.ok = false;
      out.error = String(err);
    }
  }
  return json(out);
}

// Flatten one run into the wide shape: identity, then a cell per decision
// scene, then how they ended up.
function playRow(row, picks) {
  var out = {};
  for (var i = 0; i < PLAYS_HEAD.length; i++) out[PLAYS_HEAD[i]] = row[PLAYS_HEAD[i]];
  for (var s = 0; s < DECISION_SCENES.length; s++) {
    var scene = DECISION_SCENES[s];
    out[scene] = picks[scene] === undefined ? '' : picks[scene];
  }
  for (var t = 0; t < PLAYS_TAIL.length; t++) out[PLAYS_TAIL[t]] = row[PLAYS_TAIL[t]];
  return out;
}

// The plays tab has a fixed, hand-chosen column order, so it gets its own
// writer rather than the auto-widening one used by events/runs.
function appendPlays(rows) {
  var ss = book();
  var sheet = ss.getSheetByName('plays');
  if (!sheet) sheet = ss.insertSheet('plays');

  var header = PLAYS_HEAD.concat(DECISION_SCENES).concat(PLAYS_TAIL);
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);

  var matrix = rows.map(function (row) {
    return header.map(function (col) {
      var v = row[col];
      return (v === undefined || v === null) ? '' : v;
    });
  });

  sheet.getRange(sheet.getLastRow() + 1, 1, matrix.length, header.length).setValues(matrix);
  return matrix.length;
}

function appendRows(sheetName, rows) {
  var ss = book();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  var header = sheet.getLastRow() > 0
    ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0].filter(String)
    : [];

  if (!header.length) header = (LEAD_COLUMNS[sheetName] || []).slice();

  // Widen the header for any field we haven't seen before.
  var known = {};
  for (var h = 0; h < header.length; h++) known[header[h]] = true;
  for (var i = 0; i < rows.length; i++) {
    for (var key in rows[i]) {
      if (!known[key]) { header.push(key); known[key] = true; }
    }
  }

  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  sheet.setFrozenRows(1);

  var matrix = rows.map(function (row) {
    return header.map(function (col) {
      var v = row[col];
      if (v === undefined || v === null) return '';
      // Long paths would otherwise be read as formulas / dates by Sheets.
      return typeof v === 'object' ? JSON.stringify(v) : v;
    });
  });

  sheet.getRange(sheet.getLastRow() + 1, 1, matrix.length, header.length).setValues(matrix);
  return matrix.length;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
