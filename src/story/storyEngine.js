// Wraps the inkjs runtime. Compiles the Ink source on init, exposes a
// reactive "current frame" (text + choices + scene metadata) and routes
// choice clicks back into the story while applying effects.

import { writable, get } from 'svelte/store';
import { Compiler } from 'inkjs/full';
import { game } from '../stores/game.js';
import { analytics } from '../analytics/analytics.js';
import { STORY_INK } from './source.ink.js';

const frame = writable({
  sceneId: 0,
  title: null,
  lines: [],
  choices: [],
  bg: 'paper',
  character: 'none',
  events: [],
  phone: null,        // latest phone notification text (one-shot per scene)
  ended: false,
});

// One-shot UI signals (overlay flags). Components listen and clear.
export const ui = writable({
  showReceipt: false,
  showFinal: false,
  phoneBuzz: 0,       // monotonically-increasing trigger counter
  dignityRelabel: false,
});

let inkStory = null;
let sceneCounter = 0;

function parseEffects(body) {
  const out = {};
  body.split(',').forEach((pair) => {
    const [k, v] = pair.split('=').map((s) => s.trim());
    if (!k || v === undefined) return;
    const num = parseFloat(v);
    if (!Number.isNaN(num)) out[k] = num;
  });
  return out;
}

// Parse one-or-more comma-separated flags: "a=1, b=true, c" -> [{key,value}]
// A bare key with no "=" is treated as true.
function parseFlags(body) {
  const out = [];
  body.split(',').forEach((pair) => {
    const [k, vRaw] = pair.split('=').map((s) => s.trim());
    if (!k) return;
    let value;
    if (vRaw === undefined || vRaw === '') value = true;
    else if (vRaw === 'true')              value = true;
    else if (vRaw === 'false')             value = false;
    else if (!isNaN(parseFloat(vRaw)))     value = parseFloat(vRaw);
    else                                   value = vRaw;
    out.push({ key: k, value });
  });
  return out;
}

function parseTag(raw) {
  const t = raw.trim();
  if (t.startsWith('fx:'))        return { type: 'fx', payload: parseEffects(t.slice(3)) };
  if (t.startsWith('bg:'))        return { type: 'bg', payload: t.slice(3).trim() };
  if (t.startsWith('character:')) return { type: 'character', payload: t.slice(10).trim() };
  if (t.startsWith('title:'))     return { type: 'title', payload: t.slice(6).trim() };
  if (t.startsWith('phone:'))     return { type: 'phone', payload: t.slice(6).trim() };
  if (t.startsWith('flag:'))      return { type: 'flag', payload: parseFlags(t.slice(5)) };
  if (t.startsWith('event:'))     return { type: 'event', payload: t.slice(6).trim() };
  if (t.startsWith('style:'))     return { type: 'style', payload: t.slice(6).trim() };
  if (t === 'noClock')            return { type: 'noClock' };
  if (t === 'startClock')         return { type: 'startClock' };
  if (t === 'ending')             return { type: 'ending' };
  if (t === 'final')              return { type: 'final' };
  return { type: 'unknown', payload: t };
}

// Ink knot the player is standing in, for analytics. A choice's sourcePath
// looks like "bread.0.21", so the first segment is the knot name.
function knotOf(choice) {
  const path = choice?.sourcePath || '';
  return path.split('.')[0] || 'unknown';
}

// Snapshot of the story's VARs, for the end-of-run summary row.
const TRACKED_VARS = [
  'joinedClub', 'sneakCompliance', 'boughtBread', 'boughtMaggi', 'boughtRice',
  'boughtApples', 'boughtVicks', 'boughtEggs', 'boughtChocolate', 'tookExpress',
  'paidGateFee', 'addedFiller', 'paidDripFees', 'subtotal', 'nagsRefused',
];

function inkVariables() {
  const out = {};
  if (!inkStory) return out;
  for (const name of TRACKED_VARS) {
    try { out[name] = inkStory.variablesState.$(name); } catch {}
  }
  return out;
}

// Lets the analytics module describe a run that was abandoned mid-shop with
// the same detail as a completed one.
analytics.provideSnapshot(() => ({ state: get(game), vars: inkVariables() }));

function fireEvent(name) {
  switch (name) {
    case 'relabelDignity':
      game.relabelStanding('DIGNITY');
      ui.update((u) => ({ ...u, dignityRelabel: true }));
      break;
    case 'showReceipt':
      ui.update((u) => ({ ...u, showReceipt: true }));
      break;
  }
}

