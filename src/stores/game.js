// Reactive game state: coins, time, standing.
// Standing is revealed as DIGNITY at the guard scene.
// Using Svelte 5 runes via a singleton class-based store.

import { writable } from 'svelte/store';

const INITIAL = {
  coins: 500,
  timeSeconds: 15 * 60,
  standing: 100,
  standingLabel: 'STANDING', // morphs to 'DIGNITY' at the guard
  itemsBought: [],
  itemsDropped: [],
  basket: [], // {id, label, sneaked: bool, hidden: bool, price}
  flags: {}, // arbitrary Ink-driven flags (joinedClub, sneakCompliance, etc.)
  ended: false,
  paused: true, // pauses time during intro / guard
};

function createGameStore() {
  const { subscribe, set, update } = writable({ ...INITIAL });

  let tickHandle = null;

  function startClock() {
    if (tickHandle) return;
    tickHandle = setInterval(() => {
      update((s) => {
        if (s.paused || s.ended) return s;
        const next = Math.max(0, s.timeSeconds - 1);
        return { ...s, timeSeconds: next };
      });
    }, 1000);
  }

  function stopClock() {
    if (tickHandle) {
      clearInterval(tickHandle);
      tickHandle = null;
    }
  }

  return {
    subscribe,
    reset: () => set({ ...INITIAL }),
    startClock,
    stopClock,
    pause: () => update((s) => ({ ...s, paused: true })),
    resume: () => update((s) => ({ ...s, paused: false })),
    applyEffects(effects = {}) {
      update((s) => {
        const next = { ...s };
        // Wallet may go negative — overspending is the point; the HUD
        // shows the shortfall rather than silently flooring at zero.
        if (typeof effects.coins === 'number') next.coins = s.coins + effects.coins;
        if (typeof effects.time === 'number') next.timeSeconds = Math.max(0, s.timeSeconds + effects.time);
        if (typeof effects.standing === 'number') next.standing = Math.max(0, Math.min(100, s.standing + effects.standing));
        return next;
      });
    },
    addToBasket(item) {
      update((s) => ({ ...s, basket: [...s.basket, item] }));
    },
    removeFromBasket(predicate) {
      update((s) => ({ ...s, basket: s.basket.filter((it) => !predicate(it)) }));
    },
    markItemBought(itemId) {
      update((s) => ({ ...s, itemsBought: [...s.itemsBought, itemId] }));
    },
    markItemDropped(itemId) {
      update((s) => ({ ...s, itemsDropped: [...s.itemsDropped, itemId] }));
    },
    setFlag(key, value) {
      update((s) => ({ ...s, flags: { ...s.flags, [key]: value } }));
    },
    relabelStanding(label) {
      update((s) => ({ ...s, standingLabel: label }));
    },
    end: () => update((s) => ({ ...s, ended: true, paused: true })),
  };
}

export const game = createGameStore();

// Derived helpers
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Standing → pose bucket (0..4) for the figure asset swap
export function standingToPose(standing) {
  if (standing >= 90) return 0; // upright
  if (standing >= 70) return 1; // slight slouch
  if (standing >= 45) return 2; // stooped
  if (standing >= 20) return 3; // hunched
  return 4; // folded
}