function advance() {
  if (!inkStory) return;

  // Mirror game.standing into Ink so adaptive knots can branch on it.
  const gs = get(game);
  try { inkStory.variablesState.$('standing', gs.standing); } catch {}
  // And what's been paid so far, for lines that quote it (the gate).
  try { inkStory.variablesState.$('spent', 500 - gs.coins); } catch {}

  const lines = [];          // [{ text, kind: 'dialogue' | 'narration' }]
  let bg = null;
  let character = null;
  let title = null;
  let phone = null;
  const events = [];

  while (inkStory.canContinue) {
    const text = inkStory.Continue().trim();
    const tags = inkStory.currentTags || [];
    let lineEffects = null;
    let lineKind = 'dialogue';

    for (const raw of tags) {
      const tag = parseTag(raw);
      switch (tag.type) {
        case 'fx':         lineEffects = { ...(lineEffects || {}), ...tag.payload }; break;
        case 'bg':         bg = tag.payload; break;
        case 'character':  character = tag.payload; break;
        case 'title':      title = tag.payload; break;
        case 'phone':
          phone = tag.payload;
          break;
        case 'flag':       for (const f of tag.payload) game.setFlag(f.key, f.value); break;
        case 'event':      events.push(tag.payload); fireEvent(tag.payload); break;
        case 'noClock':    game.pause(); break;
        case 'startClock': game.resume(); game.startClock(); break;
        case 'final':
          ui.update((u) => ({ ...u, showFinal: true }));
          analytics.endRun(get(game), inkVariables());
          break;
        case 'unknown':
          // bare tags without a colon (e.g. 'narration')
          if (tag.payload === 'narration') lineKind = 'narration';
          break;
      }
    }

    if (lineEffects) game.applyEffects(lineEffects);
    if (text) lines.push({ text, kind: lineKind });
  }

  const choices = (inkStory.currentChoices || []).map((c, i) => {
    const choiceTags = c.tags || [];
    let effects = null;
    let style = 'default';
    for (const raw of choiceTags) {
      const tag = parseTag(raw);
      if (tag.type === 'fx')    effects = { ...(effects || {}), ...tag.payload };
      if (tag.type === 'style') style = tag.payload;
    }
    return { index: i, label: c.text, style, effects };
  });

  const ended = !inkStory.canContinue && choices.length === 0;
  if (ended) game.end();

  sceneCounter += 1;
  frame.update((prev) => ({
    sceneId: sceneCounter,
    title,
    lines,
    choices,
    bg: bg ?? prev.bg,
    character: character ?? prev.character,
    events,
    phone,
    ended,
  }));

  // Buzz AFTER the frame is committed so PhoneNotification reads the
  // fresh phone text via story.current() (not the previous frame's).
  if (phone) ui.update((u) => ({ ...u, phoneBuzz: u.phoneBuzz + 1 }));

  // Start the deliberation clock for the choices now on screen.
  analytics.markFrame();
}

function chooseIndex(i) {
  if (!inkStory) return;
  const choice = inkStory.currentChoices[i];
  const tags = choice?.tags || [];
  const before = get(game);
  let effects = null;
  for (const raw of tags) {
    const tag = parseTag(raw);
    if (tag.type === 'fx')   { effects = { ...(effects || {}), ...tag.payload }; game.applyEffects(tag.payload); }
    if (tag.type === 'flag') for (const f of tag.payload) game.setFlag(f.key, f.value);
  }

  analytics.choice({
    scene: knotOf(choice),
    choiceIndex: i,
    choiceLabel: choice?.text ?? '',
    optionCount: inkStory.currentChoices.length,
    effects: effects || {},
    before,
    after: get(game),
  });

  inkStory.ChooseChoiceIndex(i);
  advance();
}

export const story = {
  subscribe: frame.subscribe,
  current: () => get(frame),
  async init() {
    const compiler = new Compiler(STORY_INK);
    inkStory = compiler.Compile();
    analytics.startRun();
    advance();
  },
  choose: chooseIndex,
  getInkVariable(name) {
    if (!inkStory) return undefined;
    // inkjs's bracket access is a TS-only declaration; the actual JS API is $()
    return inkStory.variablesState.$(name);
  },
  reset() {
    game.reset();
    ui.set({ showReceipt: false, showFinal: false, phoneBuzz: 0, dignityRelabel: false });
    if (inkStory) inkStory.ResetState();
    analytics.startRun();   // a replay is a separate run, same browser id
    advance();
  },
};
